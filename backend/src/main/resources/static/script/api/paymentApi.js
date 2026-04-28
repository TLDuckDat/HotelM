(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading paymentApi.js");
    }

    var PAYMENT_ENDPOINT = "/invoices";

    function getPayments(options) {
        return baseApi.get(PAYMENT_ENDPOINT, options);
    }

    function getPaymentsByUser(userId, options) {
        return baseApi.get(PAYMENT_ENDPOINT + "/user/" + encodeURIComponent(userId), options);
    }

    function createPayment(payload, options) {
        return baseApi.post(PAYMENT_ENDPOINT, payload, options);
    }

    function getPaymentById(id, options) {
        return baseApi.get(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function updatePaymentStatus(id, status, options) {
        return baseApi.patch(
            PAYMENT_ENDPOINT + "/" + encodeURIComponent(id) + "/status",
            { status: status },
            options
        );
    }

    function deletePayment(id, options) {
        return baseApi.del(PAYMENT_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.PaymentApi = {
        getPayments:           getPayments,
        getPaymentsByUser:     getPaymentsByUser,
        createPayment:         createPayment,
        getPaymentById:        getPaymentById,
        updatePaymentStatus:   updatePaymentStatus,
        deletePayment:         deletePayment
    };
})(window);