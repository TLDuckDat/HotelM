//bản cũ 2:
// (function (global) {
//     "use strict";

//     function badge(status) {
//         const map = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', CANCELLED: 'badge-cancelled' };
//         const cls = map[(status || '').toUpperCase()] || 'badge-pending';
//         return `<span class="badge ${cls}">${status || ''}</span>`;
//     }

//     function formatDate(v) {
//         return v ? String(v).replace('T', ' ') : '';
//     }

//     function msg(text, type = 'info') {
//         const el = document.getElementById('bookings-message');
//         if (el) {
//             el.className = `message-box ${type}`;
//             el.textContent = text;
//         }
//     }

//     function renderBookings(bookings) {
//         const user = global.AuthStore.getCurrentUser();
//         const isAdmin = user && user.role === 'ADMIN';

//         const filtered = (bookings || []).filter(b => 
//             isAdmin || (b.user && b.user.userID === user.userID)
//         );

//         const body = document.getElementById('bookings-body');
//         if (!body) return;

//         if (!filtered.length) {
//             body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No bookings found</td></tr>';
//             return;
//         }

//         body.innerHTML = filtered.map(b => `
//             <tr>
//                 <td>${b.bookingID || ''}</td>
//                 <td>${b.room ? b.room.roomName : ''}</td>
//                 <td>${formatDate(b.checkIn)}</td>
//                 <td>${formatDate(b.checkOut)}</td>
//                 <td>${badge(b.status)}</td>
//                 <td><button class="btn-danger" data-cancel="${b.bookingID}">Cancel</button></td>
//             </tr>
//         `).join('');

//         body.querySelectorAll('[data-cancel]').forEach(btn => {
//             btn.addEventListener('click', () => cancelBooking(btn.dataset.cancel));
//         });
//     }

//     function loadBookings() {
//         global.BookingApi.getBookings()
//             .then(renderBookings)
//             .catch(err => msg(err?.payload?.message || 'Cannot load bookings', 'error'));
//     }

//     function cancelBooking(id) {
//         global.BookingApi.cancelBooking(id)
//             .then(() => {
//                 msg('Booking cancelled successfully', 'success');
//                 loadBookings();
//             })
//             .catch(err => msg(err?.payload?.message || 'Cancel failed', 'error'));
//     }

//     function handleLogout() {
//         if (global.AuthStore) global.AuthStore.clearCurrentUser();
//         window.location.href = 'login.html';
//     }

//     window.toggleSidebar = function () { /* same as before */ };
//     window.closeSidebar = function () { /* same as before */ };


//     function renderUserUI() {
//     const user = window.AuthStore?.getCurrentUser();
//     if (!user) return;

//     const topbarName = document.getElementById('topbar-username');
//     const sidebarName = document.getElementById('sidebar-username');
//     const sidebarRole = document.getElementById('sidebar-role');

//     if (topbarName) topbarName.textContent = user.fullName || 'Guest';
//     if (sidebarName) sidebarName.textContent = user.fullName || 'Guest';
//     if (sidebarRole) sidebarRole.textContent = user.role || 'USER';
// }

//     document.addEventListener('DOMContentLoaded', () => {
//         if (!global.Guard.requireLogin()) return;
//         loadBookings();
//         renderUserUI();
//     });

// })(window);


