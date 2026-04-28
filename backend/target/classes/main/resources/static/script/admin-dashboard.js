(function (global) {
    "use strict";

    // ── Shared UI helpers (reused across pages via copy, or extracted to admin-shared.js) ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
    }

    // ── Stats ──

    function renderStats(users, rooms, bookings) {
        document.getElementById("admin-stat-users").textContent = String((users || []).length);
        document.getElementById("admin-stat-rooms").textContent = String((rooms || []).length);
        document.getElementById("admin-stat-bookings").textContent = String((bookings || []).length);
        var pending = (bookings || []).filter(function (b) { return b.status === "PENDING"; }).length;
        document.getElementById("admin-stat-pending").textContent = String(pending);
    }

    function loadData() {
        return Promise.all([
            global.UserApi.getUsers(),
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            renderStats(result[0] || [], result[1] || [], result[2] || []);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Cannot load dashboard data";
            setMessage(msg, "error");
        });
    }

    // ── Sidebar / Notification (shared UI behaviour) ──

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

        global.AppShell.renderTopbar("Admin Dashboard");

        var user = global.AuthStore.getCurrentUser();
        if (user) {
            var topbarEl = document.getElementById("topbar-username");
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            if (topbarEl) topbarEl.textContent = user.fullName || "Admin";
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
        }

        loadData();
    }

    document.addEventListener("DOMContentLoaded", init);

    // ── Public API ──

    global.AdminDashboard = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);