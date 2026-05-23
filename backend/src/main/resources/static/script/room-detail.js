(function (global) {
    "use strict";

    // ── Module-level state (persists across re-renders) ──
    var _room = null;
    var _types = [];

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────

    function getLang() {
        return global.localStorage.getItem("sot_lang") || "en";
    }

    function t(key) {
        var lang = getLang();
        if (global.TRANSLATIONS && global.TRANSLATIONS[lang] && global.TRANSLATIONS[lang][key]) {
            return global.TRANSLATIONS[lang][key];
        }
        // Fallback keys
        var fallback = {
            room_detail_breadcrumb_rooms: { en: "Rooms", vi: "Phòng" },
            room_detail_back_rooms:       { en: "All Rooms", vi: "Tất cả phòng" },
            room_detail_hero_from:        { en: "From", vi: "Từ" },
            room_detail_hero_unit:        { en: "per night", vi: "mỗi đêm" },
            room_detail_specs_title:      { en: "Room Specifications", vi: "Thông số phòng" },
            room_detail_specs_type:       { en: "Room Type", vi: "Loại phòng" },
            room_detail_specs_guests:     { en: "Max Guests", vi: "Số khách tối đa" },
            room_detail_specs_status:     { en: "Status", vi: "Trạng thái" },
            room_detail_about_title:      { en: "About This Room", vi: "Thông tin về phòng" },
            room_detail_amenities_title:  { en: "Amenities & Features", vi: "Tiện nghi & Dịch vụ" },
            room_detail_rating_title:     { en: "Guest Rating", vi: "Đánh giá từ khách" },
            room_detail_rating_unit:      { en: "review", vi: "đánh giá" },
            room_detail_rating_units:     { en: "reviews", vi: "đánh giá" },
            room_detail_booking_from:     { en: "Starting from", vi: "Giá chỉ từ" },
            room_detail_booking_unit:     { en: "per night taxes & fees may apply", vi: "mỗi đêm đã bao gồm thuế & phí" },
            room_detail_booking_capacity: { en: "Up to", vi: "Tối đa" },
            room_detail_booking_guests:   { en: "guest", vi: "khách" },
            room_detail_booking_guests_plural: { en: "guests", vi: "khách" },
            room_detail_btn_book:         { en: "Book This Room", vi: "Đặt phòng ngay" },
            room_detail_btn_unavailable:  { en: "Currently Unavailable", vi: "Hiện không khả dụng" },
            room_detail_reviews_title:    { en: "Guest Reviews", vi: "Đánh giá của khách" },
            room_detail_reviews_none:     { en: "No reviews for this room yet. Be the first to stay and review!", vi: "Chưa có đánh giá nào cho phòng này. Hãy là người đầu tiên trải nghiệm!" },
            room_detail_reviews_no_comment: { en: "No comment provided.", vi: "Không có bình luận." },
            room_detail_error_not_found:  { en: "Room not found. It may have been removed or the link is invalid.", vi: "Không tìm thấy phòng. Có thể phòng đã bị xóa hoặc liên kết không hợp lệ." },
            room_detail_status_available: { en: "Available", vi: "Còn trống" },
            room_detail_status_occupied:  { en: "Occupied", vi: "Đã có khách" },
            loading_rooms:                { en: "Loading room details…", vi: "Đang tải thông tin phòng…" },
            loading_reviews:              { en: "Loading reviews...", vi: "Đang tải đánh giá..." },
            table_room:                   { en: "Room", vi: "Phòng" },
            table_type:                   { en: "Type", vi: "Loại" },
            table_capacity:               { en: "Capacity", vi: "Sức chứa" },
            table_status:                 { en: "Status", vi: "Trạng thái" },
            sidebar_search_rooms:         { en: "Search Rooms", vi: "Tìm phòng" },
        };
        if (fallback[key]) return fallback[key][lang] || fallback[key]["en"] || key;
        return key;
    }

    function getRoomIdFromURL() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id") || params.get("roomId");
    }

    function formatPrice(price) {
        if (!price && price !== 0) return "—";
        if (typeof window.formatCurrency === "function") return window.formatCurrency(price);
        var lang = getLang();
        var num = Number(price);
        return lang === "en"
            ? "$" + Math.round(num / 25000)
            : num.toLocaleString("vi-VN") + " ₫";
    }

    function getStatusBadgeClass(status) {
        if (!status) return "badge-maintenance";
        var s = status.toString().toUpperCase();
        if (s === "AVAILABLE") return "badge-available";
        if (s === "OCCUPIED" || s === "BOOKED") return "badge-occupied";
        return "badge-maintenance";
    }

    function getStatusLabel(status) {
        if (!status) return t("room_detail_status_available");
        var s = status.toString().toUpperCase();
        if (s === "AVAILABLE") return t("room_detail_status_available");
        if (s === "OCCUPIED" || s === "BOOKED") return t("room_detail_status_occupied");
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
    //  RENDER DETAIL
    // ─────────────────────────────────────────────

    function renderDetail(room, types) {
        var host = document.getElementById("main-content");
        if (!host) return;

        if (!room) {
            host.innerHTML = [
                '<div class="error-state fade-in">',
                '  <i class="fas fa-door-closed"></i>',
                '  <p>' + t("room_detail_error_not_found") + '</p>',
                '  <a href="rooms.html" class="btn-back" style="margin:20px auto 0;display:inline-flex">',
                '    <i class="fas fa-arrow-left"></i> ' + t("room_detail_back_rooms"),
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
        var desc      = room.description || room.desc || "Experience unmatched comfort and elegance at SOT Resort.";
        var image     = room.imageUrl || room.image || "assets/image/home/villa/villa1.jpg";
        var rating    = room.rating || room.averageRating || null;
        var reviewCnt = room.reviewCount || 0;

        // Price lookup
        var price = room.basePrice || 0;
        if (!price && room.roomType) price = room.roomType.basePrice || room.roomType.price || 0;
        if (!price && types && types.length) {
            var tid = room.roomTypeId || room.typeID || room.roomTypeID;
            var matched = types.find(function (tp) { return (tp.typeId || tp.typeID || tp.id) === tid; });
            if (matched) price = matched.basePrice || matched.price || 0;
        }

        // Type name
        var typeName = room.roomTypeName || "Standard";
        if (room.roomType && (room.roomType.typeName || room.roomType.name)) {
            typeName = room.roomType.typeName || room.roomType.name;
        } else if (types && types.length) {
            var tid2 = room.roomTypeId || room.typeID || room.roomTypeID;
            var m2 = types.find(function (tp) { return (tp.typeId || tp.typeID || tp.id) === tid2; });
            if (m2) typeName = m2.typeName || m2.name || typeName;
        }

        // Amenities
        var amenities = room.amenities || room.facilities || [];
        if (!amenities.length) amenities = DEFAULT_AMENITIES;

        var isAvailable = (status.toString().toUpperCase() === "AVAILABLE");
        var bookingUrl  = "create-booking.html?roomId=" + encodeURIComponent(roomId);
        var reviewUnit  = reviewCnt === 1 ? t("room_detail_rating_unit") : t("room_detail_rating_units");
        var guestUnit   = capacity === 1 ? t("room_detail_booking_guests") : t("room_detail_booking_guests_plural");

        host.innerHTML = [

            // Breadcrumb
            '<nav class="breadcrumb fade-in">',
            '  <a href="rooms.html">' + t("room_detail_breadcrumb_rooms") + '</a>',
            '  <span class="sep">›</span>',
            '  <span class="current">' + roomName + '</span>',
            '</nav>',

            // Back button
            '<a href="rooms.html" class="btn-back fade-in">',
            '  <i class="fas fa-arrow-left"></i> ' + t("room_detail_back_rooms"),
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
                '  <div class="hero-price-label">' + t("room_detail_hero_from") + '</div>',
                '  <div class="hero-price-amount">' + formatPrice(price) + '</div>',
                '  <div class="hero-price-unit">' + t("room_detail_hero_unit") + '</div>',
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
            '    <h3>' + t("room_detail_specs_title") + '</h3>',
            '  </div>',
            '  <div class="info-card-body">',
            '    <div class="specs-grid">',
            '      <div class="spec-item">',
            '        <i class="fas fa-tag spec-icon"></i>',
            '        <span class="spec-label">' + t("room_detail_specs_type") + '</span>',
            '        <span class="spec-value">' + typeName + '</span>',
            '      </div>',
            '      <div class="spec-item">',
            '        <i class="fas fa-users spec-icon"></i>',
            '        <span class="spec-label">' + t("room_detail_specs_guests") + '</span>',
            '        <span class="spec-value">' + (capacity || "—") + '</span>',
            '      </div>',
            '      <div class="spec-item">',
            '        <i class="fas fa-circle-dot spec-icon"></i>',
            '        <span class="spec-label">' + t("room_detail_specs_status") + '</span>',
            '        <span class="spec-value">' + getStatusLabel(status) + '</span>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>',

            // Description card
            '<div class="info-card">',
            '  <div class="info-card-header">',
            '    <i class="fas fa-align-left"></i>',
            '    <h3>' + t("room_detail_about_title") + '</h3>',
            '  </div>',
            '  <div class="info-card-body">',
            '    <p class="room-description">' + desc + '</p>',
            '  </div>',
            '</div>',

            // Amenities card
            '<div class="info-card">',
            '  <div class="info-card-header">',
            '    <i class="fas fa-concierge-bell"></i>',
            '    <h3>' + t("room_detail_amenities_title") + '</h3>',
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

            // Rating card
            (rating ? [
                '<div class="info-card">',
                '  <div class="info-card-header">',
                '    <i class="fas fa-star"></i>',
                '    <h3>' + t("room_detail_rating_title") + '</h3>',
                '  </div>',
                '  <div class="info-card-body">',
                '    <div class="rating-row">',
                '      <span class="rating-score">' + Number(rating).toFixed(1) + '</span>',
                renderStars(rating),
                '      <span class="rating-count">' + reviewCnt + ' ' + reviewUnit + '</span>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join("") : ""),

            '</div><!-- /.detail-left -->',

            // ── RIGHT COLUMN ──
            '<div class="detail-right">',
            '<div class="booking-card">',
            '  <div class="booking-card-header">',
            '    <div class="booking-price-label">' + t("room_detail_booking_from") + '</div>',
            '    <div class="booking-price">' + (price ? formatPrice(price) : t("room_detail_btn_unavailable")) + '</div>',
            '    <div class="booking-price-unit">' + t("room_detail_booking_unit") + '</div>',
            '  </div>',
            '  <div class="booking-card-body">',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-bed"></i> ' + t("table_room") + '</span>',
            '      <span class="meta-value">' + roomName + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-tag"></i> ' + t("table_type") + '</span>',
            '      <span class="meta-value">' + typeName + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-users"></i> ' + t("table_capacity") + '</span>',
            '      <span class="meta-value">' + t("room_detail_booking_capacity") + ' ' + (capacity || "—") + ' ' + guestUnit + '</span>',
            '    </div>',
            '    <div class="booking-meta-row">',
            '      <span class="meta-label"><i class="fas fa-circle-dot"></i> ' + t("table_status") + '</span>',
            '      <span class="meta-value" style="color:' + (isAvailable ? '#22c55e' : '#ef4444') + '">' + getStatusLabel(status) + '</span>',
            '    </div>',
            (isAvailable
                ? '<a href="' + bookingUrl + '" class="btn-book-now"><i class="fas fa-calendar-plus"></i> ' + t("room_detail_btn_book") + '</a>'
                : '<button class="btn-book-now unavailable" disabled><i class="fas fa-ban"></i> ' + t("room_detail_btn_unavailable") + '</button>'
            ),
            '  </div>',
            '</div>',
            '</div><!-- /.detail-right -->',

            '</div><!-- /.detail-body -->',

            // Reviews section
            '<div class="reviews-section fade-in" id="reviews-container">',
            '  <div class="reviews-header">',
            '    <h3><i class="fas fa-star"></i> ' + t("room_detail_reviews_title") + '</h3>',
            '  </div>',
            '  <div id="reviews-list" class="reviews-list">',
            '    <div class="loading-reviews">' + t("loading_reviews") + '</div>',
            '  </div>',
            '</div>'

        ].join("\n");
    }

    // ─────────────────────────────────────────────
    //  RENDER REVIEWS
    // ─────────────────────────────────────────────

    function renderReviews(reviews) {
        var list = document.getElementById("reviews-list");
        if (!list) return;

        if (!reviews || reviews.length === 0) {
            list.innerHTML = '<div class="no-reviews">' + t("room_detail_reviews_none") + '</div>';
            return;
        }

        var lang = getLang();
        var dateLocale = lang === "vi" ? "vi-VN" : "en-US";

        list.innerHTML = reviews.map(function (r) {
            if (r.status === "HIDDEN") return "";
            var date = new Date(r.createdAt).toLocaleDateString(dateLocale);
            var name = r.userName || "Guest";
            return [
                '<div class="review-item">',
                '  <div class="review-header">',
                '    <div class="review-user">',
                '      <div class="user-avatar-sm">' + name[0].toUpperCase() + '</div>',
                '      <div>',
                '        <div class="user-name">' + name + '</div>',
                '        <div class="review-date">' + date + '</div>',
                '      </div>',
                '    </div>',
                '    <div class="review-rating">' + renderStars(r.rating) + '</div>',
                '  </div>',
                '  <div class="review-comment">',
                (r.comment ? '"' + r.comment + '"' : '<em>' + t("room_detail_reviews_no_comment") + '</em>'),
                '  </div>',
                '</div>'
            ].join("");
        }).join("");
    }

    function loadReviews(roomId) {
        if (!global.ReviewApi || !global.ReviewApi.getReviewsByRoom) return;
        global.ReviewApi.getReviewsByRoom(roomId).then(function (reviews) {
            renderReviews(reviews);
        }).catch(function () {
            var list = document.getElementById("reviews-list");
            if (list) list.innerHTML = '<div class="error-reviews">Unable to load reviews.</div>';
        });
    }

    // ─────────────────────────────────────────────
    //  LANGUAGE CHANGE HANDLER (no page reload)
    // ─────────────────────────────────────────────

    function handleLanguageChange() {
        if (!_room) return;

        // Re-render detail with new language / currency
        renderDetail(_room, _types);

        // Re-render reviews (date locale may change)
        loadReviews(_room.roomId || _room.roomID || _room.id);
    }

    // ─────────────────────────────────────────────
    //  SIDEBAR / TOPBAR USER
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
    //  INIT
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
                '    <i class="fas fa-arrow-left"></i> ' + t("sidebar_search_rooms"),
                '  </a>',
                '</div>'
            ].join("\n");
            return;
        }

        if (host) host.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>' + t("loading_rooms") + '</span></div>';

        var roomPromise  = global.RoomApi
            ? global.RoomApi.getRoomById(roomId)
            : Promise.reject(new Error("RoomApi not available"));

        var typesPromise = global.RoomTypeApi
            ? global.RoomTypeApi.getRoomTypes().catch(function () { return []; })
            : Promise.resolve([]);

        Promise.all([roomPromise, typesPromise])
            .then(function (results) {
                _room  = results[0] || null;
                _types = results[1] || [];

                if (_room) {
                    document.title = (_room.roomName || _room.name || "Room") + " – SOT Resort";
                    loadReviews(roomId);
                }

                renderDetail(_room, _types);
            })
            .catch(function (err) {
                console.error("room-detail error:", err);
                if (host) host.innerHTML = [
                    '<div class="error-state fade-in">',
                    '  <i class="fas fa-triangle-exclamation"></i>',
                    '  <p>Unable to load room details. Please try again later.</p>',
                    '  <a href="rooms.html" class="btn-back" style="margin:20px auto 0;display:inline-flex">',
                    '    <i class="fas fa-arrow-left"></i> ' + t("room_detail_back_rooms"),
                    '  </a>',
                    '</div>'
                ].join("\n");
            });
    }

    // ─────────────────────────────────────────────
    //  GLOBALS
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

    window.goToRoomDetail = function (roomId) {
        window.location.href = "room-detail.html?id=" + encodeURIComponent(roomId);
    };

    // ─────────────────────────────────────────────
    //  BOOT
    // ─────────────────────────────────────────────

    document.addEventListener("DOMContentLoaded", function () {
        init();
        // Register language change listener AFTER init so _room is populated
        window.addEventListener("languageChanged", handleLanguageChange);
    });

})(window);