//bản 3:
(function (global) {
    "use strict";

    // Room lookup map: { roomId -> roomName }
    var roomMap = {};

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
            el.style.display = 'block';
        }
    }

    function renderBookings(bookings) {
        const user = global.AuthStore.getCurrentUser();
        if (!user) return;

        const currentUserId = String(user.userId || user.userID || user.id || "");
        const isAdmin = user.role === 'ADMIN';

        const filtered = (bookings || []).filter(b => {
            if (isAdmin) return true;
            return String(b.userId || b.userID || "") === currentUserId;
        });

        const body = document.getElementById('bookings-body');
        if (!body) return;

        if (!filtered.length) {
            body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No bookings found</td></tr>';
            return;
        }

        body.innerHTML = filtered.map(b => {
            const rid = b.roomId || b.roomID || '';
            const roomName = roomMap[rid] || rid || 'N/A';
            const bookingId = b.bookingId || b.bookingID || '';
            const userId = b.userId || b.userID || '';

            // // Chỉ cho phép Review nếu trạng thái là CONFIRMED
            // const canReview = (b.status || '').toUpperCase() === 'CONFIRMED';
            // const reviewBtn = canReview
            //     ? `<button class="btn-review" data-review-booking="${bookingId}" data-review-room="${rid}" data-review-room-name="${roomName}" data-review-user="${userId}">
            //        <i class="fas fa-star"></i> Review
            //    </button>`
            //     : `<span style="color:var(--text-muted);font-size:0.8rem;">—</span>`;

            //Xóa bỏ câu lệnh điều kiện canReview - cho phép rating bất cứ lúc nào  
        const reviewBtn = `<button class="btn-review" 
                                data-review-booking="${bookingId}" 
                                data-review-room="${rid}" 
                                data-review-room-name="${roomName}" 
                                data-review-user="${userId}">
                               <i class="fas fa-star"></i> Review
                           </button>`;
            return `
                <tr>
                    <td>${b.bookingId || b.bookingID || ''}</td>
                    <td>${roomName}</td>
                    <td>${formatDate(b.checkIn)}</td>
                    <td>${formatDate(b.checkOut)}</td>
                    <td>${badge(b.status)}</td>
                    <td><button class="btn-danger" data-cancel="${b.bookingId || b.bookingID}">Cancel</button></td>
                    <td>${reviewBtn}</td>
                </tr>
            `;
        }).join('');

        body.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', () => cancelBooking(btn.dataset.cancel));
        });

        // Thêm listener cho nút Review
        body.querySelectorAll('[data-review-booking]').forEach(btn => {
            btn.addEventListener('click', () => openReviewModal({
                bookingId: btn.dataset.reviewBooking,
                roomId: btn.dataset.reviewRoom,
                roomName: btn.dataset.reviewRoomName,
                userId: btn.dataset.reviewUser
            }));
        });
    }

    function loadBookings() {
        // Fetch rooms and bookings in parallel
        Promise.all([
            global.RoomApi.getRooms(),
            global.BookingApi.getBookings()
        ])
            .then(function ([roomsData, bookingsData]) {
                // Build room lookup map
                const rooms = Array.isArray(roomsData) ? roomsData : (roomsData.payload || roomsData.data || []);
                rooms.forEach(function (room) {
                    const id = room.roomId || room.roomID || room.id;
                    const name = room.roomName || room.name || id;
                    if (id) roomMap[id] = name;
                });

                // Process bookings
                const list = Array.isArray(bookingsData) ? bookingsData : (bookingsData.payload || bookingsData.data || []);
                renderBookings(list);
            })
            .catch(err => {
                console.error("Load error:", err);
                msg(err?.payload?.message || 'Cannot load bookings', 'error');
            });
    }

    function cancelBooking(id) {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        global.BookingApi.updateBookingStatus(id, 'CANCELLED')
            .then(() => {
                msg('Booking cancelled successfully', 'success');
                loadBookings();
            })
            .catch(err => msg(err?.payload?.message || 'Cancel failed', 'error'));
    }

    function renderUserUI() {
        const user = window.AuthStore?.getCurrentUser();
        if (!user) return;
        if (document.getElementById('topbar-username')) document.getElementById('topbar-username').textContent = user.fullName || 'Guest';
        if (document.getElementById('sidebar-username')) document.getElementById('sidebar-username').textContent = user.fullName || 'Guest';
        if (document.getElementById('sidebar-role')) document.getElementById('sidebar-role').textContent = user.role || 'USER';
    }

    window.handleLogout = function () {
        global.AuthStore.clearCurrentUser();
        window.location.href = 'login.html';
    };

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (!global.Guard.requireLogin()) return;
        renderUserUI();
        loadBookings();
    });

    // 2. THÊM CÁC HÀM XỬ LÝ MODAL (Gán vào object global hoặc window)
    window.openReviewModal = function ({ bookingId, roomId, roomName, userId }) {
        document.getElementById('review-booking-id').value = bookingId;
        document.getElementById('review-room-id').value = roomId;
        document.getElementById('review-user-id').value = userId;
        document.getElementById('review-modal-room-name').textContent = roomName;
        document.getElementById('review-comment').value = '';

        // Reset stars
        document.querySelectorAll('input[name="review-rating"]').forEach(r => r.checked = false);
        document.getElementById('review-modal-backdrop').classList.add('active');
    };

    window.closeReviewModal = function () {
        document.getElementById('review-modal-backdrop').classList.remove('active');
    };

    window.submitReview = function () {
        const ratingEl = document.querySelector('input[name="review-rating"]:checked');
        if (!ratingEl) return alert('Please select a star rating.');

        const payload = {
            userId: document.getElementById('review-user-id').value,
            roomId: document.getElementById('review-room-id').value,
            rating: parseInt(ratingEl.value, 10),
            comment: document.getElementById('review-comment').value.trim()
        };

        console.log('Review data:', payload);
        // Tại đây bạn gọi API: global.ReviewApi.create(payload)...
        alert('Review submitted! (API placeholder)');
        closeReviewModal();
    };

    // 3. THÊM SỰ KIỆN CLICK RA NGOÀI ĐỂ ĐÓNG MODAL (Trong DOMContentLoaded)
    document.getElementById('review-modal-backdrop').addEventListener('click', function (e) {
        if (e.target === this) closeReviewModal();
    });

})(window);

//bản cũ 1:
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

