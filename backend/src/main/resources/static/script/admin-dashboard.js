(function (global) {
    "use strict";

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = type || "notice";
        box.textContent = text;
        box.style.display = "block";
    }

    function roomId(room) {
        return room.roomID || room.id || "";
    }

    function roomName(room) {
        return room.roomName || room.name || "";
    }

    function renderStats(users, rooms, bookings) {
        document.getElementById("admin-stat-users").textContent = String((users || []).length);
        document.getElementById("admin-stat-rooms").textContent = String((rooms || []).length);
        document.getElementById("admin-stat-bookings").textContent = String((bookings || []).length);

        var pending = (bookings || []).filter(function (b) {
            return b.status === "PENDING";
        }).length;
        document.getElementById("admin-stat-pending").textContent = String(pending);
    }

    function renderUsers(users) {
        var body = document.getElementById("admin-users-body");
        if (!body) return;

        body.innerHTML = (users || []).map(function (user) {
            return "<tr>"
                + "<td>" + (user.userID || "") + "</td>"
                + "<td>" + (user.fullName || "") + "</td>"
                + "<td>" + (user.email || "") + "</td>"
                + "<td>" + (user.role || "") + "</td>"
                + "<td><button class='secondary' data-delete-user='" + (user.userID || "") + "'>Delete</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-delete-user]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteUser(btn.getAttribute("data-delete-user"));
            });
        });
    }

    function renderRooms(rooms) {
        var body = document.getElementById("admin-rooms-body");
        if (!body) return;

        body.innerHTML = (rooms || []).map(function (room) {
            var id = roomId(room);
            return "<tr>"
                + "<td>" + id + "</td>"
                + "<td>" + roomName(room) + "</td>"
                + "<td>" + (room.maxCapacity || 0) + "</td>"
                + "<td>" + (room.status || "") + "</td>"
                + "<td><button class='secondary' data-delete-room='" + id + "'>Delete</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-delete-room]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteRoom(btn.getAttribute("data-delete-room"));
            });
        });
    }

    function renderBookings(bookings) {
        var body = document.getElementById("admin-bookings-body");
        if (!body) return;

        body.innerHTML = (bookings || []).map(function (booking) {
            var id = booking.bookingID || "";
            return "<tr>"
                + "<td>" + id + "</td>"
                + "<td>" + (booking.user ? booking.user.fullName : "") + "</td>"
                + "<td>" + (booking.room ? booking.room.roomName : "") + "</td>"
                + "<td>" + (booking.status || "") + "</td>"
                + "<td>"
                + "  <button class='secondary' data-status='CONFIRMED' data-booking='" + id + "'>Confirm</button> "
                + "  <button class='secondary' data-status='CANCELLED' data-booking='" + id + "'>Cancel</button>"
                + "</td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-booking]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                updateBooking(btn.getAttribute("data-booking"), btn.getAttribute("data-status"));
            });
        });
    }

    function loadData() {
        return Promise.all([
            global.UserApi.getUsers(),
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            var users = result[0] || [];
            var rooms = result[1] || [];
            var bookings = result[2] || [];

            renderStats(users, rooms, bookings);
            renderUsers(users);
            renderRooms(rooms);
            renderBookings(bookings);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Cannot load admin data";
            setMessage(msg, "error");
        });
    }

    function deleteUser(userId) {
        if (!userId) return;

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

    function createRoom(event) {
        event.preventDefault();

        var payload = {
            roomName: document.getElementById("admin-room-name").value.trim(),
            maxCapacity: Number(document.getElementById("admin-room-capacity").value),
            description: document.getElementById("admin-room-desc").value.trim(),
            status: document.getElementById("admin-room-status").value
        };

        if (!payload.roomName || !payload.maxCapacity) {
            setMessage("Room name and capacity are required", "error");
            return;
        }

        global.RoomApi.createRoom(payload).then(function () {
            setMessage("Room created", "success");
            document.getElementById("admin-create-room-form").reset();
            loadData();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message
                : "Create room failed";
            setMessage(msg, "error");
        });
    }

    function deleteRoom(roomIdValue) {
        if (!roomIdValue) return;

        global.RoomApi.deleteRoom(roomIdValue).then(function () {
            setMessage("Room deleted", "success");
            loadData();
        }).catch(function (error) {
            var msg = error && error.status === 405
                ? "Backend does not support DELETE /rooms/{id} yet."
                : (error && error.payload && error.payload.message
                    ? error.payload.message
                    : "Delete room failed");
            setMessage(msg, "error");
        });
    }

    function updateBooking(bookingId, status) {
        if (!bookingId || !status) return;

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

        var roomForm = document.getElementById("admin-create-room-form");
        if (roomForm) {
            roomForm.addEventListener("submit", createRoom);
        }

        loadData();
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

