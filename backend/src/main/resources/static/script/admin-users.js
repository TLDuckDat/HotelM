(function (global) {
    "use strict";

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
        setTimeout(function () { box.style.display = "none"; }, 3000);
    }

    function roleBadge(role) {
        var r = (role || "").toUpperCase();
        var cls = r === "ADMIN" ? "badge-admin" : "badge-user";
        return "<span class='badge " + cls + "'>" + (role || "—") + "</span>";
    }

    // ── Render ──

    function renderUsers(users) {
        var body = document.getElementById("admin-users-body");
        if (!body) return;

        if (!users || users.length === 0) {
            body.innerHTML = "<tr><td colspan='6' class='table-empty'>No users found</td></tr>";
            return;
        }

        body.innerHTML = users.map(function (user) {
            var id = user.userId || user.userID || user.id || "";
            var currentRole = (user.role || "USER").toUpperCase();

            // Tạo dropdown đổi role
            var roleOptions = ["USER", "ADMIN"].map(function (r) {
                return "<option value='" + r + "'" + (currentRole === r ? " selected" : "") + ">" + r + "</option>";
            }).join("");

            return "<tr>"
                + "<td style='max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap' title='" + id + "'>"
                + id.substring(0, 8) + "…</td>"
                + "<td>" + (user.fullName || "") + "</td>"
                + "<td>" + (user.email || "") + "</td>"
                + "<td>" + roleBadge(user.role) + "</td>"
                + "<td>"
                +   "<div style='display:flex; gap:8px; align-items:center; flex-wrap:wrap'>"
                +     "<select class='form-input role-select' data-user-id='" + id + "' style='width:140px; padding:6px 10px; font-size:0.82rem'>"
                +       roleOptions
                +     "</select>"
                +     "<button class='btn-primary btn-role-save' data-user-id='" + id + "' data-user-name='" + (user.fullName || "") + "' style='padding:6px 12px; font-size:0.82rem'>"
                +       "<i class='fas fa-check'></i> Save"
                +     "</button>"
                + "  </div>"
                + "</td>"
                + "<td>"
                +   "<button class='btn-delete' data-delete-user='" + id + "' style='padding:6px 12px; font-size:0.82rem'>"
                +     "<i class='fas fa-trash-alt'></i> Delete"
                +   "</button>"
                + "</td>"
                + "</tr>";
        }).join("");

        // Gắn event cho nút Save role
        body.querySelectorAll(".btn-role-save").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var userId   = btn.getAttribute("data-user-id");
                var userName = btn.getAttribute("data-user-name");
                var select   = body.querySelector(".role-select[data-user-id='" + userId + "']");
                var newRole  = select ? select.value : null;
                if (newRole) updateRole(userId, newRole, userName);
            });
        });

        // Gắn event cho nút Delete
        body.querySelectorAll("button[data-delete-user]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteUser(btn.getAttribute("data-delete-user"));
            });
        });
    }

    // ── API calls ──

    function loadUsers() {
        var body = document.getElementById("admin-users-body");
        if (body) body.innerHTML = "<tr><td colspan='6' class='table-empty'><i class='fas fa-spinner fa-spin'></i> Loading…</td></tr>";

        global.UserApi.getUsers().then(function (users) {
            renderUsers(users);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Cannot load users";
            setMessage(msg, "error");
        });
    }

    function updateRole(userId, newRole, userName) {
        if (!userId || !newRole) return;

        // Gọi PATCH /users/{id}/role
        global.HotelMApiBase.patch(
            "/users/" + encodeURIComponent(userId) + "/role",
            { role: newRole }
        ).then(function () {
            setMessage("✅ Updated " + (userName || userId) + " → " + newRole, "success");
            loadUsers(); // Reload để cập nhật badge
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Update role failed";
            setMessage("❌ " + msg, "error");
        });
    }

    function deleteUser(userId) {
        if (!userId) return;
        if (!confirm("Are you sure you want to delete this user?")) return;

        global.UserApi.deleteUser(userId).then(function () {
            setMessage("✅ User deleted", "success");
            loadUsers();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Delete user failed";
            setMessage("❌ " + msg, "error");
        });
    }

    // ── Sidebar / Notification ──

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    window.toggleNotification = function (e) {
        e.stopPropagation();
        var menu = document.getElementById("notificationMenu");
        if (menu) menu.classList.toggle("active");
    };

    document.addEventListener("click", function (e) {
        var dropdown = document.querySelector(".notification-dropdown");
        if (dropdown && !dropdown.contains(e.target)) {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });

    // ── Init ──

    function init() {
        if (!global.Guard.requireAdmin()) return;

        global.AppShell.renderTopbar("User Management");

        var user = global.AuthStore.getCurrentUser();
        if (user) {
            var topbarEl  = document.getElementById("topbar-username");
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            if (topbarEl)   topbarEl.textContent  = user.fullName || "Admin";
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
        }

        loadUsers();
    }

    document.addEventListener("DOMContentLoaded", init);

    global.AdminUsers = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);