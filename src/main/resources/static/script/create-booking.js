(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("create-booking-message");
        if (!el) return;
        el.className = "message-box " + (type || "info");
        el.textContent = text;
    }

    function getRoomId(room) {
        return room.roomID || room.id || "";
    }

    function getRoomName(room) {
        return room.roomName || room.name || "Unnamed room";
    }

    function loadUser() {
        if (!global.Guard.requireLogin()) return null;

        var user = global.AuthStore.getCurrentUser();
        if (!user) {
            window.location.href = "login.html";
            return null;
        }

        document.getElementById("topbar-username").textContent = user.fullName || "Guest";
        document.getElementById("sidebar-username").textContent = user.fullName || "Guest";
        document.getElementById("sidebar-role").textContent = user.role || "USER";
        return user;
    }

    function readInitialRoomId() {
        var params = new URLSearchParams(window.location.search);
        return params.get("roomId") || "";
    }

    function loadRoomOptions() {
        var select = document.getElementById("roomId");
        if (!select) return Promise.resolve();

        return global.RoomApi.getRooms().then(function (rooms) {
            var data = rooms || [];
            if (!data.length) {
                select.innerHTML = "<option value=''>No room available</option>";
                return;
            }

            select.innerHTML = data.map(function (room) {
                var id = getRoomId(room);
                var roomName = getRoomName(room);
                var status = room.status || "UNKNOWN";
                return "<option value='" + id + "'>" + roomName + " (" + status + ")</option>";
            }).join("");

            var initialRoomId = readInitialRoomId();
            if (initialRoomId) {
                var hasRoom = data.some(function (room) { return getRoomId(room) === initialRoomId; });
                if (hasRoom) {
                    select.value = initialRoomId;
                }
            }
        });
    }

    function validateTime(checkInValue, checkOutValue) {
        var checkIn = new Date(checkInValue);
        var checkOut = new Date(checkOutValue);

        if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
            return "Check-in and check-out are required.";
        }

        if (checkIn >= checkOut) {
            return "Check-out must be after check-in.";
        }

        return "";
    }

    function submitBooking(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        if (!user || !user.userID) {
            setMessage("You must login before creating booking.", "error");
            return;
        }

        var roomId = document.getElementById("roomId").value;
        var checkIn = document.getElementById("checkIn").value;
        var checkOut = document.getElementById("checkOut").value;
        var note = document.getElementById("note").value.trim();

        var timeError = validateTime(checkIn, checkOut);
        if (timeError) {
            setMessage(timeError, "error");
            return;
        }

        var payload = {
            userId: user.userID,
            roomId: roomId,
            checkIn: checkIn,
            checkOut: checkOut,
            note: note
        };

        setMessage("Creating booking...", "info");

        global.BookingApi.createBooking(payload)
            .then(function () {
                setMessage("Booking created successfully.", "success");
                setTimeout(function () {
                    window.location.href = "bookings.html";
                }, 700);
            })
            .catch(function (err) {
                var msg = err && err.payload
                    ? (err.payload.message || err.payload.error || "Cannot create booking")
                    : "Cannot create booking";
                setMessage(msg, "error");
            });
    }

    function handleLogout() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = "login.html";
    }

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    document.addEventListener("DOMContentLoaded", function () {
        if (!loadUser()) return;

        loadRoomOptions().catch(function () {
            setMessage("Cannot load room list.", "error");
        });

        var form = document.getElementById("create-booking-form");
        if (form) {
            form.addEventListener("submit", submitBooking);
        }
    });

    global.CreateBookingPage = {
        handleLogout: handleLogout
    };
})(window);

