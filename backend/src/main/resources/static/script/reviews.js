(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("reviews-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
        el.style.display = "block";
    }

    function getCurrentUserId() {
        var user = global.AuthStore.getCurrentUser();
        return user ? String(user.userId || user.userID || user.id || "") : "";
    }

    function getBookingId(b) {
        return b.bookingId || b.bookingID || b.id || "";
    }

    function loadBookingOptions(existingReviews) {
        var currentUserId = getCurrentUserId();
        if (!currentUserId) {
            setMessage("Cannot identify current user.", "error");
            return Promise.resolve();
        }

        var reviewedBookingIds = (existingReviews || []).map(function (r) {
            return String(r.bookingId || r.bookingID || "");
        }).filter(Boolean);

        var bookingLoader = global.BookingApi.getBookingsByUser
            ? global.BookingApi.getBookingsByUser(currentUserId)
            : global.BookingApi.getBookings();

        return Promise.all([global.RoomApi.getRooms(), bookingLoader]).then(function (results) {
            var roomsData = results[0];
            var bookingsData = results[1];

            var rooms = Array.isArray(roomsData) ? roomsData : (roomsData.payload || roomsData.data || []);
            var roomMap = {};
            rooms.forEach(function (room) {
                var id = room.roomId || room.roomID || room.id;
                var name = room.roomName || room.name || id;
                if (id) roomMap[id] = name;
            });

            var bookings = Array.isArray(bookingsData)
                ? bookingsData
                : (bookingsData.payload || bookingsData.data || []);

            var mine = bookings.filter(function (b) {
                var bUid = b.userId || b.userID
                    || (b.user && (b.user.userId || b.user.userID || b.user.id))
                    || "";
                if (String(bUid) !== currentUserId) return false;

                var status = (b.status || "").toUpperCase();
                if (status === "CANCELLED") return false;

                var bid = String(getBookingId(b));
                if (bid && reviewedBookingIds.indexOf(bid) !== -1) return false;

                return true;
            });

            var select = document.getElementById("review-booking-id");
            if (!select) return;

            if (!mine.length) {
                select.innerHTML = "<option value=''>No eligible booking for review</option>";
                return;
            }

            select.innerHTML = "<option value=''>Choose a booking…</option>"
                + mine.map(function (b) {
                    var rid = b.roomId || b.roomID || "";
                    var bid = getBookingId(b);
                    var roomName = roomMap[rid] || "Room " + (rid ? rid.substring(0, 8) : "—");
                    var checkIn = b.checkIn ? new Date(b.checkIn).toLocaleDateString("vi-VN") : "";
                    var display = roomName + " (#" + bid.substring(0, 8) + ")"
                        + (checkIn ? " - " + checkIn : "")
                        + (b.status ? " [" + b.status + "]" : "");

                    return "<option value='" + rid + "' data-booking-id='" + bid + "'>" + display + "</option>";
                }).join("");
        }).catch(function (err) {
            var select = document.getElementById("review-booking-id");
            if (select) select.innerHTML = "<option value=''>Cannot load bookings</option>";
            var msg = (err && err.payload && (err.payload.message || err.payload.error))
                || "Cannot load your bookings.";
            setMessage(msg, "error");
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
        var currentUserId = getCurrentUserId();

        var reviewLoader = currentUserId && global.ReviewApi.getReviewsByUser
            ? global.ReviewApi.getReviewsByUser(currentUserId)
            : global.ReviewApi.getReviews();

        return Promise.all([global.RoomApi.getRooms(), reviewLoader])
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
                    if (!currentUserId) return true;
                    var rUid = r.userId || r.userID
                        || (r.user && (r.user.userId || r.user.userID || r.user.id))
                        || "";
                    return String(rUid) === currentUserId;
                });

                mine.forEach(function(r) {
                    var rid = r.roomId || r.roomID;
                    r.roomName = roomMap[rid] || r.roomName || rid || "Unknown Room";
                });

                renderReviews(mine);
                return mine;
            })
            .catch(function (err) {
                renderReviews([]);
                var msg = err && err.status === 404
                    ? "Review API is not available yet. UI is ready."
                    : "Cannot load reviews.";
                setMessage(msg, "notice");
                return [];
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
        var select    = document.getElementById("review-booking-id");
        var roomId    = select.value;
        var bookingId = "";
        if (select.selectedIndex >= 0) {
            bookingId = select.options[select.selectedIndex].getAttribute("data-booking-id") || "";
        }
        
        var rating    = getSelectedRating();
        // Use "comment" as the payload field name to match backend
        var comment   = document.getElementById("review-content").value.trim();

        if (!roomId || !bookingId || !rating || rating < 1 || rating > 5 || !comment) {
            setMessage("Please choose a booking and complete all review fields.", "error");
            return;
        }

        setMessage("Submitting review...", "notice");

        global.ReviewApi.createReview({
            roomId:    roomId,
            userId:    currentUserId,
            bookingId: bookingId,
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
            return loadReviews().then(function (mine) {
                return loadBookingOptions(mine);
            });
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

        var user = global.AuthStore.getCurrentUser();
        if (user && global.HotelMApiBase) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token || null);
        }

        // Sync star radio clicks → hidden select
        var radios    = document.querySelectorAll("input[name='rating']");
        var hiddenSel = document.getElementById("review-rating");
        radios.forEach(function (radio) {
            radio.addEventListener("change", function () {
                if (hiddenSel) hiddenSel.value = radio.value;
            });
        });

        loadReviews()
            .then(function (mine) {
                return loadBookingOptions(mine);
            })
            .catch(function () {
            setMessage("Cannot initialize reviews page.", "error");
        });

        var btn = document.getElementById("review-submit-btn");
        if (btn) btn.addEventListener("click", submitReview);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);