(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("create-booking-message");
        if (!el) return;
        el.className = "message-box " + (type || "info");
        el.textContent = text;
        el.style.display = "block";
    }

    function getUserId(user) {
        return user ? (user.userId || user.userID || user.id || null) : null;
    }

    function loadUser() {
        if (!global.Guard.requireLogin()) return null;

        var user = global.AuthStore.getCurrentUser();

        if (user && (user.accessToken || user.token) && global.HotelMApiBase) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token);
        }

        if (!user || !getUserId(user)) {
            window.location.href = "index.html";
            return null;
        }

        const topbar = document.getElementById("topbar-username");
        const sidebarName = document.getElementById("sidebar-username");
        const sidebarRole = document.getElementById("sidebar-role");
        if (topbar) topbar.textContent = user.fullName || "Guest";
        if (sidebarName) sidebarName.textContent = user.fullName || "Guest";
        if (sidebarRole) sidebarRole.textContent = user.role || "USER";

        return user;
    }

    // Fetch all rooms, then optionally fetch booked room IDs and disable them
    function loadRoomOptions(checkIn, checkOut) {
        var select = document.getElementById("roomId");
        if (!select) return Promise.resolve();

        return global.RoomApi.getRooms().then(function (data) {
            const rooms = Array.isArray(data) ? data : (data.payload || data.data || []);

            if (!rooms.length) {
                select.innerHTML = "<option value=''>No rooms available</option>";
                return;
            }

            // If dates are provided, fetch booked rooms for that period
            var bookedPromise = (checkIn && checkOut)
                ? global.BookingApi.getBookedRooms(checkIn, checkOut)
                    .then(function(res) {
                        const arr = Array.isArray(res) ? res : (res.payload || res.data || []);
                        // Build a Set of booked room IDs for fast lookup
                        return new Set(arr.map(function(r) {
                            return String(r.roomId || r.roomID || r.id || r);
                        }));
                    })
                    .catch(function() { return new Set(); }) // fail gracefully
                : Promise.resolve(new Set());

            return bookedPromise.then(function(bookedIds) {
                var html = '<option value="">-- Select a Room --</option>';
                html += rooms.map(function (room) {
                    const id = String(room.roomId || room.roomID || room.id || "");
                    const name = room.roomName || room.name || "Unnamed room";
                    const isBooked = bookedIds.has(id);
                    const isUnavailable = isBooked || room.status === 'MAINTENANCE';

                    if (isUnavailable) {
                        const reason = room.status === 'MAINTENANCE' ? 'Maintenance' : 'Unavailable';
                        return `<option value="${id}" disabled style="color:#aaa;">${name} (${reason})</option>`;
                    }
                    return `<option value="${id}">${name}</option>`;
                }).join("");

                const previousValue = select.value;
                select.innerHTML = html;

                // Re-select previous value if still valid
                if (previousValue && !bookedIds.has(previousValue)) {
                    select.value = previousValue;
                }

                // Pre-select from URL param
                var params = new URLSearchParams(window.location.search);
                var initialId = params.get("roomId");
                if (initialId) select.value = initialId;
            });
        });
    }

    function validateDates(checkIn, checkOut) {
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        if (isNaN(ci.getTime()) || isNaN(co.getTime())) {
            return "Please select valid check-in and check-out dates.";
        }
        if (ci >= co) {
            return "Check-out must be after check-in.";
        }
        return null;
    }

    function submitBooking(event) {
        event.preventDefault();

        var user = global.AuthStore.getCurrentUser();
        var userId = getUserId(user);

        if (!userId) {
            setMessage("You must be logged in to create a booking.", "error");
            return;
        }

        var roomId = document.getElementById("roomId").value;
        var checkIn = document.getElementById("checkIn").value;
        var checkOut = document.getElementById("checkOut").value;
        var note = document.getElementById("note").value.trim();

        if (!roomId) {
            setMessage("Please select a room.", "error");
            return;
        }

        var dateError = validateDates(checkIn, checkOut);
        if (dateError) {
            setMessage(dateError, "error");
            return;
        }

        var payload = {
            userId: userId,
            roomId: roomId,
            checkIn: checkIn,
            checkOut: checkOut,
            note: note
        };

        // Disable submit button to prevent double-submit
        var submitBtn = event.target.querySelector("[type=submit]");
        if (submitBtn) submitBtn.disabled = true;

        setMessage("Creating booking…", "info");

        global.BookingApi.createBooking(payload)
            .then(function (res) {
                // Backend returns 202 { requestId, message } — queue async
                // Need to poll /bookings/queue/{requestId} to get the real bookingId
                var requestId = res && (res.requestId || res.request_id);

                if (!requestId) {
                    // Fallback: if somehow a direct bookingId came back (non-queue mode)
                    var direct = res && (res.payload || res.data || res) || {};
                    var directId = direct.bookingId || direct.bookingID || direct.id;
                    if (directId) {
                        setMessage("Booking created! Redirecting to payment…", "success");
                        setTimeout(function () {
                            window.location.href = "payments.html?bookingId=" + encodeURIComponent(directId);
                        }, 800);
                        return;
                    }
                    // No ID at all — go to bookings list
                    setMessage("Booking submitted. Redirecting…", "success");
                    setTimeout(function () { window.location.href = "bookings.html"; }, 800);
                    return;
                }

                setMessage("Booking queued — waiting for confirmation (this may take a few seconds)…", "info");

                // Poll the queue until SUCCESS / FAILED
                global.BookingApi.pollQueueResult(requestId, { maxAttempts: 20, intervalMs: 1500 })
                    .then(function (result) {
                        if (result.status === "SUCCESS") {
                            // result.data holds the BookingResponse
                            var booking = result.data || result.payload || result;
                            var bookingId = booking.bookingId || booking.bookingID || booking.id || "";

                            setMessage("Booking confirmed! Redirecting to payment…", "success");
                            setTimeout(function () {
                                if (bookingId) {
                                    window.location.href = "payments.html?bookingId=" + encodeURIComponent(bookingId);
                                } else {
                                    window.location.href = "bookings.html";
                                }
                            }, 800);
                        } else {
                            // FAILED or NOT_FOUND
                            var reason = (result.data && (result.data.message || result.data.error))
                                || "Booking could not be confirmed. Please try again.";
                            setMessage(reason, "error");
                            if (submitBtn) submitBtn.disabled = false;
                        }
                    })
                    .catch(function (pollErr) {
                        setMessage(
                            "Booking was submitted but we could not confirm it in time. " +
                            "Please check My Bookings to verify.",
                            "error"
                        );
                        if (submitBtn) submitBtn.disabled = false;
                    });
            })
            .catch(function (err) {
                var errMsg = (err && err.payload && (err.payload.message || err.payload.error))
                    || "Cannot create booking.";
                setMessage(errMsg, "error");
                if (submitBtn) submitBtn.disabled = false;
            });
    }

    // When dates change, reload room options with availability check
    function onDateChange() {
        var checkIn = document.getElementById("checkIn").value;
        var checkOut = document.getElementById("checkOut").value;
        if (checkIn && checkOut && new Date(checkIn) < new Date(checkOut)) {
            loadRoomOptions(checkIn, checkOut).catch(function() {
                setMessage("Cannot check room availability.", "error");
            });
        }
    }

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    document.addEventListener("DOMContentLoaded", function () {
        var user = loadUser();
        if (!user) return;

        // Load rooms initially (no date filter yet)
        loadRoomOptions().catch(function (err) {
            var msg = "Cannot load room list.";
            if (err && err.payload && err.payload.message) {
                msg = err.payload.message;
            }
            setMessage(msg, "error");
        });

        // Re-check availability whenever dates change
        var checkInEl = document.getElementById("checkIn");
        var checkOutEl = document.getElementById("checkOut");
        if (checkInEl) checkInEl.addEventListener("change", onDateChange);
        if (checkOutEl) checkOutEl.addEventListener("change", onDateChange);

        var form = document.getElementById("create-booking-form");
        if (form) form.addEventListener("submit", submitBooking);
    });

    global.CreateBookingPage = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);

