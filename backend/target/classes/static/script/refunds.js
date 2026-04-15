(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("refunds-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    function loadBookingOptions() {
        var user = global.AuthStore.getCurrentUser();

        return global.BookingApi.getBookings().then(function (bookings) {
            var mine = (bookings || []).filter(function (b) {
                return b.user && b.user.userID === user.userID;
            });

            var select = document.getElementById("refund-booking-id");
            if (!select) return;

            if (!mine.length) {
                select.innerHTML = "<option value=''>No booking found</option>";
                return;
            }

            select.innerHTML = mine.map(function (b) {
                var roomName = b.room ? (b.room.roomName || "Room") : "Room";
                return "<option value='" + b.bookingID + "'>" + b.bookingID + " - " + roomName + "</option>";
            }).join("");
        });
    }

    function renderRefunds(refunds) {
        var body = document.getElementById("refunds-body");
        if (!body) return;

        if (!refunds || !refunds.length) {
            body.innerHTML = "<tr><td colspan='4'>No refund request found</td></tr>";
            return;
        }

        body.innerHTML = refunds.map(function (r) {
            var bookingId = r.bookingId || (r.booking && r.booking.bookingID) || "";
            return "<tr>"
                + "<td>" + (r.refundID || r.id || "") + "</td>"
                + "<td>" + bookingId + "</td>"
                + "<td>" + (r.status || "PENDING") + "</td>"
                + "<td>" + (r.reason || "") + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadRefunds() {
        var user = global.AuthStore.getCurrentUser();

        return global.RefundApi.getRefunds()
            .then(function (refunds) {
                var mine = (refunds || []).filter(function (r) {
                    if (r.userId) return r.userId === user.userID;
                    if (r.user && r.user.userID) return r.user.userID === user.userID;
                    return true;
                });

                // Update stat cards
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
                var msg = err && err.status === 404
                    ? "Refund API is not available yet. UI is ready."
                    : "Cannot load refund requests.";
                setMessage(msg, "notice");
            });
    }

    function submitRefund() {
        var user      = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("refund-booking-id").value;
        var reason    = document.getElementById("refund-reason").value.trim();

        if (!bookingId || !reason) {
            setMessage("Please choose a booking and enter a reason.", "error");
            return;
        }

        setMessage("Submitting refund request...", "notice");

        global.RefundApi.createRefund({
            bookingId: bookingId,
            userId:    user.userID,
            reason:    reason
        }).then(function () {
            setMessage("Refund request submitted.", "success");
            document.getElementById("refund-booking-id").value = "";
            document.getElementById("refund-reason").value     = "";
            loadRefunds();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit refund failed")
                : "Submit refund failed";
            setMessage(msg, "error");
        });
    }

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

    function init() {
        if (!global.Guard.requireLogin()) return;

        var user = global.AuthStore.getCurrentUser();
        if (user) {
            var el;
            el = document.getElementById("topbar-username"); if (el) el.textContent = user.fullName || "Guest";
            el = document.getElementById("sidebar-username"); if (el) el.textContent = user.fullName || "Guest";
            el = document.getElementById("sidebar-role");    if (el) el.textContent = user.role || "USER";
        }

        Promise.all([
            loadBookingOptions(),
            loadRefunds()
        ]).catch(function () {
            setMessage("Cannot initialize refund page.", "error");
        });

        var btn = document.getElementById("refund-submit-btn");
        if (btn) btn.addEventListener("click", submitRefund);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window); 