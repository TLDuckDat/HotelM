(function (global) {
    "use strict";

    // Khai báo biến lưu trữ dữ liệu gốc để lọc
    let rawRooms = [];
    let rawTypes = [];

    // ====================== LOAD USER ======================
    function loadUser() {
        if (!global.Guard.requireLogin()) return;

        const user = global.AuthStore.getCurrentUser();
        if (!user) return;

        document.getElementById('topbar-username').textContent = user.fullName || "Guest";
        document.getElementById('sidebar-username').textContent = user.fullName || "Guest";
        document.getElementById('sidebar-role').textContent = user.role || "USER";
    }

    // ====================== LOGOUT ======================
    function handleLogout() {
        global.AuthStore.clearCurrentUser();
        window.location.href = "index.html";
    }

    // --- LOGIC LỌC MỚI THÊM VÀO ---
    function applyFilters() {
        const typeVal = document.getElementById('filter-type').value;
        const capVal = document.getElementById('filter-capacity').value;
        const priceVal = document.getElementById('filter-price').value;

        const filtered = rawRooms.filter(room => {
            // Lọc loại phòng
            const rTypeId = (room.roomTypeId || room.typeID || room.roomTypeID)?.toString();
            const matchType = !typeVal || rTypeId === typeVal;

            // Lọc sức chứa
            const matchCap = !capVal || (room.maxCapacity >= parseInt(capVal));

            // Lọc giá (Giả định room có trường price hoặc lấy từ roomType)
            let matchPrice = true;
            if (priceVal) {
                const [min, max] = priceVal.split('-').map(Number);
                const rPrice = room.price || room.roomType?.price || 0;
                matchPrice = rPrice >= min && rPrice <= max;
            }

            return matchType && matchCap && matchPrice;
        });

        renderRooms(filtered, rawTypes);
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
                opt.value = t.typeID || t.id;
                opt.textContent = t.typeName || t.name;
                typeSelect.appendChild(opt);
            });
        }

        // 3. Gắn sự kiện lọc cho các ô input
        const controls = ['filter-type', 'filter-capacity', 'filter-price'];
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
                renderRooms(rawRooms, rawTypes);
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
        return room.roomID || room.id || "";
    }

    function getRoomName(room) {
        return room.roomName || room.name || "Unnamed room";
    }

    function getRoomImage(room) {
        return room.imageUrl || room.image || "assets/image/home/villa/villa1.jpg";
    }

    function getRoomTypeName(room, types) {
        if (room.roomType && (room.roomType.typeName || room.roomType.name)) {
            return room.roomType.typeName || room.roomType.name;
        }

        var roomTypeId = room.roomTypeId || room.typeID || room.roomTypeID;
        if (!roomTypeId) {
            return "Unknown Type";
        }

        var matched = (types || []).find(function (t) {
            var id = t.typeID || t.id;
            return id === roomTypeId;
        });

        return matched ? (matched.typeName || matched.name || "Unknown Type") : "Unknown Type";
    }

    function renderRooms(rooms, types) {
        var list = document.getElementById("rooms-list");
        if (!list) return;

        if (!rooms || !rooms.length) {
            list.innerHTML = "<p>No rooms found.</p>";
            return;
        }

        list.innerHTML = rooms.map(function (room) {
            var roomId = getRoomId(room);
            var roomName = getRoomName(room);
            var roomType = getRoomTypeName(room, types);
            var status = room.status || "N/A";
            var capacity = room.maxCapacity || 0;

            return ""
                + "<div class='room-card'>"
                + "  <div class='room-img-wrap'>"
                + "    <img src='" + getRoomImage(room) + "' class='room-img' alt='" + roomName + "'>"
                + "  </div>"
                + "  <div class='room-info'>"
                + "    <p class='room-type'><i class='fas fa-tag'></i> " + roomType + "</p>"
                + "    <h3>" + roomName + "</h3>"
                + "    <div class='room-meta'>"
                + "      <span><i class='fas fa-circle-dot'></i> Status: <strong>" + status + "</strong></span>"
                + "      <span><i class='fas fa-users'></i> Capacity: <strong>" + capacity + "</strong></span>"
                + "    </div>"
                + "    <button class='btn-book' onclick=\"RoomsPage.bookRoom('" + roomId + "')\">"
                + "      <i class='fas fa-calendar-plus'></i> Book Now"
                + "    </button>"
                + "  </div>"
                + "</div>";
        }).join("");
    }

    function loadRooms() {
        var list = document.getElementById("rooms-list");
        if (!list) return;
        list.innerHTML = "<div class='loading'>Loading rooms...</div>";

        Promise.all([
            global.RoomApi.getRooms(),
            global.RoomTypeApi.getRoomTypes().catch(function () { return []; })
        ]).then(function (result) {
            // QUAN TRỌNG: Phải gán dữ liệu vào biến raw trước khi render
            rawRooms = result[0] || [];
            rawTypes = result[1] || [];

            initFilterEvents(rawTypes); // Khởi tạo sự kiện ẩn/hiện và lọc
            renderRooms(rawRooms, rawTypes); // Hiển thị danh sách ban đầu
        }).catch(function (err) {
            list.innerHTML = "<p class='error'>Failed to load rooms.</p>";
            console.error(err);
        });
    }

    // ====================== BOOK ACTION ======================
    function bookRoom(id) {
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
        loadUser();
        loadRooms();
    });

    // expose
    global.RoomsPage = {
        handleLogout,
        bookRoom
    };

})(window);


