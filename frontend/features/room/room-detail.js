(function (global) {
    "use strict";

    // ── HELPERS ─────────────────────────────────────────────────────────────

    function getRoomId(room) {
        return room.roomID || room.roomId || room.id || "";
    }

    function getRoomName(room) {
        return room.roomName || room.name || "Unnamed Room";
    }

    function getRoomImage(room) {
        return room.imageUrl || room.image || "../../images/home/villa/villa1.jpg";
    }

    function getRoomTypeName(room, types) {
        if (room.roomType && (room.roomType.typeName || room.roomType.name)) {
            return room.roomType.typeName || room.roomType.name;
        }
        var typeId = room.roomTypeId || room.typeID || room.roomTypeID;
        if (!typeId || !types) return "Standard Room";
        var matched = types.find(function (t) {
            return (t.typeID || t.id) === typeId;
        });
        return matched ? (matched.typeName || matched.name || "Standard Room") : "Standard Room";
    }

    function getRoomPrice(room) {
        return room.pricePerNight || room.price || room.pricePerDay || null;
    }

    function getStatusClass(status) {
        if (!status) return "available";
        var s = status.toLowerCase();
        if (s === "available") return "available";
        if (s === "occupied" || s === "booked") return "occupied";
        if (s === "maintenance") return "maintenance";
        return "available";
    }

    function getStatusLabel(status) {
        if (!status) return "Available";
        var map = {
            "available": "Available",
            "occupied": "Occupied",
            "booked": "Booked",
            "maintenance": "Under Maintenance"
        };
        return map[status.toLowerCase()] || status;
    }

    function formatPrice(price) {
        if (!price && price !== 0) return null;
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    }

    // ── DEFAULT AMENITIES based on room type ────────────────────────────────

    function buildAmenities(room, typeName) {
        var base = [
            { icon: "fas fa-wifi", label: "Free Wi-Fi" },
            { icon: "fas fa-snowflake", label: "Air Conditioning" },
            { icon: "fas fa-tv", label: "Smart TV" },
            { icon: "fas fa-shower", label: "Private Bathroom" },
            { icon: "fas fa-mug-hot", label: "Tea & Coffee" },
            { icon: "fas fa-bell-concierge", label: "Room Service" }
        ];

        var type = (typeName || "").toLowerCase();

        if (type.includes("suite") || type.includes("villa") || type.includes("deluxe")) {
            base.push({ icon: "fas fa-hot-tub-person", label: "Jacuzzi" });
            base.push({ icon: "fas fa-champagne-glasses", label: "Mini Bar" });
            base.push({ icon: "fas fa-couch", label: "Lounge Area" });
        }

        if (type.includes("family") || (room.maxCapacity && room.maxCapacity >= 4)) {
            base.push({ icon: "fas fa-children", label: "Kid-Friendly" });
        }

        if (type.includes("sea") || type.includes("ocean") || type.includes("view")) {
            base.push({ icon: "fas fa-water", label: "Ocean View" });
        }

        var capacity = room.maxCapacity || 0;
        if (capacity >= 2) {
            base.push({ icon: "fas fa-bed", label: "King-size Bed" });
        }

        return base;
    }

    // ── DOM BINDING ─────────────────────────────────────────────────────────

    function renderStatusBadge(status) {
        var cls = getStatusClass(status);
        var label = getStatusLabel(status);
        var dot = '<i class="fas fa-circle"></i>';
        return '<span class="status-badge ' + cls + '">' + dot + ' ' + label + '</span>';
    }

    function renderHeroBadge(status) {
        var cls = getStatusClass(status);
        var label = getStatusLabel(status);
        return '<span class="room-hero-badge ' + cls + '">' + label + '</span>';
    }

    function populateRoomDetails(room, types) {
        var roomId = getRoomId(room);
        var roomName = getRoomName(room);
        var roomType = getRoomTypeName(room, types);
        var status = room.status || "AVAILABLE";
        var capacity = room.maxCapacity || 1;
        var desc = room.description || "Experience unparalleled comfort and luxury in this beautifully appointed room. Designed with elegance and modern amenities to ensure a memorable stay.";
        var price = getRoomPrice(room);
        var image = getRoomImage(room);
        var amenities = buildAmenities(room, roomType);

        // Hero Section
        document.getElementById("el-hero-img").src = image;
        document.getElementById("el-hero-img").alt = roomName;
        document.getElementById("el-hero-badge-container").innerHTML = renderHeroBadge(status);
        document.getElementById("el-hero-type").textContent = roomType;
        document.getElementById("el-hero-name").textContent = roomName;
        document.getElementById("el-hero-id").textContent = roomId;

        // Specifications
        document.getElementById("el-spec-type").textContent = roomType;
        document.getElementById("el-spec-capacity").textContent = capacity + " Guest" + (capacity > 1 ? "s" : "");
        document.getElementById("el-spec-status").innerHTML = renderStatusBadge(status);
        document.getElementById("el-spec-id").textContent = roomId;

        // Description
        document.getElementById("el-description").innerHTML = "<p>" + desc + "</p>";

        // Amenities
        var amenitiesHtml = amenities.map(function (a) {
            return '<span class="amenity-chip"><i class="' + a.icon + '"></i>' + a.label + '</span>';
        }).join("");
        document.getElementById("el-amenities").innerHTML = amenitiesHtml;

        // Booking Panel Info
        document.getElementById("el-panel-name").textContent = roomName;
        document.getElementById("el-panel-type").textContent = roomType;
        document.getElementById("el-panel-capacity").textContent = capacity + " Guest" + (capacity > 1 ? "s" : "");
        document.getElementById("el-panel-status").innerHTML = renderStatusBadge(status);

        // Price
        var priceContainer = document.getElementById("el-price-container");
        if (price) {
            priceContainer.innerHTML = 
                '<div class="price-label">Starting from</div>' +
                '<div class="price-value">' + formatPrice(price) + '</div>' +
                '<div class="price-unit">per night · taxes included</div>';
        } else {
            priceContainer.innerHTML = 
                '<div class="price-label">Starting from</div>' +
                '<div class="price-value" style="font-size:1.2rem;color:var(--text-muted)">Contact for pricing</div>' +
                '<div class="price-unit">Call our reservations desk</div>';
        }

        // Book Button
        var btnContainer = document.getElementById("el-book-button-container");
        var isUnavailable = status && (status.toLowerCase() === "maintenance");
        if (isUnavailable) {
            btnContainer.innerHTML = 
                '<button class="btn-book-main" disabled>' +
                '<i class="fas fa-ban"></i> Not Available</button>' +
                '<p class="booking-note"><i class="fas fa-info-circle" style="color:var(--text-muted)"></i> This room is currently under maintenance</p>';
        } else {
            btnContainer.innerHTML = 
                '<button class="btn-book-main" id="btn-book-now" onclick="RoomDetailPage.bookNow()">' +
                '<i class="fas fa-calendar-plus"></i> Book This Room</button>' +
                '<p class="booking-note"><i class="fas fa-shield-halved"></i> Free cancellation · No hidden fees</p>';
        }
    }

    // ── INIT ─────────────────────────────────────────────────────────────────

    var _currentRoomId = null;

    function getIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id") || params.get("roomId") || params.get("roomID");
    }

    function loadUser() {
        if (!global.Guard || !global.Guard.requireLogin()) return null;
        var user = global.AuthStore.getCurrentUser();
        if (!user) return null;

        if (user.accessToken || user.token) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token);
        }

        var topbar = document.getElementById("topbar-username");
        var sidebarName = document.getElementById("sidebar-username");
        var sidebarRole = document.getElementById("sidebar-role");
        if (topbar) topbar.textContent = user.fullName || "Guest";
        if (sidebarName) sidebarName.textContent = user.fullName || "Guest";
        if (sidebarRole) sidebarRole.textContent = user.role || "USER";
        return user;
    }

    function showState(stateId) {
        document.getElementById("loading-indicator").style.display = stateId === 'loading' ? 'block' : 'none';
        document.getElementById("not-found-message").style.display = stateId === 'not-found' ? 'block' : 'none';
        document.getElementById("room-detail-content").style.display = stateId === 'content' ? 'block' : 'none';
    }

    function init() {
        if (!loadUser()) return;

        var targetId = getIdFromUrl();
        if (!targetId) {
            showState('not-found');
            return;
        }

        showState('loading');

        var roomsPromise = global.RoomApi.getRooms();
        var typesPromise = (global.RoomTypeApi ? global.RoomTypeApi.getRoomTypes() : Promise.resolve([]))
            .catch(function () { return []; });

        Promise.all([roomsPromise, typesPromise])
            .then(function (results) {
                var rooms = Array.isArray(results[0]) ? results[0] : (results[0].payload || results[0].data || []);
                var types = Array.isArray(results[1]) ? results[1] : (results[1].payload || results[1].data || []);

                var room = rooms.find(function (r) {
                    var rid = String(r.roomID || r.roomId || r.id || "");
                    return rid === String(targetId);
                });

                if (!room) {
                    // Try fetching by ID directly
                    return global.RoomApi.getRoomById(targetId)
                        .then(function (data) {
                            var r = data && (data.payload || data.data || data);
                            if (!r || !getRoomId(r)) throw new Error("not found");
                            _currentRoomId = getRoomId(r);
                            populateRoomDetails(r, types);
                            showState('content');
                        })
                        .catch(function () {
                            showState('not-found');
                        });
                }

                _currentRoomId = getRoomId(room);
                populateRoomDetails(room, types);
                showState('content');
            })
            .catch(function (err) {
                console.error("Failed to load room:", err);
                showState('not-found');
            });
    }

    // ── BOOK NOW — navigates to create-booking with roomId pre-filled ────────

    function bookNow() {
        if (!_currentRoomId) return;
        window.location.href = "../booking/create-booking.html?roomId=" + encodeURIComponent(_currentRoomId);
    }

    // ── SIDEBAR ──────────────────────────────────────────────────────────────

    window.toggleSidebar = function () {
        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("sidebar-overlay");
        if (sidebar) sidebar.classList.toggle("open");
        if (overlay) overlay.classList.toggle("active");
    };

    window.closeSidebar = function () {
        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("sidebar-overlay");
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
    };

    // ── EXPOSE ───────────────────────────────────────────────────────────────

    global.RoomDetailPage = {
        bookNow: bookNow,
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "../auth/login.html";
        }
    };

    document.addEventListener("DOMContentLoaded", init);

})(window);
