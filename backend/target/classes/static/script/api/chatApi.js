(function (global) {
    "use strict";

    var baseApi = global.HotelMApiBase;

    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading chatApi.js");
    }

    var CHAT_ENDPOINT = "/chat";

    function getAvailableStaff(options) {
        return baseApi.get(CHAT_ENDPOINT + "/staff", options);
    }

    function createThread(payload, options) {
        return baseApi.post(CHAT_ENDPOINT + "/threads", payload, options);
    }

    function getThread(threadId, options) {
        return baseApi.get(CHAT_ENDPOINT + "/threads/" + encodeURIComponent(threadId), options);
    }

    function getThreadsByUser(userId, options) {
        return baseApi.get(CHAT_ENDPOINT + "/users/" + encodeURIComponent(userId) + "/threads", options);
    }

    function sendMessage(payload, options) {
        return baseApi.post(CHAT_ENDPOINT + "/messages", payload, options);
    }

    global.ChatApi = {
        getAvailableStaff: getAvailableStaff,
        createThread: createThread,
        getThread: getThread,
        getThreadsByUser: getThreadsByUser,
        sendMessage: sendMessage
    };
})(window);
