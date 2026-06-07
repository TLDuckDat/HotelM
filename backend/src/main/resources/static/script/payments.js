(function (global) {
    "use strict";

    var QR_BANK_CODE = "MB";
    var QR_BANK_NAME = "MB Bank";
    var QR_ACCOUNT_NO = "0979999999";
    var QR_ACCOUNT_NAME = "SOT TEST";

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

    function currentLang() {
        if (global.getLang) return global.getLang();
        return global.localStorage.getItem("sot_lang") || "en";
    }

    function formatMoney(amount) {
        var value = Math.round(Number(amount) || 0);
        if (typeof global.formatCurrency === "function") {
            return global.formatCurrency(value);
        }
        if (currentLang() === "vi") {
            return value.toLocaleString("vi-VN") + " ₫";
        }
        return "$" + Math.round(value / 25000);
    }

    function getSelectedBooking() {
        var bookingId = document.getElementById("payment-booking-id").value;
        if (!bookingId) return null;
        return bookingCache.filter(function (item) {
            return String(getBookingId(item)) === String(bookingId);
        })[0] || null;
    }

    function getSelectedBookingAmount() {
        var booking = getSelectedBooking();
        if (!booking) return 0;
        return Math.round(Number(booking.totalPrice || 0));
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
        return getPaymentId(payment);
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
        var amountInput = document.getElementById("payment-amount");
        var booking = getSelectedBooking();

        if (!amountInput) return;

        if (!booking) {
            amountInput.value = "";
            amountInput.removeAttribute("data-raw-amount");
            return;
        }

        var raw = Math.round(Number(booking.totalPrice || 0));
        amountInput.setAttribute("data-raw-amount", String(raw));
        amountInput.value = raw > 0 ? formatMoney(raw) : "";
    }

    function updateSubmitButton() {
        var method = document.getElementById("payment-method") ? document.getElementById("payment-method").value : "";
        var submitBtn = document.getElementById("payment-submit-btn");
        if (!submitBtn) return;
        
        var icon = submitBtn.querySelector("i");
        var textSpan = submitBtn.querySelector("span");
        
        if (method === "CASH") {
            if (icon) icon.className = "fas fa-check";
            if (textSpan) {
                textSpan.setAttribute("data-i18n", "btn_confirm_payment");
                textSpan.textContent = currentLang() === 'vi' ? "Xác nhận thanh toán" : "Confirm Payment";
            }
        } else {
            if (icon) icon.className = "fas fa-qrcode";
            if (textSpan) {
                textSpan.setAttribute("data-i18n", "create_qr_payment");
                textSpan.textContent = currentLang() === 'vi' ? "Tạo Thanh Toán QR" : "Create QR Payment";
            }
        }
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
            select.innerHTML = "<option value=''>" + (currentLang() === 'vi' ? "Không có phòng nào cần thanh toán" : "No unpaid booking available") + "</option>";
            updateAmountFromBooking();
            return;
        }

        select.innerHTML = "<option value=''>" + (currentLang() === 'vi' ? "Chọn một đặt phòng\u2026" : "Select a booking\u2026") + "</option>" + payableBookings.map(function (booking) {
            var bId = String(getBookingId(booking));
            var roomName = getBookingRoomName(booking);
            var label = roomName + " (" + formatMoney(booking.totalPrice) + ")";
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
                        if (getPaymentMethod(existingPayment) === "CASH") {
                            setMessage(currentLang() === 'vi' ? 'Đã tạo thanh toán tiền mặt. Vui lòng thanh toán tại quầy lễ tân để được Admin duyệt.' : 'Cash payment already created. Please pay at the reception to be approved by Admin.', "notice");
                            hideQrPayment();
                        } else {
                            renderQrPayment(existingPayment);
                            setMessage(currentLang() === 'vi' ? 'Đã tạo thanh toán. Vui lòng quét mã QR và xác nhận sau khi chuyển khoản.' : 'Payment already created. Scan the QR and confirm after transferring.', "notice");
                        }
                    }
                } else {
                    setMessage(currentLang() === 'vi' ? 'Đã chọn phòng! Nhấp "Tạo Thanh Toán QR" để tiếp tục.' : 'Booking pre-selected! Click "Create QR Payment" to proceed.', "notice");
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
            body.innerHTML = "<tr><td colspan='6'>" + (currentLang() === 'vi' ? "Không tìm thấy thanh toán nào" : "No payments found") + "</td></tr>";
        if (typeof applyTranslations === 'function') applyTranslations(global.localStorage.getItem('sot_lang') || 'en');
            return;
        }

        body.innerHTML = payments.map(function (payment) {
            var id = getPaymentId(payment);
            var status = getPaymentStatus(payment);
            var actionHtml = "—";
            
            if (status === "PENDING") {
                if (getPaymentMethod(payment) === "CASH") {
                    actionHtml = currentLang() === 'vi' ? "Đang chờ duyệt" : "Pending Admin Approval";
                } else {
                    actionHtml = "<button class='btn-secondary' type='button' onclick='continuePayment(\"" + id + "\")'>" + (currentLang() === 'vi' ? "Hiển thị QR" : "Show QR") + "</button>";
                }
            }
            
            var bookingId = getPaymentBookingId(payment);
            var bookingMatch = bookingCache.filter(function(b) { return getBookingId(b) === bookingId; })[0];
            var roomDisp = bookingMatch ? getBookingRoomName(bookingMatch) : "Booking #" + bookingId.substring(0,8);

            return "<tr>"
                + "<td><code style='font-size:0.85rem'>#" + id.substring(0,8).toUpperCase() + "</code></td>"
                + "<td>" + roomDisp + "</td>"
                + "<td>" + formatMoney(payment.finalAmount != null ? payment.finalAmount : payment.amount) + "</td>"
                + "<td data-i18n='method_" + getPaymentMethod(payment) + "'>" + getPaymentMethod(payment) + "</td>"
                + "<td data-i18n='status_" + status + "'>" + status + "</td>"
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
        var amount = getSelectedBookingAmount();

        if (!bookingId || !amount || amount <= 0) {
            setMessage("Please choose a valid booking first.", "error");
            return;
        }

        setMessage("Creating payment...", "notice");

        global.PaymentApi.createPayment({
            bookingId: bookingId,
            paymentMethod: method,
            discount: 0
        }).then(function (payment) {
            if (method === "CASH") {
                setMessage(currentLang() === 'vi' ? "Đã tạo thanh toán tiền mặt. Vui lòng thanh toán tại quầy lễ tân để được Admin duyệt." : "Cash payment created. Please pay at the reception to be approved by Admin.", "success");
                hideQrPayment();
            } else {
                setMessage(currentLang() === 'vi' ? "Đã tạo mã QR. Vui lòng quét và xác nhận sau khi chuyển khoản." : "QR created. Please scan and confirm after transferring.", "success");
                renderQrPayment(payment);
            }
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
        global.PaymentApi.confirmPayment(getPaymentId(activePayment))
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

        if (getPaymentMethod(payment) === "CASH") {
            setMessage(currentLang() === 'vi' ? "Đây là thanh toán tiền mặt. Vui lòng thanh toán tại quầy lễ tân để được Admin duyệt." : "This is a cash payment. Please pay at the reception to be approved by Admin.", "notice");
            return;
        }

        renderQrPayment(payment);
        setMessage(currentLang() === 'vi' ? "Đã mở lại mã QR. Vui lòng quét và xác nhận sau khi thanh toán." : "QR reopened. Scan and confirm after payment.", "notice");
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
        var methodSelect = document.getElementById("payment-method");
        var submitBtn = document.getElementById("payment-submit-btn");
        var confirmBtn = document.getElementById("payment-confirm-btn");
        var hideQrBtn = document.getElementById("payment-hide-qr-btn");

        if (bookingSelect) bookingSelect.addEventListener("change", updateAmountFromBooking);
        if (methodSelect) methodSelect.addEventListener("change", updateSubmitButton);
        if (submitBtn) submitBtn.addEventListener("click", submitPayment);
        if (confirmBtn) confirmBtn.addEventListener("click", confirmPayment);
        if (hideQrBtn) hideQrBtn.addEventListener("click", hideQrPayment);
        
        updateSubmitButton();
    }

    function refreshPaymentsPageI18n() {
        if (typeof global.applyTranslations === "function" && global.getLang) {
            global.applyTranslations(global.getLang());
        }
        updateAmountFromBooking();
        updateSubmitButton();
        if (activePayment) {
            var amtEl = document.getElementById("payment-qr-amount");
            if (amtEl) {
                amtEl.textContent = formatMoney(
                    activePayment.finalAmount != null ? activePayment.finalAmount : activePayment.amount
                );
            }
        }
        if (paymentCache && paymentCache.length) {
            var completed = paymentCache.filter(function (payment) {
                return getPaymentStatus(payment) === "COMPLETED";
            });
            var totalAmt = completed.reduce(function (sum, payment) {
                return sum + (Number(payment.finalAmount != null ? payment.finalAmount : payment.amount) || 0);
            }, 0);
            var elAmt = document.getElementById("stat-amount");
            if (elAmt) elAmt.textContent = formatMoney(totalAmt);
            renderBookingOptions();
            renderPayments(paymentCache);
        }
    }

    document.addEventListener("languageChanged", refreshPaymentsPageI18n);

    document.addEventListener("DOMContentLoaded", init);
})(window);