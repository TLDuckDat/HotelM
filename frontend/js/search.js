(function (global) {
    "use strict";

    var rooms = [];

    function render(list) {
        var body = document.getElementById("search-results");
        if (!list.length) {
            body.innerHTML = "<div class='notice'>No matching rooms</div>";
            return;
        }

        body.innerHTML = list.map(function (room) {
            return "<div class='card'><h3>" + (room.roomName || "") + "</h3><p>Status: " + (room.status || "") + "</p><p>Capacity: " + (room.maxCapacity || 0) + "</p></div>";
        }).join("");
    }

    function applySearch() {
        var keyword = document.getElementById("q").value.trim().toLowerCase();
        var capacity = Number(document.getElementById("capacity").value || 0);

        var filtered = rooms.filter(function (room) {
            var byKeyword = !keyword || (room.roomName || "").toLowerCase().indexOf(keyword) !== -1;
            var byCapacity = !capacity || (room.maxCapacity || 0) >= capacity;
            return byKeyword && byCapacity;
        });

        render(filtered);
    }

    function init() {
        global.AppShell.renderTopbar("Room Search");

        global.RoomApi.getRooms().then(function (data) {
            rooms = data || [];
            render(rooms);
        }).catch(function () {
            document.getElementById("search-results").innerHTML = "<div class='error'>Cannot load rooms</div>";
        });

        document.getElementById("search-btn").addEventListener("click", applySearch);
    }

    document.addEventListener("DOMContentLoaded", init);
})(window);

