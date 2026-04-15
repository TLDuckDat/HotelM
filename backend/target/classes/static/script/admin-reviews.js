(function () {
    "use strict";

    var allReviews   = [];
    var currentView  = "table";
    var filteredList = [];

    /* ── helpers ── */
    function flash(msg, type) {
        var el = document.getElementById("admin-message");
        el.textContent = msg;
        el.className = "flash-message " + (type || "notice");
        el.style.display = "block";
        setTimeout(function () { el.style.display = "none"; }, 4000);
    }

    function starsHtml(n) {
        n = Number(n) || 0;
        var s = "";
        for (var i = 1; i <= 5; i++) {
            s += "<span style='color:" + (i <= n ? "#C9A050" : "#ddd") + "'>★</span>";
        }
        return "<span class='stars-display'>" + s + "</span>";
    }

    function statusBadge(s) {
        if (s === "HIDDEN") return "<span class='badge badge-hidden'>Hidden</span>";
        return "<span class='badge badge-published'>Published</span>";
    }

    function resolveText(r) {
        // DB column is "comment"; backend may also expose as "content"
        return r.comment || r.content || "—";
    }

    function resolveRef(r) {
        // DB links review to room, not booking.
        // Backend may expose bookingId if it joins through the booking table.
        if (r.bookingId) return "Booking #" + r.bookingId;
        if (r.room) return "Room: " + (r.room.roomName || r.room.roomID || "");
        return "—";
    }

    /* ── TABLE render ── */
    function renderTable(list) {
        var body = document.getElementById("reviews-body");
        if (!list || !list.length) {
            body.innerHTML = "<tr><td colspan='7' class='table-empty'>No reviews found.</td></tr>";
            return;
        }
        body.innerHTML = list.map(function (r) {
            var id     = r.reviewID || r.id || "—";
            var guest  = r.user ? (r.user.fullName || r.user.email || r.user.userID) : (r.userId || "—");
            var ref    = resolveRef(r);
            var text   = resolveText(r);
            var status = r.status || "PUBLISHED";
            var isHidden = status === "HIDDEN";

            return "<tr>"
                + "<td><code style='font-size:.8rem;color:var(--text-muted)'>#" + id + "</code></td>"
                + "<td>" + guest + "</td>"
                + "<td>" + ref + "</td>"
                + "<td>" + starsHtml(r.rating) + " <span style='font-size:.8rem;color:var(--text-muted)'>(" + (r.rating || "?") + ")</span></td>"
                + "<td class='content-cell'>" + text + "</td>"
                + "<td>" + statusBadge(status) + "</td>"
                + "<td><div class='actions-cell'>"
                + (isHidden
                    ? "<button class='btn-approve' onclick='confirmAction(\"publish\",\"" + id + "\")'><i class='fas fa-eye'></i> Publish</button>"
                    : "<button class='btn-reject'  onclick='confirmAction(\"hide\",\""    + id + "\")'><i class='fas fa-eye-slash'></i> Hide</button>")
                + "<button class='btn-del' onclick='confirmAction(\"delete\",\"" + id + "\")'><i class='fas fa-trash'></i></button>"
                + "</div></td>"
                + "</tr>";
        }).join("");
    }

    /* ── CARDS render ── */
    function renderCards(list) {
        var grid = document.getElementById("reviews-cards-grid");
        if (!list || !list.length) {
            grid.innerHTML = "<p style='color:var(--text-muted);font-size:.9rem;grid-column:1/-1;'>No reviews found.</p>";
            return;
        }
        grid.innerHTML = list.map(function (r) {
            var id     = r.reviewID || r.id || "—";
            var guest  = r.user ? (r.user.fullName || r.user.email || r.user.userID) : (r.userId || "—");
            var ref    = resolveRef(r);
            var text   = resolveText(r);
            var status = r.status || "PUBLISHED";
            var isHidden = status === "HIDDEN";

            return "<div class='review-card'>"
                + "<div class='review-card-header'>"
                + "<div>"
                + "<div class='review-card-guest'>" + guest + "</div>"
                + "<div class='review-card-meta'>" + ref + " &nbsp;·&nbsp; " + starsHtml(r.rating) + "</div>"
                + "</div>"
                + statusBadge(status)
                + "</div>"
                + "<div class='review-card-content'>\"" + text + "\"</div>"
                + "<div class='review-card-actions'>"
                + (isHidden
                    ? "<button class='btn-approve' onclick='confirmAction(\"publish\",\"" + id + "\")'><i class='fas fa-eye'></i> Publish</button>"
                    : "<button class='btn-reject'  onclick='confirmAction(\"hide\",\""    + id + "\")'><i class='fas fa-eye-slash'></i> Hide</button>")
                + "<button class='btn-del' onclick='confirmAction(\"delete\",\"" + id + "\")'><i class='fas fa-trash'></i></button>"
                + "</div>"
                + "</div>";
        }).join("");
    }

    function render(list) {
        filteredList = list;
        if (currentView === "table") renderTable(list);
        else renderCards(list);
    }

    /* ── view toggle ── */
    window.setView = function (v) {
        currentView = v;
        document.getElementById("table-view").style.display    = v === "table" ? "block" : "none";
        document.getElementById("cards-view").style.display    = v === "cards" ? "block" : "none";
        document.getElementById("view-table-btn").classList.toggle("active", v === "table");
        document.getElementById("view-cards-btn").classList.toggle("active", v === "cards");
        render(filteredList);
    };

    /* ── stats ── */
    function updateStats(list) {
        var ratings   = list.map(function (r) { return Number(r.rating); }).filter(Boolean);
        var avg       = ratings.length ? (ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length).toFixed(1) : "—";
        var published = list.filter(function (r) { return (r.status || "PUBLISHED") !== "HIDDEN"; }).length;
        var hidden    = list.filter(function (r) { return r.status === "HIDDEN"; }).length;
        document.getElementById("stat-total").textContent     = list.length;
        document.getElementById("stat-avg").textContent       = avg;
        document.getElementById("stat-published").textContent = published;
        document.getElementById("stat-hidden").textContent    = hidden;
    }

    /* ── filters ── */
    window.applyFilters = function () {
        var rating = document.getElementById("filter-rating").value;
        var status = document.getElementById("filter-status").value;
        var search = document.getElementById("filter-search").value.toLowerCase();

        var filtered = allReviews.filter(function (r) {
            var s     = r.status || "PUBLISHED";
            var guest = r.user ? String(r.user.fullName || r.user.email || "") : "";
            var text  = resolveText(r);
            if (rating && String(r.rating) !== rating) return false;
            if (status && s !== status) return false;
            if (search && !guest.toLowerCase().includes(search) && !text.toLowerCase().includes(search)) return false;
            return true;
        });
        render(filtered);
    };

    window.resetFilters = function () {
        document.getElementById("filter-rating").value = "";
        document.getElementById("filter-status").value = "";
        document.getElementById("filter-search").value = "";
        render(allReviews);
    };

    /* ── modal ── */
    var pendingAction = null;

    window.confirmAction = function (type, id) {
        var config = {
            publish: { title: "Publish Review", body: "Make review #" + id + " visible to guests?",   color: "#1b4332", bg: "#d8f3dc" },
            hide:    { title: "Hide Review",    body: "Hide review #" + id + " from public view?",     color: "#856404", bg: "#fff3cd" },
            delete:  { title: "Delete Review",  body: "Permanently delete review #" + id + "?",        color: "#7f0000", bg: "#ffe0e0" }
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
            if (type === "publish") {
                promise = window.ReviewApi.updateReviewStatus(id, "PUBLISHED");
            } else if (type === "hide") {
                promise = window.ReviewApi.updateReviewStatus(id, "HIDDEN");
            } else {
                promise = window.ReviewApi.deleteReview(id);
            }

            promise.then(function () {
                flash(type === "publish" ? "Review published." : type === "hide" ? "Review hidden." : "Review deleted.", "success");
                loadReviews();
            }).catch(function (err) {
                flash((err && err.payload && (err.payload.message || err.payload.error)) || "Action failed.", "error");
            });
        });
    });

    /* ── load ── */
    function loadReviews() {
        window.ReviewApi.getReviews()
            .then(function (data) {
                allReviews = data || [];
                updateStats(allReviews);
                render(allReviews);
            })
            .catch(function () {
                document.getElementById("reviews-body").innerHTML =
                    "<tr><td colspan='7' class='table-empty'>Could not load reviews. Check API connection.</td></tr>";
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

        loadReviews();
    });
})();
