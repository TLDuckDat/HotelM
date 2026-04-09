(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading refundApi.js");
    }

    var REFUND_ENDPOINT = "/refunds";

    function getRefunds(options) {
        return baseApi.get(REFUND_ENDPOINT, options);
    }

    function createRefund(payload, options) {
        return baseApi.post(REFUND_ENDPOINT, payload, options);
    }

    function updateRefundStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });
        return baseApi.patch(REFUND_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    global.RefundApi = {
        getRefunds: getRefunds,
        createRefund: createRefund,
        updateRefundStatus: updateRefundStatus
    };
})(window);

