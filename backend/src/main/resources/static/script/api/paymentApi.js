(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading paymentApi.js");
    }

    // Maps to the invoice table on the backend
    var PAYMENT_ENDPOINT = "/payments";

    function getPayments(options) {
        return baseApi.get(PAYMENT_ENDPOINT, options);
    }

    function createPayment(payload, options) {
        // Expected payload: { bookingId, userId, method, amount }
        return baseApi.post(PAYMENT_ENDPOINT, payload, options);
    }

    function getPaymentById(id, options) {
        return baseApi.get(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    // Admin: mark payment as COMPLETED or REJECTED
    // PATCH /payments/{id}/status?status=COMPLETED
    function updatePaymentStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });
        return baseApi.patch(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    // Admin: permanently delete a payment record
    // DELETE /payments/{id}
    function deletePayment(id, options) {
        return baseApi.del(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.PaymentApi = {
        getPayments:           getPayments,
        createPayment:         createPayment,
        getPaymentById:        getPaymentById,
        updatePaymentStatus:   updatePaymentStatus,
        deletePayment:         deletePayment
    };
})(window);