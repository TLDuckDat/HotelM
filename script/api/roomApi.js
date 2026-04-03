(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading roomApi.js");
    }

    var ROOM_ENDPOINT = "/rooms";

    function getRooms(options) {
        return baseApi.get(ROOM_ENDPOINT, options);
    }

    function createRoom(roomPayload, options) {
        return baseApi.post(ROOM_ENDPOINT, roomPayload, options);
    }

    global.RoomApi = {
        getRooms: getRooms,
        createRoom: createRoom
    };
})(window);

