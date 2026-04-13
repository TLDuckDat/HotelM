(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("reviews-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    function loadBookingOptions() {
        var user = global.AuthStore.getCurrentUser();

        return global.BookingApi.getBookings().then(function (bookings) {
            var mine = (bookings || []).filter(function (b) {
                return b.user && b.user.userID === user.userID;
            });

            var select = document.getElementById("review-booking-id");
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

    function renderReviews(reviews) {
        var wrap = document.getElementById("review-cards-wrap");
        var body = document.getElementById("reviews-body"); // hidden table, kept for compatibility

        if (!reviews || !reviews.length) {
            if (wrap) wrap.innerHTML = "<p style='color:var(--text-muted);font-size:.88rem;'>No reviews yet.</p>";
            if (body) body.innerHTML = "<tr><td colspan='4'>No review found</td></tr>";

            var elTotal = document.getElementById("stat-total");
            var elAvg   = document.getElementById("stat-avg");
            var elFive  = document.getElementById("stat-five");
            if (elTotal) elTotal.textContent = "0";
            if (elAvg)   elAvg.textContent   = "—";
            if (elFive)  elFive.textContent  = "0";
            return;
        }

        // Stats
        var ratings   = reviews.map(function (r) { return Number(r.rating); }).filter(Boolean);
        var avg       = ratings.length ? (ratings.reduce(function (a, b) { return a + b; }, 0) / ratings.length).toFixed(1) : "—";
        var fiveStars = reviews.filter(function (r) { return Number(r.rating) === 5; }).length;
        var elTotal = document.getElementById("stat-total");
        var elAvg   = document.getElementById("stat-avg");
        var elFive  = document.getElementById("stat-five");
        if (elTotal) elTotal.textContent = reviews.length;
        if (elAvg)   elAvg.textContent   = avg;
        if (elFive)  elFive.textContent  = fiveStars;

        // Cards
        if (wrap) {
            wrap.innerHTML = reviews.map(function (r) {
                // DB field is "comment"; backend may also expose as "content"
                var text = r.comment || r.content || "";
                // DB links review to room; backend may also expose bookingId
                var ref  = r.bookingId || (r.room && (r.room.roomName || r.room.roomID)) || "";
                var stars = "";
                for (var i = 1; i <= 5; i++) {
                    stars += "<span style='color:" + (i <= Number(r.rating) ? "#C9A050" : "#ddd") + "'>★</span>";
                }
                return "<div style='background:var(--light);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-bottom:12px;'>"
                    + "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;'>"
                    + "<span style='font-size:.85rem;color:var(--text-muted);'>"
                    + (r.bookingId ? "Booking #" + r.bookingId : "Room: " + ref)
                    + "</span>"
                    + "<span>" + stars + "</span>"
                    + "</div>"
                    + "<p style='font-size:.88rem;color:var(--dark);line-height:1.5;'>" + text + "</p>"
                    + "</div>";
            }).join("");
        }

        // Hidden table (kept for compatibility)
        if (body) {
            body.innerHTML = reviews.map(function (r) {
                var text = r.comment || r.content || "";
                return "<tr>"
                    + "<td>" + (r.reviewID || r.id || "") + "</td>"
                    + "<td>" + (r.bookingId || "") + "</td>"
                    + "<td>" + (r.rating || "") + "</td>"
                    + "<td>" + text + "</td>"
                    + "</tr>";
            }).join("");
        }
    }

    function loadReviews() {
        var user = global.AuthStore.getCurrentUser();

        return global.ReviewApi.getReviews()
            .then(function (reviews) {
                var mine = (reviews || []).filter(function (r) {
                    if (r.userId) return r.userId === user.userID;
                    if (r.user && r.user.userID) return r.user.userID === user.userID;
                    return true;
                });
                renderReviews(mine);
            })
            .catch(function (err) {
                renderReviews([]);
                var msg = err && err.status === 404
                    ? "Review API is not available yet. UI is ready."
                    : "Cannot load reviews.";
                setMessage(msg, "notice");
            });
    }

    function getSelectedRating() {
        // Read from CSS star radio inputs
        var radios = document.querySelectorAll("input[name='rating']");
        for (var i = 0; i < radios.length; i++) {
            if (radios[i].checked) return Number(radios[i].value);
        }
        // Fallback to hidden select
        var sel = document.getElementById("review-rating");
        return sel ? Number(sel.value) : 0;
    }

    function submitReview() {
        var user      = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("review-booking-id").value;
        var rating    = getSelectedRating();
        // Use "content" as the payload field name — backend should map to DB "comment" column
        var content   = document.getElementById("review-content").value.trim();

        if (!bookingId || !rating || rating < 1 || rating > 5 || !content) {
            setMessage("Please complete all review fields.", "error");
            return;
        }

        setMessage("Submitting review...", "notice");

        global.ReviewApi.createReview({
            bookingId: bookingId,
            userId:    user.userID,
            rating:    rating,
            content:   content   // backend maps this to the "comment" column
        }).then(function () {
            setMessage("Review submitted.", "success");
            document.getElementById("review-booking-id").value = "";
            document.getElementById("review-content").value    = "";
            var radios = document.querySelectorAll("input[name='rating']");
            radios.forEach(function (r) { r.checked = false; });
            var hiddenSel = document.getElementById("review-rating");
            if (hiddenSel) hiddenSel.value = "";
            loadReviews();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit review failed")
                : "Submit review failed";
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

        // Sync star radio clicks → hidden select
        var radios    = document.querySelectorAll("input[name='rating']");
        var hiddenSel = document.getElementById("review-rating");
        radios.forEach(function (radio) {
            radio.addEventListener("change", function () {
                if (hiddenSel) hiddenSel.value = radio.value;
            });
        });

        Promise.all([
            loadBookingOptions(),
            loadReviews()
        ]).catch(function () {
            setMessage("Cannot initialize reviews page.", "error");
        });

        var btn = document.getElementById("review-submit-btn");
        if (btn) btn.addEventListener("click", submitReview);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);