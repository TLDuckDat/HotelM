(function (global) {
    "use strict";

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        box.className = type || "notice";
        box.textContent = text;
        box.style.display = "block";
    }

    function renderUsers(users) {
        var body = document.getElementById("admin-users-body");
        body.innerHTML = (users || []).map(function (user) {
            return "<tr>"
                + "<td>" + (user.userID || "") + "</td>"
                + "<td>" + (user.fullName || "") + "</td>"
                + "<td>" + (user.email || "") + "</td>"
                + "<td>" + (user.role || "") + "</td>"
                + "<td><button class='secondary' data-delete-user='" + user.userID + "'>Delete</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-delete-user]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteUser(btn.getAttribute("data-delete-user"));
            });
        });
    }

    function renderBookings(bookings) {
        var body = document.getElementById("admin-bookings-body");
        body.innerHTML = (bookings || []).map(function (booking) {
            return "<tr>"
                + "<td>" + (booking.bookingID || "") + "</td>"
                + "<td>" + (booking.user ? booking.user.fullName : "") + "</td>"
                + "<td>" + (booking.room ? booking.room.roomName : "") + "</td>"
                + "<td>" + (booking.status || "") + "</td>"
                + "<td><button class='secondary' data-confirm='" + booking.bookingID + "'>Set CONFIRMED</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-confirm]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                updateBooking(btn.getAttribute("data-confirm"), "CONFIRMED");
            });
        });
    }

    function loadData() {
        Promise.all([
            global.UserApi.getUsers(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            renderUsers(result[0]);
            renderBookings(result[1]);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cannot load admin data";
            setMessage(msg, "error");
        });
    }

    function deleteUser(userId) {
        global.UserApi.deleteUser(userId).then(function () {
            setMessage("User deleted", "success");
            loadData();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Delete user failed";
            setMessage(msg, "error");
        });
    }

    function updateBooking(bookingId, status) {
        global.BookingApi.updateBookingStatus(bookingId, status).then(function () {
            setMessage("Booking updated", "success");
            loadData();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Update booking failed";
            setMessage(msg, "error");
        });
    }

    function init() {
        if (!global.Guard.requireAdmin()) {
            return;
        }

        global.AppShell.renderTopbar("Admin Dashboard");
        loadData();
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

