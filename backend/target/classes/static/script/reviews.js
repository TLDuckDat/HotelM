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
        var currentUserId = String(user.userId || user.userID || user.id || "");

        // Fetch rooms and bookings to map room names correctly
        return Promise.all([global.RoomApi.getRooms(), global.BookingApi.getBookings()]).then(function (results) {
            var roomsData = results[0];
            var bookingsData = results[1];
            
            var rooms = Array.isArray(roomsData) ? roomsData : (roomsData.payload || roomsData.data || []);
            var roomMap = {};
            rooms.forEach(function (room) {
                var id = room.roomId || room.roomID || room.id;
                var name = room.roomName || room.name || id;
                if (id) roomMap[id] = name;
            });

            var bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.payload || bookingsData.data || []);
            var mine = bookings.filter(function (b) {
                return String(b.userId || b.userID || "") === currentUserId;
            });

            var select = document.getElementById("review-booking-id");
            if (!select) return;

            if (!mine.length) {
                select.innerHTML = "<option value=''>No booking found</option>";
                return;
            }

            select.innerHTML = mine.map(function (b) {
                var rid = b.roomId || b.roomID || "";
                var roomName = roomMap[rid] || rid || "Room";
                var checkIn = b.checkIn ? String(b.checkIn).replace('T', ' ').substring(0, 16) : "";
                var display = roomName + (checkIn ? " (Check-in: " + checkIn + ")" : "");
                return "<option value='" + rid + "'>" + display + "</option>";
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
                var roomDisp = r.roomName || r.roomId || "Unknown Room";
                var stars = "";
                for (var i = 1; i <= 5; i++) {
                    stars += "<span style='color:" + (i <= Number(r.rating) ? "#C9A050" : "#ddd") + "'>★</span>";
                }
                return "<div style='background:var(--light);border:1px solid var(--border);border-radius:10px;padding:16px 18px;margin-bottom:12px;'>"
                    + "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;'>"
                    + "<span style='font-size:.85rem;color:var(--text-muted);'>"
                    + "Room: " + roomDisp
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
                    + "<td>" + (r.roomName || r.roomId || "") + "</td>"
                    + "<td>" + (r.rating || "") + "</td>"
                    + "<td>" + text + "</td>"
                    + "</tr>";
            }).join("");
        }
    }

    function loadReviews() {
        var user = global.AuthStore.getCurrentUser();
        var currentUserId = String(user.userId || user.userID || user.id || "");

        return Promise.all([global.RoomApi.getRooms(), global.ReviewApi.getReviews()])
            .then(function (results) {
                var roomsData = results[0];
                var reviewsData = results[1];

                var rooms = Array.isArray(roomsData) ? roomsData : (roomsData.payload || roomsData.data || []);
                var roomMap = {};
                rooms.forEach(function(room) {
                    var id = room.roomId || room.roomID || room.id;
                    if (id) roomMap[id] = room.roomName || room.name || id;
                });

                var list = Array.isArray(reviewsData) ? reviewsData : (reviewsData.payload || reviewsData.data || []);
                var mine = list.filter(function (r) {
                    if (r.userId) return String(r.userId) === currentUserId;
                    if (r.user && r.user.userID) return String(r.user.userID) === currentUserId;
                    return true;
                });

                // Attach roomName to each review for rendering
                mine.forEach(function(r) {
                    var rid = r.roomId || r.roomID;
                    r.roomName = roomMap[rid] || rid || "Unknown Room";
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
        var currentUserId = String(user.userId || user.userID || user.id || "");
        var roomId    = document.getElementById("review-booking-id").value;
        var rating    = getSelectedRating();
        // Use "comment" as the payload field name to match backend
        var comment   = document.getElementById("review-content").value.trim();

        if (!roomId || !rating || rating < 1 || rating > 5 || !comment) {
            setMessage("Please complete all review fields.", "error");
            return;
        }

        setMessage("Submitting review...", "notice");

        global.ReviewApi.createReview({
            roomId:    roomId,
            userId:    currentUserId,
            rating:    rating,
            comment:   comment
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