// (function (global) {
//     "use strict";

//     function setMessage(text, type) {
//         var el = document.getElementById("create-booking-message");
//         if (!el) return;
//         el.className = "message-box " + (type || "info");
//         el.textContent = text;
//     }

//     function getRoomId(room) {
//         return room.roomID || room.id || "";
//     }

//     function getRoomName(room) {
//         return room.roomName || room.name || "Unnamed room";
//     }

//     function loadUser() {
//         if (!global.Guard.requireLogin()) return null;

//         var user = global.AuthStore.getCurrentUser();
//         if (!user) {
//             window.location.href = "login.html";
//             return null;
//         }

//         document.getElementById("topbar-username").textContent = user.fullName || "Guest";
//         document.getElementById("sidebar-username").textContent = user.fullName || "Guest";
//         document.getElementById("sidebar-role").textContent = user.role || "USER";
//         return user;
//     }

//     function readInitialRoomId() {
//         var params = new URLSearchParams(window.location.search);
//         return params.get("roomId") || "";
//     }

//     function loadRoomOptions() {
//         var select = document.getElementById("roomId");
//         if (!select) return Promise.resolve();

//         return global.RoomApi.getRooms().then(function (rooms) {
//             var data = rooms || [];
//             if (!data.length) {
//                 select.innerHTML = "<option value=''>No room available</option>";
//                 return;
//             }

