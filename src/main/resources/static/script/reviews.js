(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("reviews-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
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
        var body = document.getElementById("reviews-body");
        if (!body) return;

        if (!reviews || !reviews.length) {
            body.innerHTML = "<tr><td colspan='4'>No review found</td></tr>";
            return;
        }

        body.innerHTML = reviews.map(function (r) {
            return "<tr>"
                + "<td>" + (r.reviewID || r.id || "") + "</td>"
                + "<td>" + (r.bookingId || "") + "</td>"
                + "<td>" + (r.rating || "") + "</td>"
                + "<td>" + (r.content || r.comment || "") + "</td>"
                + "</tr>";
        }).join("");
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

    function submitReview(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        var bookingId = document.getElementById("review-booking-id").value;
        var rating = Number(document.getElementById("review-rating").value);
        var content = document.getElementById("review-content").value.trim();

        if (!bookingId || !rating || rating < 1 || rating > 5 || !content) {
            setMessage("Please complete review information.", "error");
            return;
        }

        setMessage("Submitting review...", "notice");

        global.ReviewApi.createReview({
            bookingId: bookingId,
            userId: user.userID,
            rating: rating,
            content: content
        }).then(function () {
            setMessage("Review submitted.", "success");
            document.getElementById("review-form").reset();
            loadReviews();
        }).catch(function (err) {
            var msg = err && err.payload
                ? (err.payload.message || err.payload.error || "Submit review failed")
                : "Submit review failed";
            setMessage(msg, "error");
        });
    }

    function init() {
        if (!global.Guard.requireLogin()) return;

        global.AppShell.renderTopbar("Room Reviews");

        Promise.all([
            loadBookingOptions(),
            loadReviews()
        ]).catch(function () {
            setMessage("Cannot initialize reviews page.", "error");
        });

        document.getElementById("review-form").addEventListener("submit", submitReview);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

