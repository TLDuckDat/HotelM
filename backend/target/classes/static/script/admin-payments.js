(function () {
    "use strict";

    var allPayments = [];
    var userMap = {};
    var roomMap = {};

    /* ── helpers ── */
    function currentLang() {
        return (window.getLang ? window.getLang() : window.localStorage.getItem("sot_lang")) || "en";
    }

    function flash(msg, type) {
        var el = document.getElementById("admin-message");
        el.textContent = msg;
        el.className = "flash-message " + (type || "notice");
        el.style.display = "block";
        setTimeout(function () { el.style.display = "none"; }, 4000);
    }

    function statusBadge(s) {
        var map = { PENDING: "badge-pending", COMPLETED: "badge-confirmed", FAILED: "badge-cancelled", REJECTED: "badge-cancelled" };
        return "<span class='badge " + (map[s] || "badge-maintenance") + "' data-i18n='status_" + s + "'>" + (s || "PENDING") + "</span>";
    }

    function formatMoney(amount) {
        var value = Math.round(Number(amount) || 0);
        return window.formatCurrency(value);
    }

    function methodLabel(p) {
        var m = p.method || p.paymentMethod || p.payment_method || "";
        var icons = { CARD: "💳", TRANSFER: "🏦", CASH: "💵" };
        return "<span>" + (icons[m] || "💰") + " <span data-i18n='method_" + m + "'>" + (m || "—") + "</span></span>";
    }

    function resolveStatus(p) {
        if (p.status) return p.status;
        if (p.paidAt || p.paid_at) return "COMPLETED";
        return "PENDING";
    }

    /* ── render ── */
    function renderPayments(list) {
        var body = document.getElementById("payments-body");
        if (!list || !list.length) {
            body.innerHTML = "<tr><td colspan='7' class='table-empty'>No payments found.</td></tr>";
        if (typeof applyTranslations === 'function') applyTranslations(global.localStorage.getItem('sot_lang') || 'en');
            return;
        }
        body.innerHTML = list.map(function (p) {
            var id      = p.invoiceId || p.paymentID || p.invoiceID || p.id || "";
            var rawUserId = p.user ? (p.user.userID || p.user.userId || p.user.id) : p.userId;
            var guest   = p.user && p.user.fullName ? p.user.fullName : (userMap[rawUserId] || (rawUserId ? rawUserId.substring(0,8) : "—"));
            var rawBookingId = p.bookingId || (p.booking && p.booking.bookingID) || p.booking_booking_id || "";
            var booking = roomMap[rawBookingId] || (rawBookingId ? "Booking #" + rawBookingId.substring(0,8) : "—");
            var paymentAmount = p.finalAmount != null ? p.finalAmount : p.amount;
            var amount  = paymentAmount != null ? formatMoney(paymentAmount) : "—";
            var status  = resolveStatus(p);
            var canAct  = status === "PENDING";

            return "<tr>"
                + "<td><code style='font-size:.8rem;color:var(--text-muted)'>#" + (id ? id.substring(0,8).toUpperCase() : "—") + "</code></td>"
                + "<td>" + guest + "</td>"
                + "<td>" + booking + "</td>"
                + "<td class='amount-col'>" + amount + "</td>"
                + "<td>" + methodLabel(p) + "</td>"
                + "<td>" + statusBadge(status) + "</td>"
                + "<td><div class='actions-cell'>"
                + (canAct ? "<button class='btn-approve' onclick='confirmAction(\"approve\",\"" + id + "\")'><i class='fas fa-check'></i><span data-i18n='admin_btn_approve'> " + (currentLang() === 'vi' ? "Chấp nhận" : "Approve") + "</span></button>" : "")
                + (canAct ? "<button class='btn-reject'  onclick='confirmAction(\"reject\",\""  + id + "\")'><i class='fas fa-times'></i> <span data-i18n='admin_btn_reject'> " + (currentLang() === 'vi' ? "Từ chối" : "Reject") + "</span></button>" : "")
                + "<button class='btn-del' onclick='confirmAction(\"delete\",\"" + id + "\")'><i class='fas fa-trash'></i></button>"
                + "</div></td>"
                + "</tr>";
        }).join("");
    }

    /* ── stats ── */
    function updateStats(list) {
        var pending   = list.filter(function (p) { return resolveStatus(p) === "PENDING"; }).length;
        var completed = list.filter(function (p) { return resolveStatus(p) === "COMPLETED"; }).length;
        var revenue   = list.filter(function (p) { return resolveStatus(p) === "COMPLETED"; })
                           .reduce(function (s, p) { return s + (Number(p.finalAmount != null ? p.finalAmount : p.amount) || 0); }, 0);
        document.getElementById("stat-total").textContent     = list.length;
        document.getElementById("stat-pending").textContent   = pending;
        document.getElementById("stat-completed").textContent = completed;
        document.getElementById("stat-revenue").textContent   = formatMoney(revenue);
    }

    /* ── filters ── */
    window.applyFilters = function () {
        var status = document.getElementById("filter-status").value;
        var method = document.getElementById("filter-method").value;
        var search = document.getElementById("filter-search").value.toLowerCase();

        var filtered = allPayments.filter(function (p) {
            var s = resolveStatus(p);
            var m = p.method || p.paymentMethod || p.payment_method || "";
            var booking = String(p.bookingId || (p.booking && p.booking.bookingID) || "");
            var guest   = p.user ? String(p.user.fullName || p.user.email || "") : "";
            if (status && s !== status) return false;
            if (method && m !== method) return false;
            if (search && !booking.toLowerCase().includes(search) && !guest.toLowerCase().includes(search)) return false;
            return true;
        });
        renderPayments(filtered);
    };

    window.resetFilters = function () {
        document.getElementById("filter-status").value = "";
        document.getElementById("filter-method").value = "";
        document.getElementById("filter-search").value = "";
        renderPayments(allPayments);
    };

    /* ── modal ── */
    var pendingAction = null;

    window.confirmAction = function (type, id) {
        var isVi = currentLang() === 'vi';
        var config = {
            approve: { 
                title: isVi ? "Duyệt Thanh Toán" : "Approve Payment", 
                body: isVi ? "Đánh dấu thanh toán #" + id.substring(0,8) + " là Đã Hoàn Thành?" : "Mark payment #" + id.substring(0,8) + " as Completed?",         
                color: "#1b4332", bg: "#d8f3dc" 
            },
            reject:  { 
                title: isVi ? "Từ Chối Thanh Toán" : "Reject Payment",  
                body: isVi ? "Từ chối thanh toán #" + id.substring(0,8) + "? Thao tác không thể hoàn tác." : "Reject payment #" + id.substring(0,8) + "? Cannot be undone.",  
                color: "#7f0000", bg: "#ffe0e0" 
            },
            delete:  { 
                title: isVi ? "Xoá Thanh Toán" : "Delete Payment",  
                body: isVi ? "Xoá vĩnh viễn thanh toán #" + id.substring(0,8) + "?" : "Permanently delete payment #" + id.substring(0,8) + "?",        
                color: "#7f0000", bg: "#ffe0e0" 
            }
        };
        var c = config[type];
        document.getElementById("modal-title").textContent = c.title;
        document.getElementById("modal-body").textContent  = c.body;
        var btn = document.getElementById("modal-confirm-btn");
        btn.style.background = c.bg;
        btn.style.color      = c.color;
        btn.style.border     = "1px solid " + c.color + "40";
        pendingAction = { type: type, id: id };
        document.getElementById("confirm-modal").style.display = "flex";
    };

    window.closeModal = function () {
        document.getElementById("confirm-modal").style.display = "none";
        pendingAction = null;
    };

    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("modal-confirm-btn").addEventListener("click", function () {
            if (!pendingAction) return;
            var type = pendingAction.type;
            var id   = pendingAction.id;
            window.closeModal();

            var promise;
            if (type === "approve") {
                promise = window.PaymentApi.updatePaymentStatus(id, "COMPLETED");
            } else if (type === "reject") {
                promise = window.PaymentApi.updatePaymentStatus(id, "REJECTED");
            } else {
                promise = window.PaymentApi.deletePayment(id);
            }

            promise.then(function () {
                var isVi = currentLang() === 'vi';
                var msg = "";
                if (type === "approve") msg = isVi ? "Thanh toán đã được duyệt." : "Payment approved.";
                else if (type === "reject") msg = isVi ? "Thanh toán đã bị từ chối." : "Payment rejected.";
                else msg = isVi ? "Thanh toán đã bị xoá." : "Payment deleted.";
                
                flash(msg, "success");
                loadPayments();
            }).catch(function (err) {
                flash((err && err.payload && (err.payload.message || err.payload.error)) || "Action failed.", "error");
            });
        });
    });

    /* ── load ── */
    function loadPayments() {
        var pUsers = window.UserApi ? window.UserApi.getUsers().catch(function(){return [];}) : Promise.resolve([]);
        var pRooms = window.RoomApi ? window.RoomApi.getRooms().catch(function(){return [];}) : Promise.resolve([]);
        var pBookings = window.BookingApi ? window.BookingApi.getBookings().catch(function(){return [];}) : Promise.resolve([]);
        var pPayments = window.PaymentApi.getPayments();

        Promise.all([pUsers, pRooms, pBookings, pPayments])
            .then(function (res) {
                var users = res[0] || [];
                var rooms = res[1] || [];
                var bookings = res[2] || [];
                var data = res[3];
                
                var rawUsers = Array.isArray(users) ? users : (users.payload || users.data || []);
                rawUsers.forEach(function (u) {
                    var id = u.userID || u.id || "";
                    if (id) userMap[id] = u.fullName || u.name;
                });

                var rMap = {};
                var rawRooms = Array.isArray(rooms) ? rooms : (rooms.payload || rooms.data || []);
                rawRooms.forEach(function (r) {
                    var id = r.roomID || r.roomId || r.id || "";
                    if (id) rMap[id] = r.roomName || r.name;
                });

                var rawBookings = Array.isArray(bookings) ? bookings : (bookings.payload || bookings.data || []);
                rawBookings.forEach(function(b) {
                    var id = b.bookingId || b.bookingID || b.id || "";
                    var rId = b.roomId || (b.room && (b.room.roomId || b.room.roomID));
                    if (id) {
                        var rName = (rId && rMap[rId]) ? rMap[rId] : (b.roomName || (b.room && b.room.roomName));
                        if (rName) roomMap[id] = rName;
                    }
                });

                allPayments = data || [];
                updateStats(allPayments);
                renderPayments(allPayments);
            })
            .catch(function () {
                document.getElementById("payments-body").innerHTML =
                    "<tr><td colspan='7' class='table-empty'>Could not load payments. Check API connection.</td></tr>";
            });
    }

    /* ── sidebar / topbar helpers ── */
    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };
    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };
    window.toggleNotification = function (e) {
        e.stopPropagation();
        document.getElementById("notificationMenu").classList.toggle("active");
    };
    window.handleLogout = function () {
        if (window.AuthStore) window.AuthStore.clearCurrentUser();
        window.location.href = "index.html";
    };

    /* ── init ── */
    document.addEventListener("DOMContentLoaded", function () {
        if (!window.Guard.requireAdmin()) return;

        document.addEventListener("click", function () {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        });

        var user = window.AuthStore.getCurrentUser();
        if (user) {
            document.getElementById("topbar-username").textContent  = user.fullName || "Admin";
            document.getElementById("sidebar-username").textContent = user.fullName || "Admin";
        }

        loadPayments();
    });
})();
