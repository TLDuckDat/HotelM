(function (global) {
    "use strict";

    function renderTopbar(title) {
        var host = document.getElementById("app-topbar");
        if (!host) {
            return;
        }

        var user = global.AuthStore ? global.AuthStore.getCurrentUser() : null;
        var role = user && user.role ? user.role : "GUEST";
        var name = user && user.fullName ? user.fullName : "Guest";

        host.innerHTML = ""
            + "<div class='topbar'>"
            + "  <div><strong>HotelM</strong> - " + title + "</div>"
            + "  <div>"
            + "    <span class='badge'>" + name + " (" + role + ")</span>"
            + "    <a href='index.html'>Home</a>"
            + "    <a href='dashboard.html'>Dashboard</a>"
            + "    <a href='rooms.html'>Rooms</a>"
            + "    <a href='bookings.html'>Bookings</a>"
            + "    <a href='account.html'>Account</a>"
            + "    <a href='admin-dashboard.html'>Admin</a>"
            + "    <button id='logout-btn' type='button'>Logout</button>"
            + "  </div>"
            + "</div>";

        var logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                if (global.AuthStore) {
                    global.AuthStore.clearCurrentUser();
                }
                window.location.href = "login.html";
            });
        }
    }

    global.AppShell = {
        renderTopbar: renderTopbar
    };
})(window);

