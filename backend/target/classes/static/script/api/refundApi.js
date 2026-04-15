(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading refundApi.js");
    }

    // NOTE: There is no refund table in the current DB schema.
    // These endpoints must be implemented on the backend separately.
    var REFUND_ENDPOINT = "/refunds";

    function getRefunds(options) {
        return baseApi.get(REFUND_ENDPOINT, options);
    }

    function createRefund(payload, options) {
        // Expected payload: { bookingId, userId, reason }
        return baseApi.post(REFUND_ENDPOINT, payload, options);
    }

    // Admin: approve or reject a refund request
    // PATCH /refunds/{id}/status?status=APPROVED|REJECTED
    function updateRefundStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });
        return baseApi.patch(REFUND_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    // Admin: permanently delete a refund request
    // DELETE /refunds/{id}
    function deleteRefund(id, options) {
        return baseApi.del(REFUND_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.RefundApi = {
        getRefunds:           getRefunds,
        createRefund:         createRefund,
        updateRefundStatus:   updateRefundStatus,
        deleteRefund:         deleteRefund
    };
})(window);