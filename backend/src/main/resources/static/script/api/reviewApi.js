(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading reviewApi.js");
    }

    // Maps to the review table: review_id, user_user_id, room_room_id, rating, comment, created_at
    // NOTE: The DB links reviews to a room (not a booking directly).
    //       The backend may accept bookingId and resolve roomId server-side.
    var REVIEW_ENDPOINT = "/reviews";

    function getReviews(options) {
        return baseApi.get(REVIEW_ENDPOINT, options);
    }

    function createReview(payload, options) {
        // Expected payload: { bookingId, userId, rating, content }
        // Backend maps bookingId → roomId internally based on the booking record.
        return baseApi.post(REVIEW_ENDPOINT, payload, options);
    }

    // Admin: permanently delete a review
    // DELETE /reviews/{id}
    function deleteReview(id, options) {
        return baseApi.del(REVIEW_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    // Admin: show or hide a review (status field is backend-managed, not in DB schema)
    // PATCH /reviews/{id}/status?status=PUBLISHED|HIDDEN
    function updateReviewStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });
        return baseApi.patch(REVIEW_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    global.ReviewApi = {
        getReviews:           getReviews,
        createReview:         createReview,
        deleteReview:         deleteReview,
        updateReviewStatus:   updateReviewStatus
    };
})(window);