(function (global) {
    "use strict";

    var userMap = {}; // { "1": "Nguyen Van A" }
    var roomMap = {}; // { "101": "Phòng Deluxe" }

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
    }

    function statusBadge(status) {
        var cls = {
            CONFIRMED: "badge-confirmed",
            CANCELLED: "badge-cancelled",
            PENDING: "badge-pending",
            AVAILABLE: "badge-available",
            BOOKED: "badge-booked"
        }[status] || "badge-user";
        return "<span class='badge " + cls + "'>" + (status || "—") + "</span>";
    }

    // ── Render ──

    function renderBookings(bookings) {
        var body = document.getElementById("admin-bookings-body");
        if (!body) return;

        if (!bookings || bookings.length === 0) {
            body.innerHTML = "<tr><td colspan='5' class='table-empty'>No bookings found</td></tr>";
            return;
        }

        body.innerHTML = bookings.map(function (booking) {
            var bId = booking.bookingID || booking.bookingId || booking.id || "";

            var guestName = (booking.user && booking.user.fullName)
                || userMap[booking.userId || booking.userID]
                || (booking.userId ? booking.userId.substring(0,8) : "N/A");

            var rName = (booking.room && booking.room.roomName)
                || roomMap[booking.roomId || booking.roomID]
                || booking.roomId
                || "N/A";

            var status = (booking.status || "PENDING").toUpperCase();

            return "<tr>"
                + "<td><code style='font-size:.85rem;color:#555'>#" + bId.substring(0,8).toUpperCase() + "</code></td>"
                + "<td>" + guestName + "</td>"
                + "<td>" + rName + "</td>"
                + "<td>" + statusBadge(status) + "</td>"
                + "<td>"
                + "  <button class='btn-confirm' data-status='CONFIRMED' data-booking='" + bId + "'><i class='fas fa-check'></i> Confirm</button> "
                + "  <button class='btn-cancel'  data-status='CANCELLED' data-booking='" + bId + "'><i class='fas fa-times'></i> Cancel</button>"
                + "</td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-booking]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                updateBooking(btn.getAttribute("data-booking"), btn.getAttribute("data-status"));
            });
        });
    }

    // ── API calls ──

    function loadData() {
        return Promise.all([
            global.UserApi.getUsers(),
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ]).then(function (result) {
            var users = result[0] || [];
            var rooms = result[1] || [];
            var bookings = result[2] || [];

            // Build lookup maps
            users.forEach(function (u) {
                var id = u.userID || u.id || "";
                userMap[id] = u.fullName || u.name || "Unknown User";
            });
            rooms.forEach(function (r) {
                var id = r.roomID || r.roomId || r.id || "";
                roomMap[id] = r.roomName || r.name || ("Room " + id);
            });

            renderBookings(bookings);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Cannot load bookings";
            setMessage(msg, "error");
        });
    }

    function updateBooking(bookingId, status) {
        if (!bookingId || !status) return;

        global.BookingApi.updateBookingStatus(bookingId, status).then(function () {
            setMessage("Booking updated to " + status, "success");
            loadData();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Update booking failed";
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

        global.AppShell.renderTopbar("Booking Management");

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

    global.AdminBookings = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);