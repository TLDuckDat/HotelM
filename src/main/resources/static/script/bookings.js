(function (global) {
    "use strict";

    var roomsCache = [];

    function formatDate(value) {
        if (!value) {
            return "";
        }

        return String(value).replace("T", " ");
    }

    function renderBookings(bookings) {
        var user = global.AuthStore.getCurrentUser();
        var isAdmin = user && user.role === "ADMIN";
        var filtered = (bookings || []).filter(function (item) {
            if (isAdmin) {
                return true;
            }

            return item.user && item.user.userID === user.userID;
        });

        var body = document.getElementById("bookings-body");
        if (!filtered.length) {
            body.innerHTML = "<tr><td colspan='7'>No bookings found</td></tr>";
            return;
        }

        body.innerHTML = filtered.map(function (booking) {
            return "<tr>"
                + "<td>" + (booking.bookingID || "") + "</td>"
                + "<td>" + (booking.user ? booking.user.fullName : "") + "</td>"
                + "<td>" + (booking.room ? booking.room.roomName : "") + "</td>"
                + "<td>" + formatDate(booking.checkIn) + "</td>"
                + "<td>" + formatDate(booking.checkOut) + "</td>"
                + "<td><span class='badge'>" + (booking.status || "") + "</span></td>"
                + "<td><button class='secondary' data-cancel='" + (booking.bookingID || "") + "'>Cancel</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-cancel]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                cancelBooking(btn.getAttribute("data-cancel"));
            });
        });
    }

    function loadRoomOptions() {
        var select = document.getElementById("roomId");
        select.innerHTML = roomsCache.map(function (room) {
            return "<option value='" + room.roomID + "'>" + room.roomName + "</option>";
        }).join("");
    }

    function setMessage(text, type) {
        var box = document.getElementById("bookings-message");
        box.className = type || "notice";
        box.textContent = text;
        box.style.display = "block";
    }

    function loadBookings() {
        global.BookingApi.getBookings().then(renderBookings).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cannot load bookings";
            setMessage(msg, "error");
        });
    }

    function cancelBooking(id) {
        global.BookingApi.cancelBooking(id).then(function () {
            setMessage("Booking cancelled", "success");
            loadBookings();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cancel booking failed";
            setMessage(msg, "error");
        });
    }

    function submitCreateBooking(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        var payload = {
            userId: user.userID,
            roomId: document.getElementById("roomId").value,
            checkIn: document.getElementById("checkIn").value,
            checkOut: document.getElementById("checkOut").value,
            note: document.getElementById("note").value
        };

        global.BookingApi.createBooking(payload).then(function () {
            setMessage("Booking created", "success");
            event.target.reset();
            loadBookings();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Create booking failed";
            setMessage(msg, "error");
        });
    }

    function init() {
        if (!global.Guard.requireLogin()) {
            return;
        }

        global.AppShell.renderTopbar("Booking List");

        Promise.all([
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            roomsCache = result[0] || [];
            loadRoomOptions();
            renderBookings(result[1] || []);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cannot load booking data";
            setMessage(msg, "error");
        });

        document.getElementById("create-booking-form").addEventListener("submit", submitCreateBooking);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

