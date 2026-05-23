(function (global) {
    "use strict";

    var allRooms = [];
    var selectedRoomFromUrl = "";
    var roomBookings = [];

    var SLOT_MINUTES = 30;
    var DAY_START_MIN = 6 * 60;
    var DAY_END_MIN = 24 * 60;
    var ACTIVE_STATUSES = { PENDING: true, CONFIRMED: true, CHECKED_IN: true };

    var scheduleState = {
        viewYear: 0,
        viewMonth: 0,
        checkInDate: null,
        checkOutDate: null,
        checkInMin: null,
        checkOutMin: null,
        selecting: "checkin"
    };

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
                var preferred = select.value || selectedRoomFromUrl;
                var html = buildRoomOptionsHtml(filteredRooms, bookedIds);
                applyRoomSelectHtml(html, preferred);

                if (selectedRoomFromUrl) {
                    var hasInitial = filteredRooms.some(function (room) { return getRoomId(room) === selectedRoomFromUrl; });
                    if (hasInitial && !bookedIds.has(selectedRoomFromUrl) && select.value === selectedRoomFromUrl) {
                        onRoomSelectionChange();
                        selectedRoomFromUrl = "";
                    }
                }
            });
        });
    }

    function buildRoomOptionsHtml(filteredRooms, bookedIds) {
        var html = '<option value="">-- Select a Room --</option>';
        html += filteredRooms.map(function (room) {
            var id = getRoomId(room);
            var name = getRoomDisplayName(room);
            var isBooked = bookedIds.has(id);
            var isUnavailable = isBooked || room.status === "MAINTENANCE";
            if (isUnavailable) {
                var reason = room.status === "MAINTENANCE" ? "Maintenance" : "Unavailable";
                return "<option value=\"" + id + "\" disabled style=\"color:#aaa;\">" + name + " (" + reason + ")</option>";
            }
            return "<option value=\"" + id + "\">" + name + "</option>";
        }).join("");
        return html;
    }

    function applyRoomSelectHtml(html, preferredRoomId) {
        var select = document.getElementById("roomId");
        if (!select) return false;

        var previousValue = preferredRoomId || select.value;
        select.innerHTML = html;

        if (previousValue) {
            var opt = select.querySelector("option[value=\"" + previousValue + "\"]:not([disabled])");
            if (opt) {
                select.value = previousValue;
                return true;
            }
        }
        return false;
    }

    function renderRoomsFromExisting(checkIn, checkOut) {
        var select = document.getElementById("roomId");
        if (!select) return Promise.resolve();
        if (!allRooms || !allRooms.length) return loadRoomOptions(checkIn, checkOut);

        var branchId = document.getElementById("branchId").value;
        var preferredRoomId = select.value;
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
            var html = buildRoomOptionsHtml(filteredRooms, bookedIds);
            var kept = applyRoomSelectHtml(html, preferredRoomId);

            if (preferredRoomId && !kept) {
                setMessage(
                    t("booking_room_unavailable", "Selected room is not available for these dates. Please choose another room."),
                    "error"
                );
                select.value = "";
                onRoomSelectionChange();
            }
        });
    }

    function validateDates(checkIn, checkOut) {
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        if (isNaN(ci.getTime()) || isNaN(co.getTime())) {
            return t("booking_err_invalid_dates", "Please select valid check-in and check-out dates.");
        }
        if (ci >= co) {
            return t("booking_err_checkout_after_checkin", "Check-out must be after check-in.");
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

        if (!checkIn || !checkOut) {
            setMessage(t("booking_select_datetime", "Please select check-in and check-out date and time"), "error");
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

    function t(key, fallback) {
        if (global.t) return global.t(key) || fallback;
        return fallback;
    }

    function startOfDay(d) {
        var x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    function sameDay(a, b) {
        return a && b && startOfDay(a).getTime() === startOfDay(b).getTime();
    }

    function parseApiDate(value) {
        if (!value) return null;
        var d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    function formatDateDisplay(d) {
        if (!d) return "—";
        var lang = global.getLang ? global.getLang() : "en";
        return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatTimeDisplay(minutes) {
        if (minutes == null) return "—";
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    }

    function toLocalDateTimeInputValue(date) {
        var d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return d.toISOString().slice(0, 16);
    }

    function combineDateAndMinutes(date, minutes) {
        var d = new Date(date);
        d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        return d;
    }

    function isActiveBooking(booking) {
        var status = (booking.status || "").toUpperCase();
        return ACTIVE_STATUSES[status] === true;
    }

    function getRoomBookingsForPicker() {
        var roomId = document.getElementById("roomId").value;
        if (!roomId) return [];
        return (roomBookings || []).filter(function (b) {
            var rid = String(b.roomId || b.roomID || (b.room && b.room.roomID) || "");
            return rid === String(roomId) && isActiveBooking(b);
        });
    }

    function slotRangeOnDate(date, startMin, endMin) {
        var start = combineDateAndMinutes(date, startMin);
        var end = combineDateAndMinutes(date, endMin);
        return { start: start, end: end };
    }

    function isRangeBooked(start, end, bookings) {
        return bookings.some(function (b) {
            var ci = parseApiDate(b.checkIn);
            var co = parseApiDate(b.checkOut);
            if (!ci || !co) return false;
            return ci < end && co > start;
        });
    }

    function isSlotBooked(date, startMin, bookings) {
        var endMin = startMin + SLOT_MINUTES;
        if (endMin > DAY_END_MIN) return true;
        var range = slotRangeOnDate(date, startMin, endMin);
        return isRangeBooked(range.start, range.end, bookings);
    }

    function isDateFullyBooked(date, bookings) {
        for (var m = DAY_START_MIN; m < DAY_END_MIN; m += SLOT_MINUTES) {
            if (!isSlotBooked(date, m, bookings)) return false;
        }
        return true;
    }

    function getDefaultCheckInMinForDate(date) {
        var now = new Date();
        if (!sameDay(date, now)) return DAY_START_MIN;
        var cur = now.getHours() * 60 + now.getMinutes();
        var next = Math.ceil(cur / SLOT_MINUTES) * SLOT_MINUTES;
        return Math.max(DAY_START_MIN, next);
    }

    function findFirstFreeSlot(date, bookings, minMin) {
        for (var m = minMin; m < DAY_END_MIN; m += SLOT_MINUTES) {
            if (!isSlotBooked(date, m, bookings)) return m;
        }
        return null;
    }

    function syncHiddenDateTimes() {
        var checkInEl = document.getElementById("checkIn");
        var checkOutEl = document.getElementById("checkOut");
        if (!checkInEl || !checkOutEl) return;

        if (scheduleState.checkInDate != null && scheduleState.checkInMin != null) {
            checkInEl.value = toLocalDateTimeInputValue(
                combineDateAndMinutes(scheduleState.checkInDate, scheduleState.checkInMin)
            );
        } else {
            checkInEl.value = "";
        }

        if (scheduleState.checkOutDate != null && scheduleState.checkOutMin != null) {
            checkOutEl.value = toLocalDateTimeInputValue(
                combineDateAndMinutes(scheduleState.checkOutDate, scheduleState.checkOutMin)
            );
        } else {
            checkOutEl.value = "";
        }

        updateScheduleSummary();
        onDateChange();
    }

    function getSelectedRoom() {
        var roomId = document.getElementById("roomId").value;
        if (!roomId) return null;
        return allRooms.find(function (r) { return getRoomId(r) === String(roomId); }) || null;
    }

    function getSelectedRoomLabel() {
        var room = getSelectedRoom();
        return room ? getRoomDisplayName(room) : "—";
    }

    function getRoomBasePrice(room) {
        if (!room) return 0;
        var p = room.basePrice != null ? room.basePrice : room.base_price;
        return Number(p) || 0;
    }

    function currentLang() {
        if (global.getLang) return global.getLang();
        return global.localStorage.getItem("sot_lang") || "en";
    }

    function formatMoney(amount) {
        if (typeof global.formatCurrency === "function") {
            return global.formatCurrency(amount);
        }
        var num = Number(amount);
        if (currentLang() === "vi") {
            return num.toLocaleString("vi-VN") + " ₫";
        }
        return "$" + Math.round(num / 25000);
    }

    /** Same as backend: ChronoUnit.DAYS.between(checkInDate, checkOutDate), min 1 billable day */
    function countBillableDays(checkInDate, checkOutDate) {
        if (!checkInDate || !checkOutDate) return 0;
        var a = startOfDay(checkInDate).getTime();
        var b = startOfDay(checkOutDate).getTime();
        var days = Math.round((b - a) / 86400000);
        return Math.max(days, 1);
    }

    function formatDaysLabel(numDays) {
        if (numDays <= 1) return t("booking_day_one", "1 day");
        var tpl = t("booking_days_count", "{n} days");
        return tpl.replace("{n}", String(numDays));
    }

    function calculateBookingPrice() {
        var room = getSelectedRoom();
        if (!room || !scheduleState.checkInDate || !scheduleState.checkOutDate
            || scheduleState.checkInMin == null || scheduleState.checkOutMin == null) {
            return null;
        }

        var checkInDt = combineDateAndMinutes(scheduleState.checkInDate, scheduleState.checkInMin);
        var checkOutDt = combineDateAndMinutes(scheduleState.checkOutDate, scheduleState.checkOutMin);
        if (checkOutDt <= checkInDt) return null;

        var pricePerDay = getRoomBasePrice(room);
        var numDays = countBillableDays(scheduleState.checkInDate, scheduleState.checkOutDate);
        var total = pricePerDay * numDays;

        return {
            pricePerDay: pricePerDay,
            numDays: numDays,
            total: total
        };
    }

    function updatePriceDisplay() {
        var pricing = calculateBookingPrice();
        var show = !!pricing;

        var panelTotal = document.getElementById("booking-price-total");
        var panelPerDay = document.getElementById("panel-price-per-day");
        var panelDays = document.getElementById("panel-num-days");
        var panelTotalPrice = document.getElementById("panel-total-price");
        var strip = document.getElementById("schedule-price-strip");
        var stripDetail = document.getElementById("schedule-price-detail");
        var stripTotal = document.getElementById("schedule-price-total");

        if (!pricing) {
            if (panelTotal) panelTotal.hidden = true;
            if (strip) strip.hidden = true;
            if (panelPerDay) panelPerDay.textContent = "—";
            if (panelDays) panelDays.textContent = "—";
            if (panelTotalPrice) panelTotalPrice.textContent = "—";
            return;
        }

        var daysLabel = formatDaysLabel(pricing.numDays);
        var perDayStr = pricing.pricePerDay > 0 ? formatMoney(pricing.pricePerDay) : "—";
        var totalStr = pricing.pricePerDay > 0 ? formatMoney(pricing.total) : "—";
        var formulaTpl = t("booking_price_formula", "{days} × {price}/day");
        var formulaStr = formulaTpl
            .replace("{days}", daysLabel)
            .replace("{price}", perDayStr);

        if (panelPerDay) panelPerDay.textContent = perDayStr;
        if (panelDays) panelDays.textContent = daysLabel;
        if (panelTotalPrice) panelTotalPrice.textContent = totalStr;
        if (panelTotal) panelTotal.hidden = !show || pricing.pricePerDay <= 0;

        if (strip) strip.hidden = !show;
        if (stripDetail) stripDetail.textContent = formulaStr;
        if (stripTotal) stripTotal.textContent = totalStr;
    }

    function updateScheduleSummary() {
        var elInDate = document.getElementById("summary-checkin-date");
        var elOutDate = document.getElementById("summary-checkout-date");
        var elInTime = document.getElementById("summary-checkin-time");
        var elOutTime = document.getElementById("summary-checkout-time");
        if (elInDate) elInDate.textContent = formatDateDisplay(scheduleState.checkInDate);
        if (elOutDate) elOutDate.textContent = formatDateDisplay(scheduleState.checkOutDate);
        if (elInTime) elInTime.textContent = formatTimeDisplay(scheduleState.checkInMin);
        if (elOutTime) elOutTime.textContent = formatTimeDisplay(scheduleState.checkOutMin);

        var panel = document.getElementById("booking-selection-panel");
        var roomId = document.getElementById("roomId").value;
        var hasSelection = roomId && scheduleState.checkInDate && scheduleState.checkOutDate
            && scheduleState.checkInMin != null && scheduleState.checkOutMin != null;

        if (panel) panel.hidden = !hasSelection;

        var panelRoom = document.getElementById("panel-room-name");
        var panelInDate = document.getElementById("panel-checkin-date");
        var panelOutDate = document.getElementById("panel-checkout-date");
        var panelInTime = document.getElementById("panel-checkin-time");
        var panelOutTime = document.getElementById("panel-checkout-time");

        if (panelRoom) panelRoom.textContent = getSelectedRoomLabel();
        if (panelInDate) panelInDate.textContent = formatDateDisplay(scheduleState.checkInDate);
        if (panelOutDate) panelOutDate.textContent = formatDateDisplay(scheduleState.checkOutDate);
        if (panelInTime) panelInTime.textContent = formatTimeDisplay(scheduleState.checkInMin);
        if (panelOutTime) panelOutTime.textContent = formatTimeDisplay(scheduleState.checkOutMin);

        updatePriceDisplay();
    }

    function setScheduleEnabled(enabled) {
        var picker = document.getElementById("schedule-picker");
        if (picker) picker.classList.toggle("is-disabled", !enabled);
    }

    function loadRoomBookings() {
        return global.BookingApi.getBookings()
            .then(function (data) {
                var list = Array.isArray(data) ? data : (data.payload || data.data || []);
                roomBookings = list;
            })
            .catch(function () {
                roomBookings = [];
            });
    }

    function renderMonthLabel() {
        var el = document.getElementById("date-month-label");
        if (!el) return;
        var lang = global.getLang ? global.getLang() : "en";
        var d = new Date(scheduleState.viewYear, scheduleState.viewMonth, 1);
        el.textContent = d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
            month: "long",
            year: "numeric"
        });
    }

    function renderDatePicker() {
        var host = document.getElementById("date-picker");
        if (!host) return;

        var bookings = getRoomBookingsForPicker();
        var today = startOfDay(new Date());
        var lang = global.getLang ? global.getLang() : "en";
        var weekdays = lang === "vi"
            ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        var html = weekdays.map(function (w) {
            return "<span class='date-picker-weekday'>" + w + "</span>";
        }).join("");

        var first = new Date(scheduleState.viewYear, scheduleState.viewMonth, 1);
        var startPad = (first.getDay() + 6) % 7;
        var daysInMonth = new Date(scheduleState.viewYear, scheduleState.viewMonth + 1, 0).getDate();

        for (var i = 0; i < startPad; i++) {
            html += "<span class='date-picker-spacer' aria-hidden='true'></span>";
        }

        for (var day = 1; day <= daysInMonth; day++) {
            var cellDate = new Date(scheduleState.viewYear, scheduleState.viewMonth, day);
            var isPast = cellDate < today;
            var fullyBooked = !isPast && isDateFullyBooked(cellDate, bookings);
            var disabled = isPast || fullyBooked;
            var classes = ["date-cell"];
            if (isPast) classes.push("is-past");
            if (fullyBooked) classes.push("is-booked");
            if (sameDay(cellDate, new Date())) classes.push("is-today");
            if (scheduleState.checkInDate && sameDay(cellDate, scheduleState.checkInDate)) {
                classes.push("is-selected");
            }
            if (scheduleState.checkOutDate && sameDay(cellDate, scheduleState.checkOutDate)) {
                classes.push("is-selected");
            }
            if (scheduleState.checkInDate && scheduleState.checkOutDate) {
                var t0 = startOfDay(scheduleState.checkInDate).getTime();
                var t1 = startOfDay(scheduleState.checkOutDate).getTime();
                var tc = cellDate.getTime();
                if (tc > t0 && tc < t1) classes.push("is-in-range");
            }

            html += "<button type='button' class='" + classes.join(" ") + "' data-day='" + day + "'"
                + (disabled ? " disabled aria-disabled='true'" : "")
                + ">" + day + "</button>";
        }

        host.innerHTML = html;

        host.querySelectorAll(".date-cell:not(:disabled)").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var day = parseInt(btn.getAttribute("data-day"), 10);
                onDateCellClick(new Date(scheduleState.viewYear, scheduleState.viewMonth, day));
            });
        });
    }

    function onDateCellClick(date) {
        var bookings = getRoomBookingsForPicker();
        var clicked = startOfDay(date);
    
        // Nếu chưa có ngày nào, hoặc đã có đủ 2 ngày → bắt đầu lại từ ngày vừa bấm
        if (!scheduleState.checkInDate || (scheduleState.checkInDate && scheduleState.checkOutDate)) {
            scheduleState.checkInDate = clicked;
            scheduleState.checkOutDate = null;
            scheduleState.checkInMin = findFirstFreeSlot(
                clicked, bookings, getDefaultCheckInMinForDate(clicked)
            );
            scheduleState.checkOutMin = null;
            scheduleState.selecting = "checkout";
    
        } else {
            // Đã có 1 ngày → xác định min/max, không cần quan tâm thứ tự bấm
            var other = scheduleState.checkInDate;
    
            if (sameDay(clicked, other)) {
                // Bấm lại cùng ngày → reset
                scheduleState.checkInDate = null;
                scheduleState.checkOutDate = null;
                scheduleState.checkInMin = null;
                scheduleState.checkOutMin = null;
                scheduleState.selecting = "checkin";
            } else {
                var earlier = clicked < other ? clicked : other;
                var later   = clicked < other ? other  : clicked;
    
                scheduleState.checkInDate  = earlier;
                scheduleState.checkOutDate = later;
    
                scheduleState.checkInMin = findFirstFreeSlot(
                    earlier, bookings, getDefaultCheckInMinForDate(earlier)
                );
                var outMinStart = sameDay(earlier, later)
                    ? (scheduleState.checkInMin || DAY_START_MIN) + SLOT_MINUTES
                    : DAY_START_MIN;
                scheduleState.checkOutMin = findFirstFreeSlot(later, bookings, outMinStart);
                scheduleState.selecting = "checkin";
            }
        }
    
        renderDatePicker();
        renderTimePickers();
        syncHiddenDateTimes();
    }

    function renderTimePicker(hostId, mode) {
        var host = document.getElementById(hostId);
        if (!host) return;

        var bookings = getRoomBookingsForPicker();
        var date = mode === "checkin" ? scheduleState.checkInDate : scheduleState.checkOutDate;

        if (!date) {
            var hintKey = "booking_select_checkin_date";
            if (mode === "checkout" && scheduleState.checkInDate) {
                hintKey = "booking_select_checkout_date";
            }
            host.innerHTML = "<p class='time-picker-empty'>" + t(hintKey, "Select date first") + "</p>";
            return;
        }

        var minMin = DAY_START_MIN;
        if (mode === "checkin") {
            minMin = getDefaultCheckInMinForDate(date);
        } else if (sameDay(date, scheduleState.checkInDate) && scheduleState.checkInMin != null) {
            minMin = scheduleState.checkInMin + SLOT_MINUTES;
        }

        var html = "";
        var hasAvailable = false;
        for (var m = DAY_START_MIN; m < DAY_END_MIN; m += SLOT_MINUTES) {
            var booked = isSlotBooked(date, m, bookings);
            var tooEarly = m < minMin;
            var disabled = booked || tooEarly;
            if (!disabled) hasAvailable = true;

            var selected = mode === "checkin"
                ? scheduleState.checkInMin === m
                : scheduleState.checkOutMin === m;

            var cls = ["time-slot"];
            if (booked || tooEarly) cls.push("is-booked");
            if (selected) cls.push("is-selected");

            html += "<button type='button' class='" + cls.join(" ") + "' data-minutes='" + m + "'"
                + (disabled ? " disabled aria-disabled='true'" : "")
                + ">" + formatTimeDisplay(m) + "</button>";
        }

        if (!hasAvailable) {
            host.innerHTML = "<p class='time-picker-empty'>" + t("booking_time_unavailable", "No available time slots") + "</p>";
            return;
        }

        host.innerHTML = html;
        host.querySelectorAll(".time-slot:not(:disabled)").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var minutes = parseInt(btn.getAttribute("data-minutes"), 10);
                if (mode === "checkin") {
                    scheduleState.checkInMin = minutes;
                    if (scheduleState.checkOutDate && sameDay(scheduleState.checkInDate, scheduleState.checkOutDate)) {
                        if (scheduleState.checkOutMin == null || scheduleState.checkOutMin <= minutes) {
                            scheduleState.checkOutMin = findFirstFreeSlot(
                                scheduleState.checkOutDate,
                                bookings,
                                minutes + SLOT_MINUTES
                            );
                        }
                    }
                } else {
                    scheduleState.checkOutMin = minutes;
                }
                renderTimePickers();
                syncHiddenDateTimes();
            });
        });
    }

    function renderTimePickers() {
        renderTimePicker("checkin-time-picker", "checkin");
        renderTimePicker("checkout-time-picker", "checkout");
    }

    function resetScheduleSelection() {
        var now = new Date();
        scheduleState.viewYear = now.getFullYear();
        scheduleState.viewMonth = now.getMonth();
        scheduleState.checkInDate = null;
        scheduleState.checkOutDate = null;
        scheduleState.checkInMin = null;
        scheduleState.checkOutMin = null;
        scheduleState.selecting = "checkin";
    }

    function initSchedulePicker() {
        resetScheduleSelection();
        renderMonthLabel();
        renderDatePicker();
        renderTimePickers();
        updateScheduleSummary();

        var prev = document.getElementById("date-prev-month");
        var next = document.getElementById("date-next-month");
        if (prev) {
            prev.addEventListener("click", function () {
                scheduleState.viewMonth -= 1;
                if (scheduleState.viewMonth < 0) {
                    scheduleState.viewMonth = 11;
                    scheduleState.viewYear -= 1;
                }
                renderMonthLabel();
                renderDatePicker();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                scheduleState.viewMonth += 1;
                if (scheduleState.viewMonth > 11) {
                    scheduleState.viewMonth = 0;
                    scheduleState.viewYear += 1;
                }
                renderMonthLabel();
                renderDatePicker();
            });
        }
    }

    function onRoomSelectionChange() {
        var roomId = document.getElementById("roomId").value;
        setScheduleEnabled(!!roomId);
        resetScheduleSelection();
        syncHiddenDateTimes();
        renderMonthLabel();
        renderDatePicker();
        renderTimePickers();

        if (roomId) {
            loadRoomBookings().then(function () {
                renderDatePicker();
                renderTimePickers();
            });
        }
    }

    function onDateChange() {
        var checkIn = document.getElementById("checkIn").value;
        var checkOut = document.getElementById("checkOut").value;
        if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) {
            updateScheduleSummary();
            return;
        }

        var roomId = document.getElementById("roomId").value;
        if (roomId) {
            updateScheduleSummary();
            return;
        }

        renderRoomsFromExisting(checkIn, checkOut).catch(function () {
            setMessage("Cannot check room availability.", "error");
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

        initSchedulePicker();
        setScheduleEnabled(false);

        loadRoomBookings();

        // Load rooms initially (no date filter yet)
        loadRoomOptions("", "").catch(function (err) {
            var msg = "Cannot load room list.";
            if (err && err.payload && err.payload.message) {
                msg = err.payload.message;
            }
            setMessage(msg, "error");
        });

        var branchEl = document.getElementById("branchId");
        if (branchEl) {
            branchEl.addEventListener("change", function () {
                var checkIn = document.getElementById("checkIn").value;
                var checkOut = document.getElementById("checkOut").value;
                renderRoomsFromExisting(checkIn, checkOut).catch(function () {
                    setMessage("Cannot check room availability.", "error");
                });
            });
        }

        var roomEl = document.getElementById("roomId");
        if (roomEl) {
            roomEl.addEventListener("change", onRoomSelectionChange);
        }

        var form = document.getElementById("create-booking-form");
        if (form) form.addEventListener("submit", submitBooking);

        if (selectedRoomFromUrl) {
            setTimeout(onRoomSelectionChange, 400);
        }
    });

    global.handleLogout = function () {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = "index.html";
    };

    global.CreateBookingPage = {
        handleLogout: global.handleLogout
    };

    function refreshBookingPageI18n() {
        if (typeof global.applyTranslations === "function" && global.getLang) {
            global.applyTranslations(global.getLang());
        }
        renderMonthLabel();
        renderDatePicker();
        renderTimePickers();
        updateScheduleSummary();
        updatePriceDisplay();
    }

    document.addEventListener("languageChanged", refreshBookingPageI18n);

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

