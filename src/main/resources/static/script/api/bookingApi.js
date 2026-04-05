(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading bookingApi.js");
    }

    var BOOKING_ENDPOINT = "/bookings";

    function getBookings(options) {
        return baseApi.get(BOOKING_ENDPOINT, options);
    }

    function getBookingById(id, options) {
        return baseApi.get(BOOKING_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function createBooking(bookingPayload, options) {
        return baseApi.post(BOOKING_ENDPOINT, bookingPayload, options);
    }

    function updateBookingStatus(id, status, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, { status: status })
        });

        return baseApi.patch(BOOKING_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
    }

    function cancelBooking(id, options) {
        return baseApi.post(BOOKING_ENDPOINT + "/" + encodeURIComponent(id) + "/cancel", null, options);
    }

    function deleteBooking(id, options) {
        return baseApi.del(BOOKING_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function getBookedRooms(startIso, endIso, options) {
        var requestOptions = Object.assign({}, options, {
            query: Object.assign({}, options && options.query, {
                start: startIso,
                end: endIso
            })
        });

        return baseApi.get(BOOKING_ENDPOINT + "/rooms/booked", requestOptions);
    }

    global.BookingApi = {
        getBookings: getBookings,
        getBookingById: getBookingById,
        createBooking: createBooking,
        updateBookingStatus: updateBookingStatus,
        cancelBooking: cancelBooking,
        deleteBooking: deleteBooking,
        getBookedRooms: getBookedRooms
    };
})(window);

