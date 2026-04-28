(function (global) {
    "use strict";

    var QR_BANK_CODE = "MB";
    var QR_BANK_NAME = "MB Bank";
    var QR_ACCOUNT_NO = "0979999999";
    var QR_ACCOUNT_NAME = "SOT RESORT HOTEL";

    var bookingCache = [];
    var paymentCache = [];
    var activePayment = null;

    function setMessage(text, type) {
        var el = document.getElementById("payments-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    function formatMoney(amount) {
        return "$" + (Number(amount) || 0).toFixed(2);
    }

    function getBookingId(booking) {
        return booking.bookingID || booking.bookingId || booking.id || "";
    }

    function getBookingRoomName(booking) {
        return booking.roomName || (booking.room && booking.room.roomName) || "Room";
    }

    function getPaymentId(payment) {
        return payment.invoiceId || payment.invoiceID || payment.paymentID || payment.id || "";
    }

    function getPaymentStatus(payment) {
        return payment.status || (payment.paidAt || payment.paid_at ? "COMPLETED" : "PENDING");
    }

    function getPaymentMethod(payment) {
        return payment.paymentMethod || payment.method || payment.payment_method || "TRANSFER";
    }

    function getPaymentBookingId(payment) {
        return payment.bookingId || (payment.booking && payment.booking.bookingID) || payment.booking_booking_id || "";
    }

    function getQrTransferNote(payment) {
        return "HOTELM " + getPaymentId(payment);
    }

    function buildQrImageUrl(payment) {
        var amount = Math.round(Number(payment.finalAmount != null ? payment.finalAmount : payment.amount) || 0);
        var params = [
            "amount=" + encodeURIComponent(amount),
            "addInfo=" + encodeURIComponent(getQrTransferNote(payment)),
            "accountName=" + encodeURIComponent(QR_ACCOUNT_NAME)
        ];
        return "https://img.vietqr.io/image/" + QR_BANK_CODE + "-" + QR_ACCOUNT_NO + "-compact2.png?" + params.join("&");
    }

    function updateAmountFromBooking() {
        var bookingId = document.getElementById("payment-booking-id").value;
        var amountInput = document.getElementById("payment-amount");
        var booking = bookingCache.filter(function (item) {
            return getBookingId(item) === bookingId;
        })[0];

        if (!amountInput) return;
        amountInput.value = booking ? Number(booking.totalPrice || 0).toFixed(2) : "";
    }

    function renderBookingOptions() {
        var select = document.getElementById("payment-booking-id");
        if (!select) return;

        var usedBookingIds = paymentCache.map(function (payment) {
            return getPaymentBookingId(payment);
        });

        var availableBookings = bookingCache.filter(function (booking) {
            var status = booking.status || "";
            return usedBookingIds.indexOf(getBookingId(booking)) === -1
                && status !== "CANCELLED"
                && status !== "CHECKED_OUT";
        });

        if (!availableBookings.length) {
            select.innerHTML = "<option value=''>No unpaid booking available</option>";
            updateAmountFromBooking();
            return;
        }

        select.innerHTML = "<option value=''>Select a booking…</option>" + availableBookings.map(function (booking) {
            return "<option value='" + getBookingId(booking) + "'>"
                + getBookingId(booking) + " - " + getBookingRoomName(booking)
                + " (" + formatMoney(booking.totalPrice) + ")"
                + "</option>";
        }).join("");
        updateAmountFromBooking();
    }

    function loadBookings() {
        var user = global.AuthStore.getCurrentUser();
        return global.BookingApi.getBookings().then(function (bookings) {
            bookingCache = (bookings || []).filter(function (booking) {
                var bookingUserId = booking.userId || (booking.user && booking.user.userID);
                return bookingUserId === user.userID;
            });
            renderBookingOptions();
            return bookingCache;
        });
    }

    function renderQrPayment(payment) {
        var box = document.getElementById("qr-payment-box");
        var image = document.getElementById("payment-qr-image");
        if (!box || !image || !payment) return;

        activePayment = payment;
        image.src = buildQrImageUrl(payment);
        document.getElementById("payment-qr-bank").textContent = QR_BANK_NAME;
        document.getElementById("payment-qr-account").textContent = QR_ACCOUNT_NO + " - " + QR_ACCOUNT_NAME;
        document.getElementById("payment-qr-amount").textContent = formatMoney(payment.finalAmount != null ? payment.finalAmount : payment.amount);
        document.getElementById("payment-qr-note").textContent = getQrTransferNote(payment);
        box.hidden = false;
    }

    function hideQrPayment() {
        activePayment = null;
        var box = document.getElementById("qr-payment-box");
        if (box) box.hidden = true;
    }

    function renderPayments(payments) {
        var body = document.getElementById("payments-body");
        if (!body) return;

        if (!payments || !payments.length) {
            body.innerHTML = "<tr><td colspan='6'>No payments found</td></tr>";
            return;
        }

        body.innerHTML = payments.map(function (payment) {
            var id = getPaymentId(payment);
            var status = getPaymentStatus(payment);
            var actionHtml = status === "PENDING"
                ? "<button class='btn-secondary' type='button' onclick='continuePayment(\"" + id + "\")'>Show QR</button>"
                : "—";

            return "<tr>"
                + "<td>" + id + "</td>"
                + "<td>" + getPaymentBookingId(payment) + "</td>"
                + "<td>" + formatMoney(payment.finalAmount != null ? payment.finalAmount : payment.amount) + "</td>"
                + "<td>" + getPaymentMethod(payment) + "</td>"
                + "<td>" + status + "</td>"
                + "<td>" + actionHtml + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadPayments() {
        var user = global.AuthStore.getCurrentUser();
        var loader = global.PaymentApi.getPaymentsByUser
            ? global.PaymentApi.getPaymentsByUser(user.userID)
            : global.PaymentApi.getPayments();

        return loader.then(function (payments) {
            paymentCache = payments || [];

            var completed = paymentCache.filter(function (payment) {
                return getPaymentStatus(payment) === "COMPLETED";
            });
            var totalAmt = completed.reduce(function (sum, payment) {
                return sum + (Number(payment.finalAmount != null ? payment.finalAmount : payment.amount) || 0);
            }, 0);

            var elTotal = document.getElementById("stat-total");
            var elComp = document.getElementById("stat-completed");
            var elAmt = document.getElementById("stat-amount");
            if (elTotal) elTotal.textContent = paymentCache.length;
            if (elComp) elComp.textContent = completed.length;
            if (elAmt) elAmt.textContent = formatMoney(totalAmt);

            renderBookingOptions();
            renderPayments(paymentCache);
            return paymentCache;
        }).catch(function (err) {
            renderPayments([]);
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Cannot load payments.")
                : "Cannot load payments.";
            setMessage(msg, "error");
        });
    }

    function submitPayment() {
        var bookingId = document.getElementById("payment-booking-id").value;
        var method = document.getElementById("payment-method").value;
        var amount = Number(document.getElementById("payment-amount").value);

        if (!bookingId || !amount || amount <= 0) {
            setMessage("Please choose a valid booking first.", "error");
            return;
        }

        setMessage("Creating QR payment...", "notice");

        global.PaymentApi.createPayment({
            bookingId: bookingId,
            paymentMethod: method,
            discount: 0
        }).then(function (payment) {
            setMessage("QR created. Please scan and confirm after transferring.", "success");
            renderQrPayment(payment);
            return loadPayments();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Create payment failed")
                : "Create payment failed";
            setMessage(msg, "error");
        });
    }

    function confirmPayment() {
        if (!activePayment) {
            setMessage("Please create or reopen a QR payment first.", "error");
            return;
        }

        setMessage("Confirming payment...", "notice");
        global.PaymentApi.updatePaymentStatus(getPaymentId(activePayment), "COMPLETED")
            .then(function () {
                hideQrPayment();
                setMessage("Payment confirmed successfully.", "success");
                return loadPayments();
            })
            .catch(function (err) {
                var msg = err && err.payload
                    ? (err.payload.message || err.payload.error || "Confirm payment failed")
                    : "Confirm payment failed";
                setMessage(msg, "error");
            });
    }

    global.continuePayment = function (paymentId) {
        var payment = paymentCache.filter(function (item) {
            return getPaymentId(item) === paymentId;
        })[0];

        if (!payment) {
            setMessage("Payment record not found.", "error");
            return;
        }

        renderQrPayment(payment);
        setMessage("QR reopened. Scan and confirm after payment.", "notice");
    };

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
        if (user && global.HotelMApiBase) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token || null);
        }

        if (user) {
            var el;
            el = document.getElementById("topbar-username"); if (el) el.textContent = user.fullName || "Guest";
            el = document.getElementById("sidebar-username"); if (el) el.textContent = user.fullName || "Guest";
            el = document.getElementById("sidebar-role"); if (el) el.textContent = user.role || "USER";
        }

        Promise.all([
            loadBookings(),
            loadPayments()
        ]).catch(function () {
            setMessage("Cannot initialize payment page.", "error");
        });

        var bookingSelect = document.getElementById("payment-booking-id");
        var submitBtn = document.getElementById("payment-submit-btn");
        var confirmBtn = document.getElementById("payment-confirm-btn");
        var hideQrBtn = document.getElementById("payment-hide-qr-btn");

        if (bookingSelect) bookingSelect.addEventListener("change", updateAmountFromBooking);
        if (submitBtn) submitBtn.addEventListener("click", submitPayment);
        if (confirmBtn) confirmBtn.addEventListener("click", confirmPayment);
        if (hideQrBtn) hideQrBtn.addEventListener("click", hideQrPayment);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);