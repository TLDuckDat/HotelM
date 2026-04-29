(function (global) {
    "use strict";

    var allRooms = [];
    var selectedRoomFromUrl = "";

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

    function getRoomId(room) {
        return String(room.roomId || room.roomID || room.id || "");
    }

    function getRoomBranchId(room) {
        return String(room.branchId || room.branchID || (room.branch && room.branch.branchId) || "");
    }

    function getRoomDisplayName(room) {
        var name = room.roomName || room.name || "Unnamed room";
        var branchName = room.branchName || (room.branch && room.branch.branchName) || "";
        return branchName ? (name + " - " + branchName) : name;
    }

    function setBranchOptionsFromRooms(rooms) {
        var branchSelect = document.getElementById("branchId");
        if (!branchSelect) return;

        var branchMap = new Map();
        (rooms || []).forEach(function (room) {
            var id = getRoomBranchId(room);
            if (!id) return;
            var name = room.branchName || (room.branch && room.branch.branchName) || ("Branch " + id);
            if (!branchMap.has(id)) {
                branchMap.set(id, name);
            }
        });

        var oldValue = branchSelect.value;
        var optionsHtml = "<option value=''>-- All Branches --</option>";
        branchMap.forEach(function (name, id) {
            optionsHtml += "<option value='" + id + "'>" + name + "</option>";
        });
        branchSelect.innerHTML = optionsHtml;

        if (oldValue && branchMap.has(oldValue)) {
            branchSelect.value = oldValue;
        }
    }

    function loadBranchesFallback() {
        if (!global.BranchApi || typeof global.BranchApi.getBranches !== "function") {
            return Promise.resolve();
        }
        var branchSelect = document.getElementById("branchId");
        if (!branchSelect) return Promise.resolve();
        if (branchSelect.options.length > 1) return Promise.resolve();

        return global.BranchApi.getBranches().then(function (res) {
            var list = Array.isArray(res) ? res : (res.payload || res.data || []);
            var html = "<option value=''>-- All Branches --</option>";
            list.forEach(function (b) {
                var id = String(b.branchId || b.branchID || b.id || "");
                var name = b.branchName || b.name || ("Branch " + id);
                if (id) html += "<option value='" + id + "'>" + name + "</option>";
            });
            branchSelect.innerHTML = html;
        }).catch(function () {
            return Promise.resolve();
        });
    }

    // Fetch all rooms, then optionally fetch booked room IDs and disable them
    function loadRoomOptions(checkIn, checkOut) {
        var select = document.getElementById("roomId");
        if (!select) return Promise.resolve();

        return global.RoomApi.getRooms().then(function (data) {
            const rooms = Array.isArray(data) ? data : (data.payload || data.data || []);
            allRooms = rooms;
            setBranchOptionsFromRooms(rooms);
            return loadBranchesFallback().then(function () { return rooms; });
        }).then(function (rooms) {

            var branchId = document.getElementById("branchId").value;
            var filteredRooms = !branchId
                ? rooms
                : rooms.filter(function (room) { return getRoomBranchId(room) === String(branchId); });

            if (!filteredRooms.length) {
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
                html += filteredRooms.map(function (room) {
                    const id = getRoomId(room);
                    const name = getRoomDisplayName(room);
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
                if (selectedRoomFromUrl) {
                    var hasInitial = filteredRooms.some(function (room) { return getRoomId(room) === selectedRoomFromUrl; });
                    if (hasInitial && !bookedIds.has(selectedRoomFromUrl)) {
                        select.value = selectedRoomFromUrl;
                    }
                }
            });
        });
    }

    function renderRoomsFromExisting(checkIn, checkOut) {
        var select = document.getElementById("roomId");
        if (!select) return Promise.resolve();
        if (!allRooms || !allRooms.length) return loadRoomOptions(checkIn, checkOut);

        var branchId = document.getElementById("branchId").value;
        var filteredRooms = !branchId
            ? allRooms
            : allRooms.filter(function (room) { return getRoomBranchId(room) === String(branchId); });

        if (!filteredRooms.length) {
            select.innerHTML = "<option value=''>No rooms available in this branch</option>";
            return Promise.resolve();
        }

        var bookedPromise = (checkIn && checkOut)
            ? global.BookingApi.getBookedRooms(checkIn, checkOut)
                .then(function (res) {
                    var arr = Array.isArray(res) ? res : (res.payload || res.data || []);
                    return new Set(arr.map(function (r) { return String(r.roomId || r.roomID || r.id || r); }));
                })
                .catch(function () { return new Set(); })
            : Promise.resolve(new Set());

        return bookedPromise.then(function (bookedIds) {
            var html = '<option value="">-- Select a Room --</option>';
            html += filteredRooms.map(function (room) {
                var id = getRoomId(room);
                var name = getRoomDisplayName(room);
                var isBooked = bookedIds.has(id);
                var isUnavailable = isBooked || room.status === "MAINTENANCE";
                if (isUnavailable) {
                    var reason = room.status === "MAINTENANCE" ? "Maintenance" : "Unavailable";
                    return "<option value='" + id + "' disabled style='color:#aaa;'>" + name + " (" + reason + ")</option>";
                }
                return "<option value='" + id + "'>" + name + "</option>";
            }).join("");
            select.innerHTML = html;
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
            renderRoomsFromExisting(checkIn, checkOut).catch(function() {
                setMessage("Cannot check room availability.", "error");
            });
        }
    }

    function toLocalDateTimeInputValue(date) {
        var d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return d.toISOString().slice(0, 16);
    }

    function addHours(value, hours) {
        var d = new Date(value);
        d.setHours(d.getHours() + hours);
        return toLocalDateTimeInputValue(d);
    }

    function setupDateDefaults() {
        var checkInEl = document.getElementById("checkIn");
        var checkOutEl = document.getElementById("checkOut");
        if (!checkInEl || !checkOutEl) return;

        var now = new Date();
        now.setMinutes(0, 0, 0);
        now.setHours(now.getHours() + 1);

        var defaultCheckIn = toLocalDateTimeInputValue(now);
        var defaultCheckOut = addHours(defaultCheckIn, 24);

        if (!checkInEl.value) checkInEl.value = defaultCheckIn;
        if (!checkOutEl.value) checkOutEl.value = defaultCheckOut;

        checkInEl.min = defaultCheckIn;
        checkOutEl.min = addHours(checkInEl.value, 1);
        checkInEl.step = 1800;
        checkOutEl.step = 1800;

        checkInEl.addEventListener("change", function () {
            checkOutEl.min = addHours(checkInEl.value, 1);
            if (!checkOutEl.value || new Date(checkOutEl.value) <= new Date(checkInEl.value)) {
                checkOutEl.value = addHours(checkInEl.value, 24);
            }
        });
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

        var params = new URLSearchParams(window.location.search);
        selectedRoomFromUrl = params.get("roomId") || "";

        setupDateDefaults();

        // Load rooms initially (no date filter yet)
        loadRoomOptions(document.getElementById("checkIn").value, document.getElementById("checkOut").value).catch(function (err) {
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

        var branchEl = document.getElementById("branchId");
        if (branchEl) {
            branchEl.addEventListener("change", function () {
                onDateChange();
            });
        }

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

