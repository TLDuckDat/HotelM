(function (global) {
    "use strict";

    const baseApi = global.HotelMApiBase;
    if (!baseApi) {
        throw new Error("HotelMApiBase is required before loading notificationApi.js");
    }

    const NOTIFICATION_ENDPOINT = "/notifications";

    /**
     * Lấy danh sách thông báo của một user
     */
    function getNotificationsForUser(userId) {
        return baseApi.get(`${NOTIFICATION_ENDPOINT}/user/${userId}`);
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    function getUnreadCount(userId) {
        return baseApi.get(`${NOTIFICATION_ENDPOINT}/user/${userId}/unread-count`);
    }

    /**
     * Đánh dấu một thông báo đã đọc
     */
    function markAsRead(notificationId) {
        return baseApi.patch(`${NOTIFICATION_ENDPOINT}/${notificationId}/read`);
    }

    /**
     * Đánh dấu tất cả thông báo của user đã đọc
     */
    function markAllAsRead(userId) {
        return baseApi.patch(`${NOTIFICATION_ENDPOINT}/user/${userId}/read-all`);
    }

    global.NotificationApi = {
        getNotificationsForUser,
        getUnreadCount,
        markAsRead,
        markAllAsRead
    };

})(window);
