(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("refunds-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
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
            return "<tr>"
                + "<td>" + (r.refundID || r.id || "") + "</td>"
                + "<td>" + (r.bookingId || "") + "</td>"
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

    function submitRefund(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("refund-booking-id").value;
        var reason = document.getElementById("refund-reason").value.trim();

        if (!bookingId || !reason) {
            setMessage("Please choose booking and enter reason.", "error");
            return;
        }

        setMessage("Submitting refund request...", "notice");

        global.RefundApi.createRefund({
            bookingId: bookingId,
            userId: user.userID,
            reason: reason
        }).then(function () {
            setMessage("Refund request submitted.", "success");
            document.getElementById("refund-form").reset();
            loadRefunds();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit refund failed")
                : "Submit refund failed";
            setMessage(msg, "error");
        });
    }

    function init() {
        if (!global.Guard.requireLogin()) return;

        global.AppShell.renderTopbar("Refund Requests");

        Promise.all([
            loadBookingOptions(),
            loadRefunds()
        ]).catch(function () {
            setMessage("Cannot initialize refund page.", "error");
        });

        document.getElementById("refund-form").addEventListener("submit", submitRefund);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

