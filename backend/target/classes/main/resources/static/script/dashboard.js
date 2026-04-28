(function (global) {
    "use strict";

    function loadDashboard() {
        if (!global.Guard.requireLogin()) return;

        Promise.all([
            global.UserApi.getUsers(),
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (results) {
            const [users, rooms, bookings] = results;

            document.getElementById('stat-users').textContent = (users || []).length;
            document.getElementById('stat-rooms').textContent = (rooms || []).length;
            document.getElementById('stat-bookings').textContent = (bookings || []).length;

            const pending = (bookings || []).filter(b => b.status === 'PENDING').length;
            document.getElementById('stat-pending').textContent = pending;
        }).catch(function (err) {
            const msg = err?.payload?.message || 'Cannot load dashboard data';
            const el = document.getElementById('dashboard-message');
            if (el) {
                el.className = 'message-box error';
                el.textContent = msg;
            }
        });
    }

    function renderUserUI() {
        const user = window.AuthStore?.getCurrentUser();
        if (!user) return;

        const topbarName = document.getElementById('topbar-username');
        const sidebarName = document.getElementById('sidebar-username');
        const sidebarRole = document.getElementById('sidebar-role');

        if (topbarName) topbarName.textContent = user.fullName || 'Guest';
        if (sidebarName) sidebarName.textContent = user.fullName || 'Guest';
        if (sidebarRole) sidebarRole.textContent = user.role || 'USER';
    }

    function handleLogout() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = 'index.html';
    }

    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    };

    window.closeSidebar = function () {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    };

    function renderUserUI() {
        const user = window.AuthStore?.getCurrentUser();
        if (!user) return;

        const topbarName = document.getElementById('topbar-username');
        const sidebarName = document.getElementById('sidebar-username');
        const sidebarRole = document.getElementById('sidebar-role');

        if (topbarName) topbarName.textContent = user.fullName || 'Guest';
        if (sidebarName) sidebarName.textContent = user.fullName || 'Guest';
        if (sidebarRole) sidebarRole.textContent = user.role || 'USER';
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadDashboard();
        renderUserUI();
    });

})(window);

// (function (global) {
//     "use strict";

//     function renderStats(users, rooms, bookings) {
//         document.getElementById("stat-users").textContent = String((users || []).length);
//         document.getElementById("stat-rooms").textContent = String((rooms || []).length);
//         document.getElementById("stat-bookings").textContent = String((bookings || []).length);

//         var pending = (bookings || []).filter(function (b) {
//             return b.status === "PENDING";
//         }).length;

//         document.getElementById("stat-pending").textContent = String(pending);
//     }

//     function loadDashboard() {
//         if (!global.Guard.requireLogin()) {
//             return;
//         }

//         global.AppShell.renderTopbar("Dashboard");

//         Promise.all([
//             global.UserApi.getUsers(),
//             global.RoomApi.getRooms(),
//             global.BookingApi.getBookings()
//         ]).then(function (result) {
//             renderStats(result[0], result[1], result[2]);
//         }).catch(function (error) {
//             var box = document.getElementById("dashboard-error");
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Cannot load dashboard data";
//             box.textContent = msg;
//             box.style.display = "block";
//         });
//     }

//     document.addEventListener("DOMContentLoaded", loadDashboard);
// })(window);

