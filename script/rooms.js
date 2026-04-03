(function (global) {
    "use strict";

    // ====================== LOAD USER ======================
    function loadUser() {
        if (!global.Guard.requireLogin()) return;

        const user = global.AuthStore.getCurrentUser();
        if (!user) return;

        document.getElementById('topbar-username').textContent = user.fullName;
        document.getElementById('sidebar-username').textContent = user.fullName;
        document.getElementById('sidebar-role').textContent = user.role;
    }

    // ====================== LOGOUT ======================
    function handleLogout() {
        global.AuthStore.clearCurrentUser();
        window.location.href = "login.html";
    }

    // ====================== RENDER ROOMS ======================
    async function loadRooms() {
        const list = document.getElementById("rooms-list");
        list.innerHTML = `<div class="loading">Loading rooms...</div>`;

        try {
            const rooms = await global.RoomApi.getRooms();
            const types = await global.RoomTypeApi.getRoomTypes();

            if (!rooms.length) {
                list.innerHTML = `<p>No rooms found.</p>`;
                return;
            }

            list.innerHTML = rooms.map(room => {
                const type = types.find(t => t.id === room.roomTypeId);
                return `
                <div class="room-card">
                    <img src="${room.image || 'assets/image/home/villa/villa1.jpg'}" class="room-img">
                    <div class="room-info">
                        <h3>${room.name}</h3>
                        <p class="room-type">${type ? type.name : "Unknown Type"}</p>
                        <div class="room-price">$${room.price}</div>
                        <button class="btn-book" onclick="RoomsPage.bookRoom(${room.id})">
                            <i class="fas fa-calendar-plus"></i> Book Now
                        </button>
                    </div>
                </div>
                `;
            }).join("");

        } catch (err) {
            list.innerHTML = `<p class="error">Failed to load rooms.</p>`;
            console.error(err);
        }
    }

    // ====================== BOOK ACTION ======================
    function bookRoom(id) {
        window.location.href = `bookings.html?roomId=${id}`;
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

