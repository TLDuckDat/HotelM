(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading paymentApi.js");
    }

    var PAYMENT_ENDPOINT = "/payments";

    function getPayments(options) {
        return baseApi.get(PAYMENT_ENDPOINT, options);
    }

    function createPayment(payload, options) {
        return baseApi.post(PAYMENT_ENDPOINT, payload, options);
    }

    function getPaymentById(id, options) {
        return baseApi.get(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.PaymentApi = {
        getPayments: getPayments,
        createPayment: createPayment,
        getPaymentById: getPaymentById
    };
})(window);

