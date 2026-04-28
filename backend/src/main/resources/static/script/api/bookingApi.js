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

    function getBookingsByUser(userId, options) {
        return baseApi.get(BOOKING_ENDPOINT + "/user/" + encodeURIComponent(userId), options);
    }

    function createBooking(bookingPayload, options) {
        return baseApi.post(BOOKING_ENDPOINT, bookingPayload, options);
    }

    function updateBookingStatus(id, status, options) {
        // var requestOptions = Object.assign({}, options, {
        //     query: Object.assign({}, options && options.query, { status: status })
        // });

        // return baseApi.patch(BOOKING_ENDPOINT + "/" + encodeURIComponent(id) + "/status", null, requestOptions);
        return baseApi.patch(
            BOOKING_ENDPOINT + "/" + encodeURIComponent(id) + "/status",
            { status: status },  // send as JSON body
            options
        );
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

    /**
     * Poll /bookings/queue/{requestId} cho đến khi status = SUCCESS | FAILED | NOT_FOUND
     * hoặc hết số lần thử (maxAttempts).
     * Trả về Promise resolve với BookingQueueResult khi xong.
     */
    function pollQueueResult(requestId, options) {
        var maxAttempts = (options && options.maxAttempts) || 15;
        var intervalMs  = (options && options.intervalMs)  || 1500;

        return new Promise(function (resolve, reject) {
            var attempts = 0;

            function check() {
                attempts++;
                baseApi.get(BOOKING_ENDPOINT + "/queue/" + encodeURIComponent(requestId))
                    .then(function (result) {
                        var status = result && result.status;
                        if (status === "SUCCESS" || status === "FAILED" || status === "NOT_FOUND") {
                            resolve(result);
                        } else if (attempts >= maxAttempts) {
                            reject(new Error("Booking queue timeout after " + attempts + " attempts."));
                        } else {
                            setTimeout(check, intervalMs);
                        }
                    })
                    .catch(function (err) {
                        // 202 Accepted is treated as "still PENDING" by baseApi (non-ok may throw)
                        // Retry on network errors or 202
                        if (attempts < maxAttempts) {
                            setTimeout(check, intervalMs);
                        } else {
                            reject(err);
                        }
                    });
            }

            check();
        });
    }

    global.BookingApi = {
        getBookings: getBookings,
        getBookingById: getBookingById,
        getBookingsByUser: getBookingsByUser,
        createBooking: createBooking,
        updateBookingStatus: updateBookingStatus,
        cancelBooking: cancelBooking,
        deleteBooking: deleteBooking,
        getBookedRooms: getBookedRooms,
        pollQueueResult: pollQueueResult
    };
})(window);

