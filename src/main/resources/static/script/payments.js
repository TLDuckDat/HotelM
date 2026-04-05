(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("payments-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
    }

    function loadBookings() {
        var user = global.AuthStore.getCurrentUser();
        return global.BookingApi.getBookings().then(function (bookings) {
            var mine = (bookings || []).filter(function (b) {
                return b.user && b.user.userID === user.userID;
            });

            var select = document.getElementById("payment-booking-id");
            if (!select) return mine;

            if (!mine.length) {
                select.innerHTML = "<option value=''>No booking found</option>";
                return mine;
            }

            select.innerHTML = mine.map(function (b) {
                var roomName = b.room ? (b.room.roomName || "Room") : "Room";
                return "<option value='" + b.bookingID + "'>" + b.bookingID + " - " + roomName + "</option>";
            }).join("");

            return mine;
        });
    }

    function renderPayments(payments) {
        var body = document.getElementById("payments-body");
        if (!body) return;

        if (!payments || !payments.length) {
            body.innerHTML = "<tr><td colspan='5'>No payments found</td></tr>";
            return;
        }

        body.innerHTML = payments.map(function (p) {
            return "<tr>"
                + "<td>" + (p.paymentID || p.id || "") + "</td>"
                + "<td>" + (p.bookingId || (p.booking && p.booking.bookingID) || "") + "</td>"
                + "<td>" + (p.amount != null ? p.amount : "") + "</td>"
                + "<td>" + (p.method || "") + "</td>"
                + "<td>" + (p.status || "") + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadPayments() {
        var user = global.AuthStore.getCurrentUser();

        return global.PaymentApi.getPayments()
            .then(function (payments) {
                var mine = (payments || []).filter(function (p) {
                    if (p.userId) return p.userId === user.userID;
                    if (p.user && p.user.userID) return p.user.userID === user.userID;
                    return true;
                });
                renderPayments(mine);
            })
            .catch(function (err) {
                renderPayments([]);
                var msg = err && err.status === 404
                    ? "Payment API is not available yet. UI is ready."
                    : "Cannot load payments.";
                setMessage(msg, "notice");
            });
    }

    function submitPayment(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("payment-booking-id").value;
        var method = document.getElementById("payment-method").value;
        var amount = Number(document.getElementById("payment-amount").value);

        if (!bookingId || !amount || amount <= 0) {
            setMessage("Please provide valid payment info.", "error");
            return;
        }

        setMessage("Submitting payment...", "notice");

        global.PaymentApi.createPayment({
            bookingId: bookingId,
            userId: user.userID,
            method: method,
            amount: amount
        }).then(function () {
            setMessage("Payment submitted successfully.", "success");
            document.getElementById("payment-form").reset();
            loadPayments();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit payment failed")
                : "Submit payment failed";
            setMessage(msg, "error");
        });
    }

    function init() {
        if (!global.Guard.requireLogin()) return;

        global.AppShell.renderTopbar("Payments");

        Promise.all([
            loadBookings(),
            loadPayments()
        ]).catch(function () {
            setMessage("Cannot initialize payment page.", "error");
        });

        document.getElementById("payment-form").addEventListener("submit", submitPayment);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

