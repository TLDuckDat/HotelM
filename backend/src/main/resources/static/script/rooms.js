(function (global) {
    "use strict";

    // Khai báo biến lưu trữ dữ liệu gốc để lọc
    let rawRooms = [];
    let rawTypes = [];

    var ROOMS_PER_PAGE = 20;
    var currentRoomsPage = 1;
    var lastRenderedRooms = [];
    var lastRenderedTypes = [];

    var ROOMS_PAGINATION_I18N = {
        en: {
            prev: "Previous",
            next: "Next",
            pageOf: function (c, t) { return "Page " + c + " of " + t; },
            range: function (lo, hi, total) { return "Showing " + lo + "–" + hi + " of " + total; },
            pageLabel: "Page",
            ofLabel: "of"
        },
        vi: {
            prev: "Trước",
            next: "Tiếp",
            pageOf: function (c, t) { return "Trang " + c + " / " + t; },
            range: function (lo, hi, total) { return "Hiển thị " + lo + "–" + hi + " / " + total; },
            pageLabel: "Trang",
            ofLabel: "/"
        }
    };

    function getRoomsPaginationStrings() {
        var lang = (global.localStorage.getItem("sot_lang") || "en") === "vi" ? "vi" : "en";
        return ROOMS_PAGINATION_I18N[lang];
    }

    function scrollRoomsListIntoView() {
        var list = document.getElementById("rooms-list");
        if (list && typeof list.scrollIntoView === "function") {
            list.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function goRoomsPage(page) {
        var total = lastRenderedRooms.length;
        var totalPages = Math.max(1, Math.ceil(total / ROOMS_PER_PAGE));
        var next = Math.min(Math.max(1, page), totalPages);
        if (next === currentRoomsPage) return;
        currentRoomsPage = next;
        renderRooms(lastRenderedRooms, lastRenderedTypes, false);
        scrollRoomsListIntoView();
    }

    // ====================== AUTH & UI ======================
    function checkExistingUser() {
        const user = global.AuthStore ? global.AuthStore.getCurrentUser() : JSON.parse(localStorage.getItem('sotCurrentUser'));
        const navActions = document.getElementById('nav-actions');
        if (!navActions || !user) return;

        const isAdmin = user.role === 'ADMIN';
        const profileHref = isAdmin ? 'admin-dashboard.html' : 'account.html';
        const profileLabel = isAdmin ? 'Admin Dashboard' : 'Profile';
        const roomsHref = isAdmin ? 'admin-rooms.html' : 'rooms.html';
        const bookingsHref = isAdmin ? 'admin-bookings.html' : 'bookings.html';

        navActions.innerHTML = `
        <button id="lang-toggle-btn" onclick="toggleLanguage()" title="Switch language">
            <span class="lang-flag">🇻🇳</span>
            <span class="lang-label">VI</span>
        </button>

        <div class="notification-dropdown">
            <button class="notification-btn" onclick="toggleNotification(event)">
                <i class="fas fa-bell"></i>
                <span class="notification-badge"></span>
            </button>
            <div class="notification-content" id="notificationMenu">
                <div class="notification-header" data-i18n="notification_title">Notifications</div>
                <div class="notification-list">
                    <div class="notification-empty" data-i18n="notification_empty">No new notifications</div>
                </div>
            </div>
        </div>

        <div class="user-dropdown">
            <div class="user-avatar" onclick="toggleUserMenu()">
                <img src="assets/image/logo.svg" alt="avatar">
            </div>
            <div class="user-menu" id="userMenu">
                <div class="menu-header">
                    <img src="assets/image/logo.svg" class="menu-logo">
                    <div class="menu-brand">SOT</div>
                    <div class="menu-avatar"><i class="fas fa-user"></i></div>
                    <div class="menu-username">${user.fullName || user.name || 'User'}</div>
                </div>
                <a href="${profileHref}" class="menu-item" data-i18n="${isAdmin ? 'menu_dashboard' : 'menu_profile'}">
                ${profileLabel}
            </a>
            <a href="${roomsHref}" class="menu-item" data-i18n="menu_rooms">
                Rooms
            </a>
            <a href="${bookingsHref}" class="menu-item" data-i18n="menu_bookings">
                Bookings
            </a>
            <button class="menu-item logout" onclick="logoutUser()" data-i18n="menu_logout">
                Logout
            </button>
            </div>
        </div>`;

        if (typeof applyTranslations === 'function') {
            applyTranslations(global.localStorage.getItem('sot_lang') || 'en');
        }
    }

    function toggleUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.toggle('active');
    }

    global.toggleUserMenu = toggleUserMenu;

    document.addEventListener('click', function (e) {
        const dropdown = document.querySelector('.user-dropdown');
        if (!dropdown) return;
        if (!dropdown.contains(e.target)) {
            const menu = document.getElementById('userMenu');
            if (menu) menu.classList.remove('active');
        }
    });

    function logoutUser() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        else localStorage.removeItem('sotCurrentUser');
        location.reload();
    }
    global.logoutUser = logoutUser;

    async function loadAuthModals() {
        try {
            const response = await fetch('auth-modals.html');
            const html = await response.text();
            const placeholder = document.getElementById('auth-modals-placeholder');
            if (placeholder) {
                placeholder.innerHTML = html;
                if (typeof initModals === 'function') initModals();
                if (typeof initForgotPasswordModal === 'function') initForgotPasswordModal();

                const lForm = document.getElementById('loginForm');
                const rForm = document.getElementById('registerForm');
                const fForm = document.getElementById('forgotPasswordForm');

                if (lForm) lForm.addEventListener('submit', handleLogin);
                if (rForm) rForm.addEventListener('submit', handleRegister);
                if (fForm) fForm.addEventListener('submit', handleForgotPassword);

                document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                    backdrop.addEventListener('click', () => {
                        if (typeof closeLoginModal === 'function') closeLoginModal();
                        if (typeof closeRegisterModal === 'function') closeRegisterModal();
                        if (typeof closeForgotPasswordModal === 'function') closeForgotPasswordModal();
                    });
                });
            }
        } catch (error) {
            console.error('Error loading auth modals:', error);
        }
    }

    // --- LOGIC LỌC MỚI THÊM VÀO ---
    function applyFilters() {
        const keywordVal = (document.getElementById('filter-keyword')?.value || "").trim().toLowerCase();
        const typeVal = document.getElementById('filter-type').value;
        const capVal = document.getElementById('filter-capacity').value;
        const priceVal = document.getElementById('filter-price').value;

        const filtered = rawRooms.filter(room => {
            // Lọc theo keyword (tên phòng / loại phòng)
            const name = (getRoomName(room) || "").toLowerCase();
            const typeName = (getRoomTypeName(room, rawTypes) || "").toLowerCase();
            const matchKeyword = !keywordVal || name.includes(keywordVal) || typeName.includes(keywordVal);

            // Lọc loại phòng
            const rTypeId = (room.roomTypeId || room.typeID || room.roomTypeID)?.toString();
            const matchType = !typeVal || rTypeId === typeVal;

            // Lọc sức chứa
            const matchCap = !capVal || (room.maxCapacity >= parseInt(capVal));

            // Lọc giá (Giả định room có trường price hoặc lấy từ roomType)
            let matchPrice = true;
            if (priceVal) {
                const [min, max] = priceVal.split('-').map(Number);
                const rPrice = room.basePrice || 0;
                matchPrice = rPrice >= min && rPrice <= max;
            }

            return matchKeyword && matchType && matchCap && matchPrice;
        });

        renderRooms(filtered, rawTypes, true);
    }

    function initFilterEvents(types) {
        const filterForm = document.getElementById('filter-form');
        const toggleBtn = document.getElementById('toggle-filter');
        const chevron = document.getElementById('filter-chevron');

        // 1. Logic ẩn/hiện form
        if (toggleBtn && filterForm) {
            toggleBtn.addEventListener('click', () => {
                // Kiểm tra trạng thái hiện tại
                if (filterForm.style.display === 'none') {
                    filterForm.style.display = 'grid';
                    chevron.style.transform = 'rotate(0deg)';
                } else {
                    filterForm.style.display = 'none';
                    chevron.style.transform = 'rotate(180deg)';
                }
            });
        }

        // 2. Đổ dữ liệu vào select loại phòng
        const typeSelect = document.getElementById('filter-type');
        if (typeSelect && typeSelect.options.length <= 1) {
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.typeId || t.typeID || t.id;
                opt.textContent = t.typeName || t.name;
                typeSelect.appendChild(opt);
            });
        }

        // 3. Gắn sự kiện lọc cho các ô input
        const controls = ['filter-keyword', 'filter-type', 'filter-capacity', 'filter-price'];
        controls.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Dùng event 'input' cho cả 3 để lọc ngay lập tức khi thay đổi
                el.addEventListener('input', applyFilters);
            }
        });

        // 4. Nút Reset
        const resetBtn = document.getElementById('btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.getElementById('filter-form').reset();
                renderRooms(rawRooms, rawTypes, true);
            });
        }

        const filterContainer = document.getElementById('filter-container');
        const toggleFilter = document.getElementById('toggle-filter');
        const filterChevron = document.getElementById('filter-chevron');

        if (toggleFilter) {
            toggleFilter.addEventListener('click', () => {
                filterContainer.classList.toggle('collapsed');
                // Xoay icon 180 độ khi đóng
                filterChevron.style.transform = filterContainer.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    }

    // ====================== RENDER ROOMS ======================
    function getRoomId(room) {
        return room.roomId || room.roomID || room.id || "";
    }

    function getRoomName(room) {
        return room.roomName || room.name || "Unnamed room";
    }

    function getRoomImage(room) {
        return room.imageUrl || room.image || "assets/image/home/villa/villa1.jpg";
    }

    function getRoomTypeName(room, types) {
        // 1. Check if backend provided roomTypeName directly (RoomResponse DTO)
        if (room.roomTypeName) return room.roomTypeName;

        // 2. Check for nested roomType object
        if (room.roomType && (room.roomType.typeName || room.roomType.name)) {
            return room.roomType.typeName || room.roomType.name;
        }

        // 3. Fallback to searching in types array
        var roomTypeId = room.roomTypeId || room.typeID || room.roomTypeID;
        if (!roomTypeId) {
            return "Unknown Type";
        }

        var matched = (types || []).find(function (t) {
            var id = t.typeId || t.typeID || t.id;
            return id === roomTypeId;
        });

        return matched ? (matched.typeName || matched.name || "Unknown Type") : "Unknown Type";
    }

    function updateRoomsPaginationNav(total, totalPages, startIndex, pageCount) {
        var nav = document.getElementById("rooms-pagination");
        if (!nav) return;

        if (!total) {
            nav.classList.remove("is-visible");
            nav.innerHTML = "";
            return;
        }

        if (totalPages <= 1) {
            nav.classList.remove("is-visible");
            nav.innerHTML = "";
            return;
        }

        var pg = getRoomsPaginationStrings();
        var lo = startIndex + 1;
        var hi = startIndex + pageCount;
        var prevDisabled = currentRoomsPage <= 1;
        var nextDisabled = currentRoomsPage >= totalPages;

        nav.innerHTML = ""
            + "<button type='button' id='rooms-pg-prev'" + (prevDisabled ? " disabled" : "") + ">" + pg.prev + "</button>"
            + "<div class='rooms-pagination-controls'>"
            + "<span>" + pg.pageLabel + "</span>"
            + "<input type='number' id='rooms-pg-input' class='rooms-pagination-input' value='" + currentRoomsPage + "' min='1' max='" + totalPages + "'>"
            + "<span class='rooms-pagination-total'>" + pg.ofLabel + " " + totalPages + "</span>"
            + "</div>"
            + "<button type='button' id='rooms-pg-next'" + (nextDisabled ? " disabled" : "") + ">" + pg.next + "</button>";

        nav.classList.add("is-visible");

        var prevBtn = document.getElementById("rooms-pg-prev");
        var nextBtn = document.getElementById("rooms-pg-next");
        var pgInput = document.getElementById("rooms-pg-input");

        if (prevBtn && !prevDisabled) {
            prevBtn.addEventListener("click", function () { goRoomsPage(currentRoomsPage - 1); });
        }
        if (nextBtn && !nextDisabled) {
            nextBtn.addEventListener("click", function () { goRoomsPage(currentRoomsPage + 1); });
        }
        if (pgInput) {
            pgInput.addEventListener("change", function () {
                var p = parseInt(this.value);
                if (!isNaN(p)) goRoomsPage(p);
            });
            pgInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    var p = parseInt(this.value);
                    if (!isNaN(p)) goRoomsPage(p);
                }
            });
        }
    }

    function renderRooms(rooms, types, resetPage) {
        var list = document.getElementById("rooms-list");
        if (!list) return;

        lastRenderedRooms = rooms || [];
        lastRenderedTypes = types || [];

        if (resetPage) {
            currentRoomsPage = 1;
        }

        var total = lastRenderedRooms.length;
        var totalPages = Math.max(1, Math.ceil(total / ROOMS_PER_PAGE));

        if (currentRoomsPage > totalPages) {
            currentRoomsPage = totalPages;
        }
        if (currentRoomsPage < 1) {
            currentRoomsPage = 1;
        }

        var nav = document.getElementById("rooms-pagination");

        if (!total) {
            list.innerHTML = "<p>No rooms found.</p>";
            if (nav) {
                nav.classList.remove("is-visible");
                nav.innerHTML = "";
            }
            return;
        }

        var start = (currentRoomsPage - 1) * ROOMS_PER_PAGE;
        var pageRooms = lastRenderedRooms.slice(start, start + ROOMS_PER_PAGE);

        var lang = (global.localStorage.getItem("sot_lang") || "en");
        var isVi = lang === "vi";

        var i18n = {
            status:     isVi ? "Trạng thái"   : "Status",
            capacity:   isVi ? "Sức chứa"     : "Capacity",
            from:       isVi ? "Từ"            : "From",
            perNight:   isVi ? "/ đêm"         : "/ night",
            bookNow:    isVi ? "Xem chi tiết"  : "View Details",
            available:  isVi ? "Còn trống"     : "Available",
            occupied:   isVi ? "Đã có khách"   : "Occupied",
            noPrice:    isVi ? "Liên hệ"       : "Contact us",
        };

        function translateStatus(s) {
            var up = (s || "").toUpperCase();
            if (up === "AVAILABLE") return isVi ? "Còn trống" : "Available";
            if (up === "OCCUPIED" || up === "BOOKED") return isVi ? "Đã có khách" : "Occupied";
            if (up === "MAINTENANCE") return isVi ? "Bảo trì" : "Maintenance";
            return s || "—";
        }

        function formatRoomPrice(price) {
            if (!price) return i18n.noPrice;
            if (typeof window.formatCurrency === "function") return window.formatCurrency(price);
            return isVi
                ? Number(price).toLocaleString("vi-VN") + " ₫"
                : "$" + Math.round(Number(price) / 25000);
        }

        list.innerHTML = pageRooms.map(function (room) {
            var roomId   = getRoomId(room);
            var roomName = getRoomName(room);
            var roomType = getRoomTypeName(room, types);
            var status   = room.status || "N/A";
            var capacity = room.maxCapacity || 0;
            var price    = room.basePrice
                || (room.roomType && (room.roomType.basePrice || room.roomType.price))
                || 0;
            var isAvailable = status.toUpperCase() === "AVAILABLE";
            var statusClass = isAvailable ? "status-available" : "status-occupied";

            return ""
                + "<div class='room-card'>"
                + "  <div class='room-img-wrap'>"
                + "    <img src='" + getRoomImage(room) + "' class='room-img' alt='" + roomName + "'>"
                + "    <span class='room-status-badge " + statusClass + "'>" + translateStatus(status) + "</span>"
                + "  </div>"
                + "  <div class='room-info'>"
                + "    <p class='room-type'><i class='fas fa-tag'></i> " + roomType + "</p>"
                + "    <h3>" + roomName + "</h3>"
                + "    <div class='room-meta'>"
                + "      <span><i class='fas fa-users'></i> " + i18n.capacity + ": <strong>" + capacity + "</strong></span>"
                + (price ? "      <span><i class='fas fa-tag'></i> " + i18n.from + " <strong>" + formatRoomPrice(price) + "</strong> " + i18n.perNight + "</span>" : "")
                + "    </div>"
                + "    <button class='btn-book' onclick=\"window.location.href='room-detail.html?id=" + encodeURIComponent(roomId) + "'\">"
                + "      <i class='fas fa-eye'></i> " + i18n.bookNow
                + "    </button>"
                + "  </div>"
                + "</div>";
        }).join("");

        updateRoomsPaginationNav(total, totalPages, start, pageRooms.length);
    }

    async function loadRooms() {
        var list = document.getElementById("rooms-list");
        if (!list) return;
        list.innerHTML = "<div class='loading' data-i18n='loading_rooms'>Loading rooms...</div>";
        if (typeof applyTranslations === 'function') applyTranslations(global.localStorage.getItem('sot_lang') || 'en');

        try {
            const [rooms, types] = await Promise.all([
                global.RoomApi.getRooms(),
                global.RoomTypeApi.getRoomTypes().catch(() => [])
            ]);

            rawRooms = rooms || [];
            rawTypes = types || [];

            initFilterEvents(rawTypes);
            renderRooms(rawRooms, rawTypes, true);
        } catch (err) {
            list.innerHTML = "<p class='error'>Failed to load rooms.</p>";
            console.error(err);
        }
    }

    // ====================== BOOK ACTION ======================
    function bookRoom(id) {
        const user = global.AuthStore ? global.AuthStore.getCurrentUser() : JSON.parse(localStorage.getItem('sotCurrentUser'));
        if (!user) {
            if (typeof openLoginModal === 'function') {
                openLoginModal();
            } else {
                window.location.href = "index.html"; // fallback if modal not loaded
            }
            return;
        }
        window.location.href = "create-booking.html?roomId=" + encodeURIComponent(id);
    }

    // ====================== MOBILE SIDEBAR ======================
    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    };

    window.closeSidebar = function () {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    };

    // ====================== INIT ======================
    document.addEventListener("DOMContentLoaded", () => {
        loadAuthModals();
        checkExistingUser();
        loadRooms();

        // Listen for language change to re-render dynamic content
        window.addEventListener('languageChanged', () => {
            renderRooms(lastRenderedRooms, lastRenderedTypes, false);
        });

        // Scroll header effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('main-header');
            if (header) header.classList.toggle('scrolled', window.scrollY > 50);
        });
    });

    // expose
    global.RoomsPage = {
        logoutUser,
        bookRoom,
        goRoomsPage
    };

})(window);
