(function (global) {
    "use strict";

    // ── Helpers ──

    function setMessage(text, type) {
        var box = document.getElementById("admin-message");
        if (!box) return;
        box.className = "flash-message " + (type || "notice");
        box.textContent = text;
        box.style.display = "block";
    }

    function statusBadge(status) {
        var cls = {
            AVAILABLE: "badge-available",
            BOOKED: "badge-booked",
            MAINTENANCE: "badge-maintenance"
        }[status] || "badge-user";
        return "<span class='badge " + cls + "'>" + (status || "—") + "</span>";
    }

    function roomId(room) {
        return room.roomID || room.roomId || room.id || "";
    }

    function roomName(room) {
        return room.roomName || room.name || "";
    }

    // ── Render ──

    function renderRooms(rooms) {
        var body = document.getElementById("admin-rooms-body");
        if (!body) return;

        if (!rooms || rooms.length === 0) {
            body.innerHTML = "<tr><td colspan='5' class='table-empty'>No rooms found</td></tr>";
            return;
        }

        body.innerHTML = (rooms || []).map(function (room) {
            var id = roomId(room);
            return "<tr>"
                + "<td>" + id + "</td>"
                + "<td>" + roomName(room) + "</td>"
                + "<td>" + (room.maxCapacity || 0) + "</td>"
                + "<td>" + statusBadge(room.status) + "</td>"
                + "<td><button class='btn-delete' data-delete-room='" + id + "'>"
                + "<i class='fas fa-trash-alt'></i> Delete</button></td>"
                + "</tr>";
        }).join("");

        body.querySelectorAll("button[data-delete-room]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                deleteRoom(btn.getAttribute("data-delete-room"));
            });
        });
    }

    // ── API calls ──

    function loadRooms() {
        global.RoomApi.getRooms().then(function (rooms) {
            renderRooms(rooms);
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Cannot load rooms";
            setMessage(msg, "error");
        });
    }

    function createRoom(event) {
        event.preventDefault();

        var payload = {
            roomName: document.getElementById("admin-room-name").value.trim(),
            maxCapacity: Number(document.getElementById("admin-room-capacity").value),
            description: document.getElementById("admin-room-desc").value.trim(),
            status: document.getElementById("admin-room-status").value
        };

        if (!payload.roomName || !payload.maxCapacity) {
            setMessage("Room name and capacity are required", "error");
            return;
        }

        global.RoomApi.createRoom(payload).then(function () {
            setMessage("Room created", "success");
            document.getElementById("admin-create-room-form").reset();
            loadRooms();
        }).catch(function (error) {
            var msg = error && error.payload && error.payload.message
                ? error.payload.message : "Create room failed";
            setMessage(msg, "error");
        });
    }

    function deleteRoom(roomIdValue) {
        if (!roomIdValue) return;

        global.RoomApi.deleteRoom(roomIdValue).then(function () {
            setMessage("Room deleted", "success");
            loadRooms();
        }).catch(function (error) {
            var msg = error && error.status === 405
                ? "Backend does not support DELETE /rooms/{id} yet."
                : (error && error.payload && error.payload.message
                    ? error.payload.message : "Delete room failed");
            setMessage(msg, "error");
        });
    }

    // ── Sidebar / Notification ──

    window.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    window.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    window.toggleNotification = function (e) {
        e.stopPropagation();
        var menu = document.getElementById("notificationMenu");
        if (menu) menu.classList.toggle("active");
    };

    document.addEventListener("click", function (e) {
        var dropdown = document.querySelector(".notification-dropdown");
        if (dropdown && !dropdown.contains(e.target)) {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });

    // ── Init ──

    function init() {
        if (!global.Guard.requireAdmin()) return;

        global.AppShell.renderTopbar("Room Management");

        var user = global.AuthStore.getCurrentUser();
        if (user) {
            var topbarEl = document.getElementById("topbar-username");
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            if (topbarEl) topbarEl.textContent = user.fullName || "Admin";
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
        }

        var roomForm = document.getElementById("admin-create-room-form");
        if (roomForm) roomForm.addEventListener("submit", createRoom);

        loadRooms();
    }

    document.addEventListener("DOMContentLoaded", init);

    // ── Public API ──

    global.AdminRooms = {
        handleLogout: function () {
            if (global.AuthStore) global.AuthStore.clearCurrentUser();
            window.location.href = "index.html";
        }
    };

})(window);