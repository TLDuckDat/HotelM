(function (global) {
    "use strict";

    function renderStats(users, rooms, bookings) {
        document.getElementById("stat-users").textContent = String((users || []).length);
        document.getElementById("stat-rooms").textContent = String((rooms || []).length);
        document.getElementById("stat-bookings").textContent = String((bookings || []).length);

        var pending = (bookings || []).filter(function (b) {
            return b.status === "PENDING";
        }).length;

        document.getElementById("stat-pending").textContent = String(pending);
    }

    function loadDashboard() {
        if (!global.Guard.requireLogin()) {
            return;
        }

        global.AppShell.renderTopbar("Dashboard");

        Promise.all([
            global.UserApi.getUsers(),
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            renderStats(result[0], result[1], result[2]);
        }).catch(function (error) {
            var box = document.getElementById("dashboard-error");
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cannot load dashboard data";
            box.textContent = msg;
            box.style.display = "block";
        });
    }

    document.addEventListener("DOMContentLoaded", loadDashboard);
})(window);

