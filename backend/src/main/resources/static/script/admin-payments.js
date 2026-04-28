(function () {
    "use strict";

    var allPayments = [];

    /* ── helpers ── */
    function flash(msg, type) {
        var el = document.getElementById("admin-message");
        el.textContent = msg;
        el.className = "flash-message " + (type || "notice");
        el.style.display = "block";
        setTimeout(function () { el.style.display = "none"; }, 4000);
    }

    function statusBadge(s) {
        var map = { PENDING: "badge-pending", COMPLETED: "badge-confirmed", FAILED: "badge-cancelled", REJECTED: "badge-cancelled" };
        return "<span class='badge " + (map[s] || "badge-maintenance") + "'>" + (s || "PENDING") + "</span>";
    }

    function methodLabel(p) {
        var m = p.method || p.paymentMethod || p.payment_method || "";
        var icons = { CARD: "💳", TRANSFER: "🏦", CASH: "💵" };
        return (icons[m] || "💰") + " " + (m || "—");
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
            return;
        }
        body.innerHTML = list.map(function (p) {
            var id      = p.invoiceId || p.paymentID || p.invoiceID || p.id || "—";
            var guest   = p.user ? (p.user.fullName || p.user.email || p.user.userID) : (p.userId || "—");
            var booking = p.bookingId || (p.booking && p.booking.bookingID) || p.booking_booking_id || "—";
            var amount  = p.amount != null ? "$" + Number(p.amount).toFixed(2) : "—";
            var status  = resolveStatus(p);
            var canAct  = status === "PENDING";

            return "<tr>"
                + "<td><code style='font-size:.8rem;color:var(--text-muted)'>#" + id + "</code></td>"
                + "<td>" + guest + "</td>"
                + "<td>" + booking + "</td>"
                + "<td class='amount-col'>" + amount + "</td>"
                + "<td>" + methodLabel(p) + "</td>"
                + "<td>" + statusBadge(status) + "</td>"
                + "<td><div class='actions-cell'>"
                + (canAct ? "<button class='btn-approve' onclick='confirmAction(\"approve\",\"" + id + "\")'><i class='fas fa-check'></i><span data-i18n='admin_approve'> Approve</button>" : "")
                + (canAct ? "<button class='btn-reject'  onclick='confirmAction(\"reject\",\""  + id + "\")'><i class='fas fa-times'></i> <span data-i18n='admin_reject'>Reject</button>" : "")
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
                           .reduce(function (s, p) { return s + (Number(p.amount) || 0); }, 0);
        document.getElementById("stat-total").textContent     = list.length;
        document.getElementById("stat-pending").textContent   = pending;
        document.getElementById("stat-completed").textContent = completed;
        document.getElementById("stat-revenue").textContent   = "$" + revenue.toFixed(2);
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
        var config = {
            approve: { title: "Approve Payment", body: "Mark payment #" + id + " as Completed?",         color: "#1b4332", bg: "#d8f3dc" },
            reject:  { title: "Reject Payment",  body: "Reject payment #" + id + "? Cannot be undone.",  color: "#7f0000", bg: "#ffe0e0" },
            delete:  { title: "Delete Payment",  body: "Permanently delete payment #" + id + "?",        color: "#7f0000", bg: "#ffe0e0" }
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
                flash(type === "approve" ? "Payment approved." : type === "reject" ? "Payment rejected." : "Payment deleted.", "success");
                loadPayments();
            }).catch(function (err) {
                flash((err && err.payload && (err.payload.message || err.payload.error)) || "Action failed.", "error");
            });
        });
    });

    /* ── load ── */
    function loadPayments() {
        window.PaymentApi.getPayments()
            .then(function (data) {
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
