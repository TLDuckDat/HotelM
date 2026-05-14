(function (global) {
    "use strict";

    // ── State ──
    let allUsers = [];
    let searchKeyword = "";

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
        
        if (type === "error") {
            box.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTimeout(function () { 
            box.style.opacity = "0";
            setTimeout(() => {
                box.style.display = "none";
                box.style.opacity = "1";
            }, 500);
        }, 5000);
    }

    function showConfirm(title, text, onConfirm) {
        const modal = document.getElementById("confirm-modal");
        const titleEl = document.getElementById("confirm-title");
        const textEl = document.getElementById("confirm-text");
        const okBtn = document.getElementById("confirm-ok-btn");
        const cancelBtn = document.getElementById("confirm-cancel-btn");

        if (!modal || !titleEl || !textEl || !okBtn || !cancelBtn) {
            if (confirm(text)) onConfirm();
            return;
        }

        const isVi = global.localStorage.getItem("sot_lang") === "vi";
        titleEl.textContent = title;
        textEl.textContent = text;
        okBtn.textContent = isVi ? "Xác nhận" : "Confirm";
        cancelBtn.textContent = isVi ? "Hủy bỏ" : "Cancel";
        
        modal.style.display = "flex";

        const cleanup = () => {
            modal.style.display = "none";
            okBtn.onclick = null;
            cancelBtn.onclick = null;
        };

        okBtn.onclick = () => {
            cleanup();
            onConfirm();
        };
        cancelBtn.onclick = cleanup;
        
        // Close on overlay click
        modal.onclick = (e) => {
            if (e.target === modal) cleanup();
        };
    }

    function roleBadge(role) {
        var r = (role || "").toUpperCase();
        var cls = r === "ADMIN" ? "badge-admin" : "badge-user";
        return "<span class='badge " + cls + "'>" + (role || "—") + "</span>";
    }

    function statusBadge(status) {
        var s = (status || "").toUpperCase();
        var cls = "badge-user"; // default
        if (s === "ACTIVE") cls = "status-available-badge";
        if (s === "BANNED") cls = "status-cancelled-badge";
        if (s === "INACTIVE") cls = "status-maintenance-badge";

        return "<span class='badge " + cls + "'>" + (status || "—") + "</span>";
    }

    // ── Render ──

    function renderUsers() {
        var body = document.getElementById("admin-users-body");
        if (!body) return;

        const filtered = allUsers.filter(u => {
            const name = (u.fullName || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const kw = searchKeyword.toLowerCase();
            return name.includes(kw) || email.includes(kw);
        });

        if (filtered.length === 0) {
            const emptyMsg = searchKeyword 
                ? (global.localStorage.getItem("sot_lang") === "vi" ? "Không tìm thấy người dùng nào khớp với tìm kiếm" : "No users match your search")
                : (global.localStorage.getItem("sot_lang") === "vi" ? "Không tìm thấy người dùng nào" : "No users found");
            body.innerHTML = "<tr><td colspan='7' class='table-empty'>" + emptyMsg + "</td></tr>";
            return;
        }

        const currentUser = global.AuthStore ? global.AuthStore.getCurrentUser() : null;
        const currentUserId = currentUser ? (currentUser.userId || currentUser.userID || currentUser.id) : null;

        body.innerHTML = filtered.map(function (user) {
            var id = user.userId || user.userID || user.id || "";
            var currentRole = (user.role || "USER").toUpperCase();
            var currentStatus = (user.status || "ACTIVE").toUpperCase();
            var isSelf = id === currentUserId;

            // Tạo dropdown đổi role
            var roleOptions = ["USER", "ADMIN", "RECEPTIONIST"].map(function (r) {
                return "<option value='" + r + "'" + (currentRole === r ? " selected" : "") + ">" + r + "</option>";
            }).join("");

            // Tạo dropdown đổi status
            var statusOptions = ["ACTIVE", "INACTIVE", "BANNED"].map(function (s) {
                return "<option value='" + s + "'" + (currentStatus === s ? " selected" : "") + ">" + s + "</option>";
            }).join("");

            return "<tr>"
                + "<td style='max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap' title='" + id + "'>"
                + id.substring(0, 8) + "…</td>"
                + "<td><strong>" + (user.fullName || "Unnamed") + "</strong></td>"
                + "<td>" + (user.email || "") + "</td>"
                + "<td>" + roleBadge(user.role) + "</td>"
                + "<td>" + statusBadge(user.status) + "</td>"
                + "<td>"
                + "<div style='display:flex; gap:8px; align-items:center; flex-wrap:wrap'>"
                + "<div style='display:flex; flex-direction:column; gap:4px'>"
                + "<select class='form-input role-select' data-user-id='" + id + "' style='width:120px; padding:4px 8px; font-size:0.75rem'>"
                + roleOptions
                + "</select>"
                + "<select class='form-input status-select' data-user-id='" + id + "' style='width:120px; padding:4px 8px; font-size:0.75rem'>"
                + statusOptions
                + "</select>"
                + "</div>"
                + "<button class='btn-confirm btn-user-save' data-user-id='" + id + "' data-user-name='" + (user.fullName || "") + "' style='height:fit-content; padding:10px'>"
                + "<i class='fas fa-check'></i>"
                + "</button>"
                + "  </div>"
                + "</td>"
                + "<td>"
                + (isSelf
                    ? "<span class='text-muted' style='font-size:0.75rem; font-style:italic'>" + (global.localStorage.getItem("sot_lang") === "vi" ? "Phiên hiện tại" : "Current Session") + "</span>"
                    : "<button class='btn-delete' data-delete-user='" + id + "' data-user-name='" + (user.fullName || "") + "'>"
                    + "<i class='fas fa-trash-alt'></i> Delete"
                    + "</button>")
                + "</td>"
                + "</tr>";
        }).join("");

        if (typeof applyTranslations === 'function') {
            applyTranslations(global.localStorage.getItem('sot_lang') || 'en');
        }
    }

    // ── API calls ──

    function loadUsers() {
        var body = document.getElementById("admin-users-body");
        if (body && body.innerHTML.includes("Loading")) {
            // keep current if already loading
        } else if (body) {
            body.innerHTML = "<tr><td colspan='7' class='table-empty'><i class='fas fa-spinner fa-spin'></i> <span data-i18n='loading_text'>Loading…</span></td></tr>";
        }

        global.UserApi.getUsers().then(function (users) {
            allUsers = users || [];
            renderUsers();
        }).catch(function (error) {
            const defaultMsg = global.localStorage.getItem("sot_lang") === "vi" ? "Không thể tải danh sách người dùng" : "Cannot load users";
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : defaultMsg;
            setMessage(msg, "error");
        });
    }

    function saveUserChanges(userId, userName, newRole, newStatus) {
        if (!userId) return;

        const promises = [];

        // Cập nhật Role nếu khác
        const user = allUsers.find(u => (u.userId || u.userID || u.id) === userId);
        if (user && user.role !== newRole) {
            promises.push(global.HotelMApiBase.patch("/users/" + encodeURIComponent(userId) + "/role", { role: newRole }));
        }

        // Cập nhật Status nếu khác
        if (user && user.status !== newStatus) {
            promises.push(global.UserApi.updateUserStatus(userId, newStatus));
        }

        if (promises.length === 0) return;

        Promise.all(promises).then(function () {
            const successMsg = global.localStorage.getItem("sot_lang") === "vi" 
                ? "✅ Đã cập nhật " + (userName || userId) + " thành công"
                : "✅ Updated " + (userName || userId) + " successfully";
            setMessage(successMsg, "success");
            loadUsers();
        }).catch(function (error) {
            const defaultError = global.localStorage.getItem("sot_lang") === "vi" ? "Cập nhật thất bại" : "Update failed";
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : defaultError;
            setMessage("❌ " + msg, "error");
        });
    }

    function deleteUser(userId, userName) {
        if (!userId) return;

        const isVi = global.localStorage.getItem("sot_lang") === "vi";
        const title = isVi ? "Xóa người dùng" : "Delete User";
        const text = isVi
            ? "Bạn có chắc chắn muốn xóa người dùng '" + (userName || userId) + "'? Hành động này không thể hoàn tác."
            : "Are you sure you want to delete user '" + (userName || userId) + "'? This action cannot be undone.";

        showConfirm(title, text, function() {
            global.UserApi.deleteUser(userId).then(function () {
                const successMsg = isVi
                    ? "✅ Người dùng '" + (userName || userId) + "' đã được xóa."
                    : "✅ User '" + (userName || userId) + "' has been removed.";
                setMessage(successMsg, "success");
                loadUsers();
            }).catch(function (error) {
                const defaultError = isVi ? "Xóa người dùng thất bại" : "Delete user failed";
                var msg = error && error.payload && error.payload.message
                    ? error.payload.message : defaultError;
                setMessage("❌ " + msg, "error");
            });
        });
    }

    // ── Events ──

    function initEvents() {
        const searchInput = document.getElementById("user-search");
        if (searchInput) {
            searchInput.addEventListener("input", function (e) {
                searchKeyword = e.target.value;
                renderUsers();
            });
        }

        const body = document.getElementById("admin-users-body");
        if (body) {
            body.addEventListener("click", function (e) {
                const deleteBtn = e.target.closest(".btn-delete");
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute("data-delete-user");
                    const name = deleteBtn.getAttribute("data-user-name");
                    deleteUser(id, name);
                    return;
                }

                const saveBtn = e.target.closest(".btn-user-save");
                if (saveBtn) {
                    const id = saveBtn.getAttribute("data-user-id");
                    const name = saveBtn.getAttribute("data-user-name");
                    const roleSelect = body.querySelector(".role-select[data-user-id='" + id + "']");
                    const statusSelect = body.querySelector(".status-select[data-user-id='" + id + "']");
                    const newRole = roleSelect ? roleSelect.value : null;
                    const newStatus = statusSelect ? statusSelect.value : null;
                    saveUserChanges(id, name, newRole, newStatus);
                    return;
                }
            });
        }
        
        window.addEventListener('languageChanged', () => {
            renderUsers();
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

        initEvents();
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