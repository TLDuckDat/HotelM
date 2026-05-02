(function (global) {
    "use strict";

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    function getRoomIdFromURL() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id") || params.get("roomId");
    }

    function formatPrice(price) {
        if (!price && price !== 0) return "—";
        return Number(price).toLocaleString("vi-VN") + " ₫";
    }

    function getStatusBadgeClass(status) {
        if (!status) return "badge-maintenance";
        var s = status.toString().toUpperCase();
        if (s === "AVAILABLE") return "badge-available";
        if (s === "OCCUPIED" || s === "BOOKED") return "badge-occupied";
        return "badge-maintenance";
    }

    function getStatusLabel(status) {
        if (!status) return "Unknown";
        var s = status.toString().toUpperCase();
        if (s === "AVAILABLE") return "Available";
        if (s === "OCCUPIED" || s === "BOOKED") return "Occupied";
        return status;
    }

    function renderStars(rating) {
        if (!rating) return '<span class="rating-stars" style="color:rgba(61,40,23,.2)">★★★★★</span>';
        var full = Math.round(rating);
        var stars = "";
        for (var i = 1; i <= 5; i++) {
            stars += i <= full ? "★" : "☆";
        }
        return '<span class="rating-stars">' + stars + "</span>";
    }

    function getAmenityIcon(name) {
        var n = (name || "").toLowerCase();
        if (n.includes("wifi") || n.includes("internet")) return "fa-wifi";
        if (n.includes("pool") || n.includes("swim")) return "fa-water-ladder";
        if (n.includes("gym") || n.includes("fitness")) return "fa-dumbbell";
        if (n.includes("spa") || n.includes("sauna")) return "fa-spa";
        if (n.includes("tv") || n.includes("television")) return "fa-tv";
        if (n.includes("air") || n.includes("ac") || n.includes("condition")) return "fa-wind";
        if (n.includes("breakfast") || n.includes("restaurant") || n.includes("dining")) return "fa-utensils";
        if (n.includes("park") || n.includes("garage")) return "fa-car";
        if (n.includes("bar") || n.includes("mini-bar")) return "fa-martini-glass";
        if (n.includes("bath") || n.includes("tub") || n.includes("jacuzzi")) return "fa-bath";
        if (n.includes("balcony") || n.includes("terrace") || n.includes("view")) return "fa-mountain-sun";
        if (n.includes("safe") || n.includes("security")) return "fa-lock";
        if (n.includes("laundry") || n.includes("wash")) return "fa-shirt";
        if (n.includes("phone") || n.includes("concierge")) return "fa-phone";
        return "fa-check";
    }

    var DEFAULT_AMENITIES = [
        "Free Wi-Fi", "Air Conditioning", "Flat-screen TV",
        "Mini-bar", "Safe", "Daily Housekeeping"
    ];

    // ─────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────

    function renderDetail(room, types) {
        var host = document.getElementById("main-content");
        if (!host) return;

        if (!room) {
            host.innerHTML = [
                '<div class="error-state fade-in">',
                '  <i class="fas fa-door-closed"></i>',
                '  <p>Room not found. It may have been removed or the link is invalid.</p>',
                '  <a href="rooms.html" class="btn-back" style="margin:20px auto 0;display:inline-flex">',
                '    <i class="fas fa-arrow-left"></i> Back to Rooms',
                '  </a>',
                '</div>'
            ].join("\n");
            return;
        }

        // ── Resolve fields ──
        var roomId    = room.roomId || room.roomID || room.id || "";
        var roomName  = room.roomName || room.name || "Unnamed Room";
        var status    = room.status || "";
        var capacity  = room.maxCapacity || room.capacity || 0;
        var desc      = room.description || room.desc || "Experience unmatched comfort and elegance at SOT Resort. This beautifully appointed room offers a serene retreat with premium amenities and breathtaking surroundings.";
        var image     = room.imageUrl || room.image || "assets/image/home/villa/villa1.jpg";
        var rating    = room.rating || room.averageRating || null;
        var reviewCnt = room.reviewCount || 0;

        // Price: room.price → roomType.price → types array lookup
        var price = room.price || 0;
        if (!price && room.roomType) price = room.roomType.price || 0;
        if (!price && types && types.length) {
            var tid = room.roomTypeId || room.typeID || room.roomTypeID;
            var matched = types.find(function (t) { return (t.typeID || t.id) === tid; });
            if (matched) price = matched.price || 0;
        }

        // Type name
        var typeName = "Standard";
        if (room.roomType && (room.roomType.typeName || room.roomType.name)) {
            typeName = room.roomType.typeName || room.roomType.name;
        } else if (types && types.length) {
            var tid2 = room.roomTypeId || room.typeID || room.roomTypeID;
            var m2 = types.find(function (t) { return (t.typeID || t.id) === tid2; });
            if (m2) typeName = m2.typeName || m2.name || typeName;
        }

        // Amenities
        var amenities = room.amenities || room.facilities || [];
        if (!amenities.length) amenities = DEFAULT_AMENITIES;

        var isAvailable = (status.toString().toUpperCase() === "AVAILABLE");
        var bookingUrl  = "create-booking.html?roomId=" + encodeURIComponent(roomId);

        // ── Build HTML ──
        host.innerHTML = [

            // Breadcrumb
            '<nav class="breadcrumb fade-in">',
            '  <a href="rooms.html">Rooms</a>',,
            '  <span class="sep">›</span>',
            '  <span class="current">' + roomName + '</span>',
            '</nav>',

            // Back button
            '<a href="rooms.html" class="btn-back fade-in">',
            '  <i class="fas fa-arrow-left"></i> All Rooms',
            '</a>',

            // Hero image
            '<div class="detail-hero fade-in">',
            '  <img src="' + image + '" alt="' + roomName + '" id="hero-img" />',
            '  <span class="hero-status-badge ' + getStatusBadgeClass(status) + '">',
            '    <i class="fas fa-circle" style="font-size:.5rem;margin-right:5px"></i>',
            getStatusLabel(status),
            '  </span>',
            '  <div class="hero-bottom">',
            '    <div>',
            '      <div class="hero-room-name">' + roomName + '</div>',
            '      <div class="hero-room-type">' + typeName + '</div>',
            '    </div>',
            (price ? [
                '<div class="hero-price-block">',
                '  <div class="hero-price-label">From</div>',
                '  <div class="hero-price-amount">' + formatPrice(price) + '</div>',
                '  <div class="hero-price-unit">per night</div>',
                '</div>'
            ].join("") : ""),
            '  </div>',
            '</div>',

            // Body grid
            '<div class="detail-body fade-in">',

            // ── LEFT COLUMN ──
            '<div class="detail-left">',

            // Specs card
            '<div class="info-card">',
            '  <div class="info-card-header">',
            '    <i class="fas fa-info-circle"></i>',
            '    <h3>Room Specifications</h3>',
            '  </div>',
            '  <div class="info-card-body">',
            '    <div class="specs-grid">',
            '      <div class="spec-item">',
            '        <i class="fas fa-tag spec-icon"></i>',
            '        <span class="spec-label">Room Type</span>',
            '        <span class="spec-value">' + typeName + '</span>',
            '      </div>',
            '      <div class="spec-item">',
            '        <i class="fas fa-users spec-icon"></i>',
            '        <span class="spec-label">Max Guests</span>',
            '        <span class="spec-value">' + (capacity || "—") + '</span>',
            '      </div>',

            '      <div class="spec-item">',
            '        <i class="fas fa-circle-dot spec-icon"></i>',
            '        <span class="spec-label">Status</span>',
            '        <span class="spec-value">' + getStatusLabel(status) + '</span>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>',

            // Description card
            '<div class="info-card">',
            '  <div class="info-card-header">',
            '    <i class="fas fa-align-left"></i>',
            '    <h3>About This Room</h3>',
            '  </div>',
            '  <div class="info-card-body">',
            '    <p class="room-description">' + desc + '</p>',
            '  </div>',
            '</div>',

            // Amenities card
            '<div class="info-card">',
            '  <div class="info-card-header">',
            '    <i class="fas fa-concierge-bell"></i>',
            '    <h3>Amenities &amp; Features</h3>',
            '  </div>',
            '  <div class="info-card-body">',
            '    <ul class="amenities-list">',
            amenities.map(function (a) {
                var label = (typeof a === "string") ? a : (a.name || a.amenityName || String(a));
                return '<li class="amenity-tag"><i class="fas ' + getAmenityIcon(label) + '"></i> ' + label + '</li>';
            }).join(""),
            '    </ul>',
            '  </div>',
            '</div>',

            // Rating card (only when data exists)
            (rating ? [
                '<div class="info-card">',
                '  <div class="info-card-header">',
                '    <i class="fas fa-star"></i>',
                '    <h3>Guest Rating</h3>',
                '  </div>',
                '  <div class="info-card-body">',
                '    <div class="rating-row">',
                '      <span class="rating-score">' + Number(rating).toFixed(1) + '</span>',
                renderStars(rating),
                '      <span class="rating-count">' + reviewCnt + ' review' + (reviewCnt !== 1 ? 's' : '') + '</span>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join("") : ""),

            '</div><!-- /.detail-left -->',

            // ── RIGHT COLUMN — sticky booking card ──
            '<div class="detail-right">',
            '<div class="booking-card">',
            '  <div class="booking-card-header">',
            '    <div class="booking-price-label">Starting from</div>',
            '    <div class="booking-price">' + (price ? formatPrice(price) : "Contact us") + '</div>',
            '    <div class="booking-price-unit">per night · taxes &amp; fees may apply</div>',
            '  </div>',
            '  <div class="booking-card-body">',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-bed"></i> Room</span>',
            '      <span class="meta-value">' + roomName + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-tag"></i> Type</span>',
            '      <span class="meta-value">' + typeName + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-users"></i> Capacity</span>',
            '      <span class="meta-value">Up to ' + (capacity || "—") + ' guest' + (capacity !== 1 ? "s" : "") + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-circle-dot"></i> Status</span>',
            '      <span class="meta-value" style="color:' + (isAvailable ? '#22c55e' : '#ef4444') + '">' + getStatusLabel(status) + '</span>',
            '    </div>',
            // ── Book Now / Unavailable button ──
            (isAvailable
                ? '<a href="' + bookingUrl + '" class="btn-book-now"><i class="fas fa-calendar-plus"></i> Book This Room</a>'
                : '<button class="btn-book-now unavailable" disabled><i class="fas fa-ban"></i> Currently Unavailable</button>'
            ),
            '  </div>',
            '</div>',
            '</div><!-- /.detail-right -->',

            '</div><!-- /.detail-body -->'

        ].join("\n");
    }

    // ─────────────────────────────────────────────
    //  LOAD USER (sidebar + topbar)
    // ─────────────────────────────────────────────

    function loadUser() {
        if (global.Guard && !global.Guard.requireLogin()) return;
        var user = global.AuthStore && global.AuthStore.getCurrentUser();
        if (!user) return;
        var el = document.getElementById("topbar-username");
        if (el) el.textContent = user.fullName || user.name || "Guest";
        var sName = document.getElementById("sidebar-username");
        if (sName) sName.textContent = user.fullName || user.name || "Guest";
        var sRole = document.getElementById("sidebar-role");
        if (sRole) sRole.textContent = user.role || "USER";
    }

    // ─────────────────────────────────────────────
    //  MAIN INIT
    // ─────────────────────────────────────────────

    function init() {
        loadUser();

        var roomId = getRoomIdFromURL();
        var host   = document.getElementById("main-content");

        if (!roomId) {
            if (host) host.innerHTML = [
                '<div class="error-state fade-in">',
                '  <i class="fas fa-exclamation-triangle"></i>',
                '  <p>No room ID provided. Please go back and select a room.</p>',
                '  <a href="rooms.html" class="btn-back" style="margin:20px auto 0;display:inline-flex">',
                '    <i class="fas fa-arrow-left"></i> Search Rooms',
                '  </a>',
                '</div>'
            ].join("\n");
            return;
        }

        // Show loading spinner
        if (host) host.innerHTML = [
            '<div class="loading-state">',
            '  <div class="spinner"></div>',
            '  <span>Loading room details…</span>',
            '</div>'
        ].join("\n");

        // ── Fetch room by ID directly + room types in parallel ──
        var roomPromise  = global.RoomApi
            ? global.RoomApi.getRoomById(roomId)
            : Promise.reject(new Error("RoomApi not available"));

        var typesPromise = global.RoomTypeApi
            ? global.RoomTypeApi.getRoomTypes().catch(function () { return []; })
            : Promise.resolve([]);

        Promise.all([roomPromise, typesPromise])
            .then(function (results) {
                var room  = results[0] || null;
                var types = results[1] || [];

                if (room) {
                    document.title = (room.roomName || room.name || "Room") + " – SOT Resort";
                }

                renderDetail(room, types);
            })
            .catch(function (err) {
                console.error("room-detail error:", err);
                if (host) host.innerHTML = [
                    '<div class="error-state fade-in">',
                    '  <i class="fas fa-triangle-exclamation"></i>',
                    '  <p>Unable to load room details. Please try again later.</p>',
                    '  <a href="rooms.html" class="btn-back" style="margin:20px auto 0;display:inline-flex">',
                    '    <i class="fas fa-arrow-left"></i> Back to Rooms',
                    '  </a>',
                    '</div>'
                ].join("\n");
            });
    }

    // ─────────────────────────────────────────────
    //  MOBILE SIDEBAR
    // ─────────────────────────────────────────────

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    window.handleLogout = function () {
        if (global.AuthStore && global.AuthStore.clearCurrentUser) {
            global.AuthStore.clearCurrentUser();
        } else {
            localStorage.removeItem("sotCurrentUser");
        }
        window.location.href = "index.html";
    };

    window.toggleNotification = function (e) {
        e.stopPropagation();
        var menu = document.getElementById("notificationMenu");
        if (menu) menu.classList.toggle("active");
    };

    document.addEventListener("click", function (e) {
        var nd = document.querySelector(".notification-dropdown");
        if (nd && !nd.contains(e.target)) {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });

    // Navigate from rooms list to this detail page
    window.goToRoomDetail = function (roomId) {
        window.location.href = "room-detail.html?id=" + encodeURIComponent(roomId);
    };

    document.addEventListener("DOMContentLoaded", init);

})(window);