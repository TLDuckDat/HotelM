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

    function getRoomById(id, options) {
        return baseApi.get(ROOM_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function createRoom(roomPayload, options) {
        return baseApi.post(ROOM_ENDPOINT, roomPayload, options);
    }

    function updateRoom(id, roomPayload, options) {
        return baseApi.put(ROOM_ENDPOINT + "/" + encodeURIComponent(id), roomPayload, options);
    }

    function deleteRoom(id, options) {
        return baseApi.del(ROOM_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.RoomApi = {
        getRooms: getRooms,
        getRoomById: getRoomById,
        createRoom: createRoom,
        updateRoom: updateRoom,
        deleteRoom: deleteRoom
    };
})(window);

