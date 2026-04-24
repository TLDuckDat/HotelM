(function (global) {
    "use strict";

    function getRoomId() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    function renderRoom(room) {
        var host = document.getElementById("room-detail");
        if (!room) {
            host.innerHTML = "<div class='notice'>Room not found</div>";
            return;
        }

        host.innerHTML = ""
            + "<div class='card'>"
            + "<h2>" + (room.roomName || "") + "</h2>"
            + "<p><strong>ID:</strong> " + (room.roomID || "") + "</p>"
            + "<p><strong>Status:</strong> " + (room.status || "") + "</p>"
            + "<p><strong>Capacity:</strong> " + (room.maxCapacity || 0) + "</p>"
            + "<p><strong>Description:</strong> " + (room.description || "") + "</p>"
            + "<p><a href='/booking.html'>Book this room</a></p>"
            + "</div>";
    }

    function init() {
        global.AppShell.renderTopbar("Room Detail");

        var roomId = getRoomId();
        global.RoomApi.getRooms().then(function (rooms) {
            var room = (rooms || []).find(function (item) {
                return item.roomID === roomId;
            });
            renderRoom(room);
        }).catch(function () {
            document.getElementById("room-detail").innerHTML = "<div class='error'>Cannot load room detail</div>";
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

