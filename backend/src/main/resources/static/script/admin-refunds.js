(function () {
    "use strict";

    var allRefunds = [];
    function refundIdOf(r) {
        return r.refundId || r.refundID || r.id || "—";
    }

    function bookingIdOf(r) {
        return r.bookingId || (r.booking && (r.booking.bookingId || r.booking.bookingID)) || "—";
    }

    /* ── helpers ── */
    function flash(msg, type) {
        var el = document.getElementById("admin-message");
        el.textContent = msg;
        el.className = "flash-message " + (type || "notice");
        el.style.display = "block";
        setTimeout(function () { el.style.display = "none"; }, 4000);
    }

    function statusBadge(s) {
        var map = { PENDING: "badge-pending", APPROVED: "badge-confirmed", REJECTED: "badge-cancelled" };
        return "<span class='badge " + (map[s] || "badge-maintenance") + "'>" + (s || "PENDING") + "</span>";
    }

    /* ── render ── */
    function renderRefunds(list) {
        var body = document.getElementById("refunds-body");
        if (!list || !list.length) {
            body.innerHTML = "<tr><td colspan='6' class='table-empty'>No refund requests found.</td></tr>";
            return;
        }
        body.innerHTML = list.map(function (r) {
            var id      = refundIdOf(r);
            var guest   = r.userName || (r.user ? (r.user.fullName || r.user.email || r.user.userID) : (r.userId || "—"));
            var booking = bookingIdOf(r);
            var status  = r.status || "PENDING";
            var canAct  = status === "PENDING";

            return "<tr>"
                + "<td><code style='font-size:.8rem;color:var(--text-muted)'>#" + id + "</code></td>"
                + "<td>" + guest + "</td>"
                + "<td>" + booking + "</td>"
                + "<td class='reason-cell'>" + (r.reason || "—") + "</td>"
                + "<td>" + statusBadge(status) + "</td>"
                + "<td><div class='actions-cell'>"
                + (canAct ? "<button class='btn-approve' onclick='confirmAction(\"approve\",\"" + id + "\")'><i class='fas fa-check'></i> <span data-i18n='admin_actions_approve'>Approve</span></button>" : "")
                + (canAct ? "<button class='btn-reject'  onclick='confirmAction(\"reject\",\""  + id + "\")'><i class='fas fa-times'></i> <span data-i18n='admin_actions_reject'>Reject</span></button>" : "")
                + "<button class='btn-del' onclick='confirmAction(\"delete\",\"" + id + "\")'><i class='fas fa-trash'></i> <span data-i18n='admin_actions_delete'>Delete</span></button>"
                + "</div></td>"
                + "</tr>";
        }).join("");
    }

    /* ── stats ── */
    function updateStats(list) {
        var pending  = list.filter(function (r) { return (r.status || "PENDING") === "PENDING"; }).length;
        var approved = list.filter(function (r) { return r.status === "APPROVED"; }).length;
        var rejected = list.filter(function (r) { return r.status === "REJECTED"; }).length;
        document.getElementById("stat-total").textContent    = list.length;
        document.getElementById("stat-pending").textContent  = pending;
        document.getElementById("stat-approved").textContent = approved;
        document.getElementById("stat-rejected").textContent = rejected;
    }

    /* ── filters ── */
    window.applyFilters = function () {
        var status = document.getElementById("filter-status").value;
        var search = document.getElementById("filter-search").value.toLowerCase();

        var filtered = allRefunds.filter(function (r) {
            var s       = r.status || "PENDING";
            var booking = String(bookingIdOf(r));
            var guest   = String(r.userName || (r.user ? (r.user.fullName || r.user.email || "") : ""));
            if (status && s !== status) return false;
            if (search && !booking.toLowerCase().includes(search) && !guest.toLowerCase().includes(search)) return false;
            return true;
        });
        renderRefunds(filtered);
    };

    window.resetFilters = function () {
        document.getElementById("filter-status").value = "";
        document.getElementById("filter-search").value = "";
        renderRefunds(allRefunds);
    };

    /* ── modal ── */
    var pendingAction = null;

    window.confirmAction = function (type, id) {
        var config = {
            approve: { title: "Approve Refund",  body: "Approve refund request #" + id + "?",              color: "#1b4332", bg: "#d8f3dc" },
            reject:  { title: "Reject Refund",   body: "Reject refund request #" + id + "?",               color: "#7f0000", bg: "#ffe0e0" },
            delete:  { title: "Delete Request",  body: "Permanently delete refund request #" + id + "?",   color: "#7f0000", bg: "#ffe0e0" }
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
                promise = window.RefundApi.updateRefundStatus(id, "APPROVED");
            } else if (type === "reject") {
                promise = window.RefundApi.updateRefundStatus(id, "REJECTED");
            } else {
                promise = window.RefundApi.deleteRefund(id);
            }

            promise.then(function () {
                flash(type === "approve" ? "Refund approved." : type === "reject" ? "Refund rejected." : "Request deleted.", "success");
                loadRefunds();
            }).catch(function (err) {
                flash((err && err.payload && (err.payload.message || err.payload.error)) || "Action failed.", "error");
            });
        });
    });

    /* ── load ── */
    function loadRefunds() {
        window.RefundApi.getRefunds()
            .then(function (data) {
                allRefunds = Array.isArray(data) ? data : ((data && (data.payload || data.data)) || []);
                updateStats(allRefunds);
                renderRefunds(allRefunds);
            })
            .catch(function () {
                document.getElementById("refunds-body").innerHTML =
                    "<tr><td colspan='6' class='table-empty'>Could not load refund requests. Check API connection.</td></tr>";
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

        loadRefunds();
    });
})();
