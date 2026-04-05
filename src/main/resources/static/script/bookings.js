(function (global) {
    "use strict";

    function badge(status) {
        const map = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled' };
        const cls = map[(status || '').toUpperCase()] || 'badge-pending';
        return `<span class="badge ${cls}">${status || ''}</span>`;
    }

    function formatDate(v) {
        return v ? String(v).replace('T', ' ') : '';
    }

    function msg(text, type = 'info') {
        const el = document.getElementById('bookings-message');
        if (el) {
            el.className = `message-box ${type}`;
            el.textContent = text;
        }
    }

    function renderBookings(bookings) {
        const user = global.AuthStore.getCurrentUser();
        const isAdmin = user && user.role === 'ADMIN';

        const filtered = (bookings || []).filter(b => 
            isAdmin || (b.user && b.user.userID === user.userID)
        );

        const body = document.getElementById('bookings-body');
        if (!body) return;

        if (!filtered.length) {
            body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No bookings found</td></tr>';
            return;
        }

        body.innerHTML = filtered.map(b => `
            <tr>
                <td>${b.bookingID || ''}</td>
                <td>${b.room ? b.room.roomName : ''}</td>
                <td>${formatDate(b.checkIn)}</td>
                <td>${formatDate(b.checkOut)}</td>
                <td>${badge(b.status)}</td>
                <td><button class="btn-danger" data-cancel="${b.bookingID}">Cancel</button></td>
            </tr>
        `).join('');

        body.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', () => cancelBooking(btn.dataset.cancel));
        });
    }

    function loadBookings() {
        global.BookingApi.getBookings()
            .then(renderBookings)
            .catch(err => msg(err?.payload?.message || 'Cannot load bookings', 'error'));
    }

    function cancelBooking(id) {
        global.BookingApi.cancelBooking(id)
            .then(() => {
                msg('Booking cancelled successfully', 'success');
                loadBookings();
            })
            .catch(err => msg(err?.payload?.message || 'Cancel failed', 'error'));
    }

    function handleLogout() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = 'login.html';
    }

    window.toggleSidebar = function () { /* same as before */ };
    window.closeSidebar = function () { /* same as before */ };

    document.addEventListener('DOMContentLoaded', () => {
        if (!global.Guard.requireLogin()) return;
        loadBookings();
    });

})(window);

// (function (global) {
//     "use strict";

//     var roomsCache = [];

//     function formatDate(value) {
//         if (!value) {
//             return "";
//         }

//         return String(value).replace("T", " ");
//     }

//     function renderBookings(bookings) {
//         var user = global.AuthStore.getCurrentUser();
//         var isAdmin = user && user.role === "ADMIN";
//         var filtered = (bookings || []).filter(function (item) {
//             if (isAdmin) {
//                 return true;
//             }

//             return item.user && item.user.userID === user.userID;
//         });

//         var body = document.getElementById("bookings-body");
//         if (!filtered.length) {
//             body.innerHTML = "<tr><td colspan='7'>No bookings found</td></tr>";
//             return;
//         }

//         body.innerHTML = filtered.map(function (booking) {
//             return "<tr>"
//                 + "<td>" + (booking.bookingID || "") + "</td>"
//                 + "<td>" + (booking.user ? booking.user.fullName : "") + "</td>"
//                 + "<td>" + (booking.room ? booking.room.roomName : "") + "</td>"
//                 + "<td>" + formatDate(booking.checkIn) + "</td>"
//                 + "<td>" + formatDate(booking.checkOut) + "</td>"
//                 + "<td><span class='badge'>" + (booking.status || "") + "</span></td>"
//                 + "<td><button class='secondary' data-cancel='" + (booking.bookingID || "") + "'>Cancel</button></td>"
//                 + "</tr>";
//         }).join("");

//         body.querySelectorAll("button[data-cancel]").forEach(function (btn) {
//             btn.addEventListener("click", function () {
//                 cancelBooking(btn.getAttribute("data-cancel"));
//             });
//         });
//     }

//     function loadRoomOptions() {
//         var select = document.getElementById("roomId");
//         select.innerHTML = roomsCache.map(function (room) {
//             return "<option value='" + room.roomID + "'>" + room.roomName + "</option>";
//         }).join("");
//     }

//     function setMessage(text, type) {
//         var box = document.getElementById("bookings-message");
//         box.className = type || "notice";
//         box.textContent = text;
//         box.style.display = "block";
//     }

//     function loadBookings() {
//         global.BookingApi.getBookings().then(renderBookings).catch(function (error) {
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Cannot load bookings";
//             setMessage(msg, "error");
//         });
//     }

//     function cancelBooking(id) {
//         global.BookingApi.cancelBooking(id).then(function () {
//             setMessage("Booking cancelled", "success");
//             loadBookings();
//         }).catch(function (error) {
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Cancel booking failed";
//             setMessage(msg, "error");
//         });
//     }

//     function submitCreateBooking(event) {
//         event.preventDefault();

//         var user = global.AuthStore.getCurrentUser();
//         var payload = {
//             userId: user.userID,
//             roomId: document.getElementById("roomId").value,
//             checkIn: document.getElementById("checkIn").value,
//             checkOut: document.getElementById("checkOut").value,
//             note: document.getElementById("note").value
//         };

//         global.BookingApi.createBooking(payload).then(function () {
//             setMessage("Booking created", "success");
//             event.target.reset();
//             loadBookings();
//         }).catch(function (error) {
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Create booking failed";
//             setMessage(msg, "error");
//         });
//     }

//     function init() {
//         if (!global.Guard.requireLogin()) {
//             return;
//         }

//         global.AppShell.renderTopbar("Booking List");

//         Promise.all([
//             global.RoomApi.getRooms(),
//             global.BookingApi.getBookings()
//         ]).then(function (result) {
//             roomsCache = result[0] || [];
//             loadRoomOptions();
//             renderBookings(result[1] || []);
//         }).catch(function (error) {
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Cannot load booking data";
//             setMessage(msg, "error");
//         });

//         document.getElementById("create-booking-form").addEventListener("submit", submitCreateBooking);
//     }

//     document.addEventListener("DOMContentLoaded", init);
// })(window);

