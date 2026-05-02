(function (global) {
    "use strict";

    var QR_BANK_CODE = "MB";
    var QR_BANK_NAME = "MB Bank";
    var QR_ACCOUNT_NO = "0979999999";
    var QR_ACCOUNT_NAME = "SOT RESORT HOTEL";

    var bookingCache = [];
    var paymentCache = [];
    var activePayment = null;
    var roomMap = {};

    function setMessage(text, type) {
        var el = document.getElementById("payments-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    function formatMoney(amount) {
        var value = Math.round(Number(amount) || 0);
        return value.toLocaleString("vi-VN") + " ₫";
    }

    // BookingResponse fields: bookingId, userId, roomId, checkIn, checkOut, totalPrice, status
    function getBookingId(booking) {
        return booking.bookingId || booking.bookingID || booking.id || "";
    }

    function getBookingRoomName(booking) {
        var rid = booking.roomId || (booking.room && (booking.room.roomId || booking.room.roomID));
        if (rid && roomMap[rid]) return roomMap[rid];
        return booking.roomName
            || (booking.room && booking.room.roomName)
            || (booking.roomId ? "Room #" + booking.roomId.substring(0,8) : "Room");
    }

    // Normalize user ID across different auth token shapes
    function getCurrentUserId() {
        var user = global.AuthStore.getCurrentUser();
        return user && (user.userId || user.userID || user.id || "");
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
        // InvoiceResponse fields: invoiceId, bookingId, userId, roomId, amount, discount, finalAmount, paymentMethod, status, paidAt
        return payment.bookingId || (payment.booking && (payment.booking.bookingId || payment.booking.bookingID)) || "";
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
        amountInput.value = booking ? String(Math.round(Number(booking.totalPrice || 0))) : "";
    }

    function renderBookingOptions() {
        var select = document.getElementById("payment-booking-id");
        if (!select) return;

        // Bookings that already have a PENDING payment — can reopen QR but not create new
        var pendingBookingIds = paymentCache
            .filter(function (p) { return getPaymentStatus(p) === "PENDING"; })
            .map(function (p) { return String(getPaymentBookingId(p)); });

        // Bookings that already have a COMPLETED payment — exclude entirely
        var completedBookingIds = paymentCache
            .filter(function (p) { return getPaymentStatus(p) === "COMPLETED"; })
            .map(function (p) { return String(getPaymentBookingId(p)); });

        var payableBookings = bookingCache.filter(function (booking) {
            var status = booking.status || "";
            var bId = String(getBookingId(booking));
            return completedBookingIds.indexOf(bId) === -1
                && status !== "CANCELLED"
                && status !== "CHECKED_OUT";
        });

        if (!payableBookings.length) {
            select.innerHTML = "<option value=''>No unpaid booking available</option>";
            updateAmountFromBooking();
            return;
        }

        select.innerHTML = "<option value=''>Select a booking\u2026</option>" + payableBookings.map(function (booking) {
            var bId = String(getBookingId(booking));
            var roomName = getBookingRoomName(booking);
            var checkIn = booking.checkIn ? String(booking.checkIn).replace('T', ' ').substring(0, 16) : "";
            var label = roomName + (checkIn ? " (Check-in: " + checkIn + ")" : "") + " (" + formatMoney(booking.totalPrice) + ")";
            // Mark bookings that already have a PENDING payment
            if (pendingBookingIds.indexOf(bId) !== -1) {
                label += " [Payment pending]";
            }
            return "<option value='" + bId + "'>" + label + "</option>";
        }).join("");

        // Auto-select if URL has ?bookingId= (e.g. redirected from create-booking)
        var urlParams = new URLSearchParams(window.location.search);
        var urlBookingId = urlParams.get("bookingId");
        if (urlBookingId) {
            // Try to find the booking in the select list
            var found = Array.from(select.options).some(function (opt) {
                return opt.value === String(urlBookingId);
            });
            if (found) {
                select.value = String(urlBookingId);
                updateAmountFromBooking();
                // If it already has a PENDING payment, reopen the QR automatically
                if (pendingBookingIds.indexOf(String(urlBookingId)) !== -1) {
                    var existingPayment = paymentCache.filter(function (p) {
                        return String(getPaymentBookingId(p)) === String(urlBookingId)
                            && getPaymentStatus(p) === "PENDING";
                    })[0];
                    if (existingPayment) {
                        renderQrPayment(existingPayment);
                        setMessage('Payment already created. Scan the QR and confirm after transferring.', "notice");
                    }
                } else {
                    setMessage('Booking pre-selected! Click "Create QR Payment" to proceed.', "notice");
                }
            } else {
                setMessage('Booking #' + urlBookingId + ' not found in your payable bookings.', "error");
            }
        } else {
            updateAmountFromBooking();
        }
    }

    function loadBookings() {
        var userId = getCurrentUserId();
        // Use user-specific endpoint (GET /bookings/user/{userId}) — avoids loading all bookings
        var loader = userId
            ? global.BookingApi.getBookingsByUser(userId)
            : global.BookingApi.getBookings();

        return loader.then(function (bookings) {
            var raw = Array.isArray(bookings)
                ? bookings
                : (bookings && (bookings.payload || bookings.data) || []);
            // Extra client-side guard: only keep this user's bookings
            bookingCache = userId
                ? raw.filter(function (b) {
                    var bUid = b.userId
                        || (b.user && (b.user.userId || b.user.userID || b.user.id))
                        || "";
                    return String(bUid) === String(userId);
                })
                : raw;
            renderBookingOptions();
            if (paymentCache && paymentCache.length) renderPayments(paymentCache);
            return bookingCache;
        }).catch(function (err) {
            bookingCache = [];
            renderBookingOptions();
            var msg = (err && err.payload && (err.payload.message || err.payload.error))
                || "Cannot load bookings.";
            setMessage(msg, "error");
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
            
            var bookingId = getPaymentBookingId(payment);
            var bookingMatch = bookingCache.filter(function(b) { return getBookingId(b) === bookingId; })[0];
            var roomDisp = bookingMatch ? getBookingRoomName(bookingMatch) : "Booking #" + bookingId.substring(0,8);

            return "<tr>"
                + "<td><code style='font-size:0.85rem'>#" + id.substring(0,8).toUpperCase() + "</code></td>"
                + "<td>" + roomDisp + "</td>"
                + "<td>" + formatMoney(payment.finalAmount != null ? payment.finalAmount : payment.amount) + "</td>"
                + "<td>" + getPaymentMethod(payment) + "</td>"
                + "<td>" + status + "</td>"
                + "<td>" + actionHtml + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadPayments() {
        var userId = getCurrentUserId();
        // Use user-specific endpoint (GET /invoices/user/{userId})
        var loader = userId
            ? global.PaymentApi.getPaymentsByUser(userId)
            : global.PaymentApi.getPayments();

        return loader.then(function (payments) {
            var raw = Array.isArray(payments)
                ? payments
                : (payments && (payments.payload || payments.data) || []);
            paymentCache = raw;

            var completed = paymentCache.filter(function (payment) {
                return getPaymentStatus(payment) === "COMPLETED";
            });
            var totalAmt = completed.reduce(function (sum, payment) {
                return sum + (Number(payment.finalAmount != null ? payment.finalAmount : payment.amount) || 0);
            }, 0);

            var elTotal = document.getElementById("stat-total");
            var elComp  = document.getElementById("stat-completed");
            var elAmt   = document.getElementById("stat-amount");
            if (elTotal) elTotal.textContent = paymentCache.length;
            if (elComp)  elComp.textContent  = completed.length;
            if (elAmt)   elAmt.textContent   = formatMoney(totalAmt);

            renderBookingOptions();
            renderPayments(paymentCache);
            return paymentCache;
        }).catch(function (err) {
            renderPayments([]);
            var msg = (err && err.payload && (err.payload.message || err.payload.error))
                || "Cannot load payments.";
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

        var pRooms = global.RoomApi ? global.RoomApi.getRooms().catch(function(){return [];}) : Promise.resolve([]);

        Promise.all([
            pRooms,
            loadBookings(),
            loadPayments()
        ]).then(function(res) {
            var rooms = res[0];
            var rawRooms = Array.isArray(rooms) ? rooms : (rooms.payload || rooms.data || []);
            rawRooms.forEach(function(r) {
                var id = r.roomId || r.roomID || r.id;
                if (id) roomMap[id] = r.roomName || r.name;
            });
            renderBookingOptions();
            if (paymentCache && paymentCache.length) renderPayments(paymentCache);
        }).catch(function () {
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