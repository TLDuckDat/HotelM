(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("payments-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
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
            // DB: invoice table uses payment_method; backend API may expose as method or paymentMethod
            var method = p.method || p.paymentMethod || p.payment_method || "";
            // DB: invoice table has no status column — backend may add one or derive it
            var status = p.status || (p.paidAt || p.paid_at ? "COMPLETED" : "PENDING");
            // DB: invoice uses booking_booking_id; backend likely exposes as bookingId or booking.bookingID
            var bookingId = p.bookingId || (p.booking && p.booking.bookingID) || p.booking_booking_id || "";

            return "<tr>"
                + "<td>" + (p.paymentID || p.invoiceID || p.id || "") + "</td>"
                + "<td>" + bookingId + "</td>"
                + "<td>" + (p.amount != null ? p.amount : "") + "</td>"
                + "<td>" + method + "</td>"
                + "<td>" + status + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadPayments() {
        var user = global.AuthStore.getCurrentUser();

        return global.PaymentApi.getPayments()
            .then(function (payments) {
                var mine = (payments || []).filter(function (p) {
                    // Filter by userId — backend may nest user object or expose userId directly
                    if (p.userId) return p.userId === user.userID;
                    if (p.user && p.user.userID) return p.user.userID === user.userID;
                    // Fallback: if backend doesn't include user info, show all (backend should pre-filter)
                    return true;
                });

                // Update stat cards
                var completed = mine.filter(function (p) {
                    return p.status === "COMPLETED" || p.paidAt || p.paid_at;
                });
                var totalAmt = completed.reduce(function (s, p) {
                    return s + (Number(p.amount) || 0);
                }, 0);

                var elTotal = document.getElementById("stat-total");
                var elComp  = document.getElementById("stat-completed");
                var elAmt   = document.getElementById("stat-amount");
                if (elTotal) elTotal.textContent = mine.length;
                if (elComp)  elComp.textContent  = completed.length;
                if (elAmt)   elAmt.textContent   = "$" + totalAmt.toFixed(2);

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

    function submitPayment() {
        var user      = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("payment-booking-id").value;
        var method    = document.getElementById("payment-method").value;
        var amount    = Number(document.getElementById("payment-amount").value);

        if (!bookingId || !amount || amount <= 0) {
            setMessage("Please provide valid payment info.", "error");
            return;
        }

        setMessage("Submitting payment...", "notice");

        global.PaymentApi.createPayment({
            bookingId: bookingId,
            userId:    user.userID,
            method:    method,
            amount:    amount
        }).then(function () {
            setMessage("Payment submitted successfully.", "success");
            document.getElementById("payment-booking-id").value = "";
            document.getElementById("payment-amount").value     = "";
            loadPayments();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit payment failed")
                : "Submit payment failed";
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
            loadBookings(),
            loadPayments()
        ]).catch(function () {
            setMessage("Cannot initialize payment page.", "error");
        });

        var btn = document.getElementById("payment-submit-btn");
        if (btn) btn.addEventListener("click", submitPayment);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);