//             select.innerHTML = data.map(function (room) {
//                 var id = getRoomId(room);
//                 var roomName = getRoomName(room);
//                 var status = room.status || "UNKNOWN";
//                 return "<option value='" + id + "'>" + roomName + " (" + status + ")</option>";
//             }).join("");

//             var initialRoomId = readInitialRoomId();
//             if (initialRoomId) {
//                 var hasRoom = data.some(function (room) { return getRoomId(room) === initialRoomId; });
//                 if (hasRoom) {
//                     select.value = initialRoomId;
//                 }
//             }
//         });
//     }

//     function validateTime(checkInValue, checkOutValue) {
//         var checkIn = new Date(checkInValue);
//         var checkOut = new Date(checkOutValue);

//         if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
//             return "Check-in and check-out are required.";
//         }

//         if (checkIn >= checkOut) {
//             return "Check-out must be after check-in.";
//         }

//         return "";
//     }

//     function submitBooking(event) {
//         event.preventDefault();

//         var user = global.AuthStore.getCurrentUser();
//         if (!user || !user.userID) {
//             setMessage("You must login before creating booking.", "error");
//             return;
//         }

//         var roomId = document.getElementById("roomId").value;
//         var checkIn = document.getElementById("checkIn").value;
//         var checkOut = document.getElementById("checkOut").value;
//         var note = document.getElementById("note").value.trim();

//         var timeError = validateTime(checkIn, checkOut);
//         if (timeError) {
//             setMessage(timeError, "error");
//             return;
//         }

//         var payload = {
//             userId: user.userID,
//             roomId: roomId,
//             checkIn: checkIn,
//             checkOut: checkOut,
//             note: note
//         };

//         setMessage("Creating booking...", "info");

//         global.BookingApi.createBooking(payload)
//             .then(function () {
//                 setMessage("Booking created successfully.", "success");
//                 setTimeout(function () {
//                     window.location.href = "booking.html";
//                 }, 700);
//             })
//             .catch(function (err) {
//                 var msg = err && err.payload
//                     ? (err.payload.message || err.payload.error || "Cannot create booking")
//                     : "Cannot create booking";
//                 setMessage(msg, "error");
//             });
//     }

//     function handleLogout() {
//         if (global.AuthStore) global.AuthStore.clearCurrentUser();
//         window.location.href = "login.html";
//     }

//     window.toggleSidebar = function () {
//         document.getElementById("sidebar").classList.toggle("open");
//         document.getElementById("sidebar-overlay").classList.toggle("active");
//     };

//     window.closeSidebar = function () {
//         document.getElementById("sidebar").classList.remove("open");
//         document.getElementById("sidebar-overlay").classList.remove("active");
//     };

//     document.addEventListener("DOMContentLoaded", function () {
//         if (!loadUser()) return;

//         loadRoomOptions().catch(function () {
//             setMessage("Cannot load room list.", "error");
//         });

//         var form = document.getElementById("create-booking-form");
//         if (form) {
//             form.addEventListener("submit", submitBooking);
//         }
//     });

//     global.CreateBookingPage = {
//         handleLogout: handleLogout
//     };
// })(window);

