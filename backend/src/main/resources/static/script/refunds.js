(function (global) {
    "use strict";

    // ── Helpers ──────────────────────────────────────────────────────────────

    function setMessage(text, type) {
        var el = document.getElementById("refunds-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    var sharedBookings = [];
    var roomMap = {};

    /** Normalize user ID across different JWT/session token shapes */
    function getCurrentUserId() {
        var user = global.AuthStore.getCurrentUser();
        return user && (user.userId || user.userID || user.id || "");
    }

    function getCurrentUser() {
        return global.AuthStore.getCurrentUser() || {};
    }

    // BookingResponse fields: bookingId, userId, roomId, checkIn, checkOut,
    //                         totalPrice, status, createdAt, note
    function getBookingId(b) {
        return b.bookingId || b.bookingID || b.id || "";
    }

    function getRefundId(r) {
        return r.refundId || r.refundID || r.id || "";
    }

    function getRefundBookingId(r) {
        return r.bookingId || (r.booking && (r.booking.bookingId || r.booking.bookingID)) || "";
    }

    // ── Booking options for the "select booking" dropdown ────────────────────

    function loadBookingOptions() {
        var userId = getCurrentUserId();
        if (!userId) {
            setMessage("Cannot identify current user.", "error");
            return Promise.resolve();
        }

        // Use user-specific endpoint (GET /bookings/user/{userId})
        var loader = global.BookingApi.getBookingsByUser
            ? global.BookingApi.getBookingsByUser(userId)
            : global.BookingApi.getBookings().then(function (all) {
                return (all || []).filter(function (b) {
                    var bUid = b.userId
                        || (b.user && (b.user.userId || b.user.userID || b.user.id))
                        || "";
                    return String(bUid) === String(userId);
                });
            });

        return loader.then(function (bookings) {
            var raw = Array.isArray(bookings)
                ? bookings
                : (bookings && (bookings.payload || bookings.data) || []);

            sharedBookings = raw;

            var select = document.getElementById("refund-booking-id");
            if (!select) return;

            // Only allow refunds on CONFIRMED or CHECKED_IN bookings
            // (not CANCELLED or CHECKED_OUT — those are already finished)
            var eligible = raw.filter(function (b) {
                var s = (b.status || "").toUpperCase();
                return s === "CONFIRMED" || s === "CHECKED_IN" || s === "PENDING";
            });

            if (!eligible.length) {
                select.innerHTML = "<option value=''>No eligible booking for refund</option>";
                return;
            }

            select.innerHTML = "<option value=''>Choose a booking…</option>"
                + eligible.map(function (b) {
                    var id = getBookingId(b);
                    var rid = b.roomId || (b.room && (b.room.roomId || b.room.roomID));
                    var roomLabel = (rid && roomMap[rid]) ? roomMap[rid] : (b.roomName || (b.room && b.room.roomName) || (b.roomId ? "Room #" + b.roomId.substring(0,8) : "Unknown Room"));
                    var checkIn = b.checkIn ? String(b.checkIn).replace('T', ' ').substring(0, 16) : "";
                    var label = roomLabel + (checkIn ? " (Check-in: " + checkIn + ")" : "") + " [" + (b.status || "?") + "]";
                    return "<option value='" + id + "'>" + label + "</option>";
                }).join("");
        }).catch(function (err) {
            var select = document.getElementById("refund-booking-id");
            if (select) select.innerHTML = "<option value=''>Cannot load bookings</option>";
            var msg = (err && err.payload && (err.payload.message || err.payload.error))
                || "Cannot load your bookings.";
            setMessage(msg, "error");
        });
    }

    // ── Render refund list ────────────────────────────────────────────────────

    function renderRefunds(refunds) {
        var body = document.getElementById("refunds-body");
        if (!body) return;

        if (!refunds || !refunds.length) {
            body.innerHTML = "<tr><td colspan='4'>No refund request found</td></tr>";
            return;
        }

        body.innerHTML = refunds.map(function (r) {
            var id        = getRefundId(r);
            var bookingId = getRefundBookingId(r);
            var status    = r.status || "PENDING";

            var bookingMatch = sharedBookings.filter(function(b) { return getBookingId(b) === bookingId; })[0];
            var rName = "Booking #" + bookingId.substring(0,8);
            if (bookingMatch) {
                var rid = bookingMatch.roomId || (bookingMatch.room && (bookingMatch.room.roomId || bookingMatch.room.roomID));
                rName = (rid && roomMap[rid]) ? roomMap[rid] : (bookingMatch.roomName || (bookingMatch.room && bookingMatch.room.roomName) || "Room #" + bookingMatch.roomId.substring(0,8));
            }
            var roomDisp = rName;

            // Status badge styling
            var badgeStyle = status === "APPROVED"
                ? "color:#1b4332;background:#d8f3dc;border:1px solid #95d5b2;"
                : status === "REJECTED"
                    ? "color:#7f0000;background:#ffe0e0;border:1px solid #f5c6cb;"
                    : "color:#856404;background:#fff3cd;border:1px solid #ffecb5;";

            return "<tr>"
                + "<td><code style='font-size:.85rem;color:#555'>#" + id.substring(0,8).toUpperCase() + "</code></td>"
                + "<td>" + roomDisp + "</td>"
                + "<td><span style='padding:3px 10px;border-radius:20px;font-size:.85rem;"
                          + badgeStyle + "'>" + status + "</span></td>"
                + "<td style='max-width:240px;word-break:break-word'>" + (r.reason || "—") + "</td>"
                + "</tr>";
        }).join("");
    }

    // ── Load & update stats ───────────────────────────────────────────────────

    function loadRefunds() {
        var userId = getCurrentUserId();

        return global.RefundApi.getRefunds()
            .then(function (data) {
                var all = Array.isArray(data)
                    ? data
                    : (data && (data.payload || data.data) || []);

                // Filter to this user's refunds only
                var mine = all.filter(function (r) {
                    var rUid = r.userId
                        || (r.user && (r.user.userId || r.user.userID || r.user.id))
                        || "";
                    return !userId || String(rUid) === String(userId);
                });

                // Stats
                var pending  = mine.filter(function (r) { return (r.status || "PENDING") === "PENDING"; }).length;
                var approved = mine.filter(function (r) { return r.status === "APPROVED"; }).length;
                var elTotal    = document.getElementById("stat-total");
                var elPending  = document.getElementById("stat-pending");
                var elApproved = document.getElementById("stat-approved");
                if (elTotal)    elTotal.textContent    = mine.length;
                if (elPending)  elPending.textContent  = pending;
                if (elApproved) elApproved.textContent = approved;

                renderRefunds(mine);
            })
            .catch(function (err) {
                renderRefunds([]);
                // 404 = /refunds endpoint not yet implemented on backend
                if (err && err.status === 404) {
                    setMessage("Refund API is not available yet — feature coming soon.", "notice");
                } else {
                    var msg = (err && err.payload && (err.payload.message || err.payload.error))
                        || "Cannot load refund requests.";
                    setMessage(msg, "error");
                }
            });
    }

    // ── Submit new refund request ─────────────────────────────────────────────

    function submitRefund() {
        var userId    = getCurrentUserId();
        var bookingId = document.getElementById("refund-booking-id").value;
        var reason    = document.getElementById("refund-reason").value.trim();

        if (!bookingId) {
            setMessage("Please choose a booking.", "error");
            return;
        }
        if (!reason) {
            setMessage("Please enter a reason for the refund.", "error");
            return;
        }

        var btn = document.getElementById("refund-submit-btn");
        if (btn) btn.disabled = true;

        setMessage("Submitting refund request…", "notice");

        global.RefundApi.createRefund({
            bookingId: bookingId,
            userId:    userId,
            reason:    reason
        }).then(function () {
            setMessage("Refund request submitted successfully.", "success");
            document.getElementById("refund-booking-id").value = "";
            document.getElementById("refund-reason").value     = "";
            if (btn) btn.disabled = false;
            loadRefunds();
        }).catch(function (err) {
            var msg = (err && err.payload && (err.payload.message || err.payload.error))
                || "Cannot submit refund request.";
            setMessage(msg, "error");
            if (btn) btn.disabled = false;
        });
    }

    // ── Sidebar helpers ───────────────────────────────────────────────────────

    function handleLogout() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = "index.html";
    }
    window.handleLogout = handleLogout;

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };
    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    // ── Init ─────────────────────────────────────────────────────────────────

    function init() {
        if (!global.Guard.requireLogin()) return;

        var user = getCurrentUser();
        if (global.HotelMApiBase && (user.accessToken || user.token)) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token);
        }

        var el;
        el = document.getElementById("topbar-username");  if (el) el.textContent = user.fullName || "Guest";
        el = document.getElementById("sidebar-username"); if (el) el.textContent = user.fullName || "Guest";
        el = document.getElementById("sidebar-role");     if (el) el.textContent = user.role || "USER";

        var pRooms = global.RoomApi ? global.RoomApi.getRooms().catch(function(){return [];}) : Promise.resolve([]);

        pRooms.then(function(rooms) {
            var rawRooms = Array.isArray(rooms) ? rooms : (rooms.payload || rooms.data || []);
            rawRooms.forEach(function(r) {
                var id = r.roomId || r.roomID || r.id;
                if (id) roomMap[id] = r.roomName || r.name;
            });
            return Promise.all([
                loadBookingOptions(),
                loadRefunds()
            ]);
        }).catch(function () {
            setMessage("Cannot initialize refund page.", "error");
        });

        var btn = document.getElementById("refund-submit-btn");
        if (btn) btn.addEventListener("click", submitRefund);
    }

    document.addEventListener("DOMContentLoaded", init);

})(window);