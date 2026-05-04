(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading reviewApi.js");
    }

    var REVIEW_ENDPOINT = "/reviews";

    function getReviews(options) {
        return baseApi.get(REVIEW_ENDPOINT, options);
    }

    function createReview(payload, options) {
        return baseApi.post(REVIEW_ENDPOINT, payload, options);
    }

    function deleteReview(id, options) {
        return baseApi.del(REVIEW_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function getReviewsByRoom(roomId, options) {
        return baseApi.get(REVIEW_ENDPOINT + "/room/" + encodeURIComponent(roomId), options);
    }

    function updateReviewStatus(id, status, options) {
        return baseApi.patch(REVIEW_ENDPOINT + "/" + encodeURIComponent(id) + "/status?status=" + encodeURIComponent(status), {}, options);
    }

    global.ReviewApi = {
        getReviews: getReviews,
        getReviewsByRoom: getReviewsByRoom,
        createReview: createReview,
        deleteReview: deleteReview,
        updateReviewStatus: updateReviewStatus
    };
})(window);

