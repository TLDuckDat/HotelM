(function (global) {
    "use strict";

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
        window.location.href = "login.html";
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
            renderRooms(result[0] || [], result[1] || []);
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
