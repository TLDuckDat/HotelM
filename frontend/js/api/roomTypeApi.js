(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading roomTypeApi.js");
    }

    var ROOM_TYPE_ENDPOINT = "/room-types";

    function getRoomTypes(options) {
        return baseApi.get(ROOM_TYPE_ENDPOINT, options);
    }

    function getRoomTypeById(id, options) {
        return baseApi.get(ROOM_TYPE_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    function createRoomType(roomTypePayload, options) {
        return baseApi.post(ROOM_TYPE_ENDPOINT, roomTypePayload, options);
    }

    function updateRoomType(id, roomTypePayload, options) {
        return baseApi.put(ROOM_TYPE_ENDPOINT + "/" + encodeURIComponent(id), roomTypePayload, options);
    }

    function deleteRoomType(id, options) {
        return baseApi.del(ROOM_TYPE_ENDPOINT + "/" + encodeURIComponent(id), options);
    }

    global.RoomTypeApi = {
        getRoomTypes: getRoomTypes,
        getRoomTypeById: getRoomTypeById,
        createRoomType: createRoomType,
        updateRoomType: updateRoomType,
        deleteRoomType: deleteRoomType
    };
})(window);

