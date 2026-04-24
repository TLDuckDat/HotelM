(function (global) {
    "use strict";

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
    }

    function roleBadge(role) {
        var cls = (role || "").toUpperCase() === "ADMIN" ? "badge-admin" : "badge-user";
        return "<span class='badge " + cls + "'>" + (role || "—") + "</span>";
    }

    // ── Render ──

    function renderUsers(users) {
        var body = document.getElementById("admin-users-body");
        if (!body) return;

        if (!users || users.length === 0) {
            body.innerHTML = "<tr><td colspan='5' class='table-empty'>No users found</td></tr>";
            return;
        }

        body.innerHTML = users.map(function (user) {
            var id = user.userID || user.id || "";
            return "<tr>"
                + "<td>" + id + "</td>"
                + "<td>" + (user.fullName || "") + "</td>"
                + "<td>" + (user.email || "") + "</td>"
                + "<td>" + roleBadge(user.role) + "</td>"
                + "<td><button class='btn-delete' data-i18n='admin_users_btn_delete' data-delete-user='" + id + "'>"
                + "<i class='fas fa-trash-alt'></i> <span data-i18n='admin_users_btn_delete'>Delete</span></button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-delete-user]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteUser(btn.getAttribute("data-delete-user"));
            });
        });
    }

    // ── API calls ──

    function loadUsers() {
        global.UserApi.getUsers().then(function (users) {
            renderUsers(users);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Cannot load users";
            setMessage(msg, "error");
        });
    }

    function deleteUser(userId) {
        if (!userId) return;

        global.UserApi.deleteUser(userId).then(function () {
            setMessage("User deleted", "success");
            loadUsers();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Delete user failed";
            setMessage(msg, "error");
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
            var topbarEl = document.getElementById("topbar-username");
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            if (topbarEl) topbarEl.textContent = user.fullName || "Admin";
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
        }

        loadUsers();
    }

    document.addEventListener("DOMContentLoaded", init);

    // ── Public API ──

    global.AdminUsers = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);