// (function (global) {
//     "use strict";

//     var allRooms = [];

//     function roomTypeName(room) {
//         if (!room || !room.roomType) {
//             return "N/A";
//         }

//         return room.roomType.typeName || room.roomType.roomTypeName || room.roomType.name || "N/A";
//     }

//     function renderRooms(rooms) {
//         var body = document.getElementById("rooms-body");
//         if (!body) {
//             return;
//         }

//         if (!rooms || rooms.length === 0) {
//             body.innerHTML = "<tr><td colspan='6'>No rooms found</td></tr>";
//             return;
//         }

//         body.innerHTML = rooms.map(function (room) {
//             return "<tr>"
//                 + "<td>" + (room.roomID || "") + "</td>"
//                 + "<td>" + (room.roomName || "") + "</td>"
//                 + "<td>" + roomTypeName(room) + "</td>"
//                 + "<td>" + (room.maxCapacity || 0) + "</td>"
//                 + "<td><span class='badge'>" + (room.status || "") + "</span></td>"
//                 + "<td><a href='/room-detail.html?id=" + encodeURIComponent(room.roomID || "") + "'>Detail</a></td>"
//                 + "</tr>";
//         }).join("");
//     }

//     function applyFilter() {
//         var keyword = document.getElementById("room-keyword").value.trim().toLowerCase();
//         var filtered = allRooms.filter(function (room) {
//             var name = (room.roomName || "").toLowerCase();
//             var status = (room.status || "").toLowerCase();
//             return name.indexOf(keyword) !== -1 || status.indexOf(keyword) !== -1;
//         });

//         renderRooms(filtered);
//     }

//     function loadRooms() {
//         global.AppShell.renderTopbar("Room List");

//         global.RoomApi.getRooms().then(function (rooms) {
//             allRooms = rooms || [];
//             renderRooms(allRooms);
//         }).catch(function (error) {
//             var box = document.getElementById("rooms-error");
//             var msg = error && error.payload && error.payload.message
//                 ? error.payload.message
//                 : "Cannot load rooms";
//             box.textContent = msg;
//             box.style.display = "block";
//         });

//         document.getElementById("room-search-btn").addEventListener("click", applyFilter);
//     }

//     document.addEventListener("DOMContentLoaded", loadRooms);
// })(window);
