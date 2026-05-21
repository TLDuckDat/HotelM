(function (global) {
    "use strict";

    let stompClient = null;
    let currentUser = null;

    function init() {
        currentUser = global.AuthStore ? global.AuthStore.getCurrentUser() : null;
        if (!currentUser) return;

        // Fetch initial unread count
        updateUnreadCount();

        // Connect to WebSocket for real-time notifications
        connectWebSocket();

        // Bind click events
        const bellBtn = document.querySelector('.notification-btn');
        if (bellBtn) {
            bellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNotificationMenu();
            });
        }

        document.addEventListener('click', () => {
            const menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        });
    }

    function connectWebSocket() {
        const socket = new SockJS('/ws/chat');
        stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable logging

        stompClient.connect({}, function (frame) {
            // Subscribe to personal notification topic
            stompClient.subscribe('/topic/notifications/' + currentUser.userID, function (message) {
                const notification = JSON.parse(message.body);
                handleNewNotification(notification);
            });
        }, function(error) {
            console.warn("Notification WebSocket connection lost. Retrying in 5s...");
            setTimeout(connectWebSocket, 5000);
        });
    }

    function handleNewNotification(notification) {
        // Increment badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            let count = parseInt(badge.textContent || "0");
            badge.textContent = count + 1;
            badge.style.display = 'flex';
        }

        // Add to list if menu is open or just refresh list next time it opens
        if (document.getElementById("notificationMenu").classList.contains("active")) {
            loadNotifications();
        }

        // Show a small toast or just vibrate (optional)
        console.log("New Notification:", notification.message);
    }

    function updateUnreadCount() {
        if (!global.NotificationApi) return;
        global.NotificationApi.getUnreadCount(currentUser.userID).then(count => {
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = count > 0 ? count : "";
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    function toggleNotificationMenu() {
        const menu = document.getElementById("notificationMenu");
        if (!menu) return;

        const isActive = menu.classList.toggle("active");
        if (isActive) {
            loadNotifications();
        }
    }

    function loadNotifications() {
        const list = document.querySelector('.notification-list');
        if (!list) return;

        list.innerHTML = '<div class="notification-loading" data-i18n="loading_text">Loading...</div>';

        global.NotificationApi.getNotificationsForUser(currentUser.userID).then(notifications => {
            if (!notifications || notifications.length === 0) {
                list.innerHTML = '<div class="notification-empty">No notifications</div>';
                return;
            }

            list.innerHTML = notifications.map(n => {
                const isRead = n.read === true || n.isRead === true;
                return `
                <div class="notification-item ${isRead ? '' : 'unread'}" onclick="NotificationManager.handleNotificationClick('${n.id}', '${n.type}', '${n.relatedId}')">
                    <div class="notification-icon">
                        <i class="${getIconForType(n.type)}"></i>
                    </div>
                    <div class="notification-info">
                        <div class="notification-title">${n.title}</div>
                        <div class="notification-message">${n.message}</div>
                        <div class="notification-time">${formatTime(n.createdAt)}</div>
                    </div>
                </div>
                `;
            }).join('');

            // Mark all as read after opening
            global.NotificationApi.markAllAsRead(currentUser.userID).then(() => {
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = "";
                    badge.style.display = 'none';
                }
            });
        });
    }

    function getIconForType(type) {
        switch(type) {
            case 'CHAT_MESSAGE': return 'fas fa-comment';
            case 'BOOKING_NEW': return 'fas fa-calendar-plus';
            case 'BOOKING_STATUS': return 'fas fa-info-circle';
            case 'REFUND_REQUEST': return 'fas fa-undo';
            case 'REFUND_STATUS': return 'fas fa-check-circle';
            case 'SYSTEM': return 'fas fa-cog';
            default: return 'fas fa-bell';
        }
    }

    function formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return date.toLocaleDateString();
    }

    function handleNotificationClick(id, type, relatedId) {
        // Mark this one as read
        global.NotificationApi.markAsRead(id);
        
        // Navigate based on type
        switch(type) {
            case 'CHAT_MESSAGE':
                window.location.href = (currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST') 
                    ? 'admin-chat.html?threadId=' + relatedId : 'account.html#chat';
                break;
            case 'BOOKING_NEW':
            case 'BOOKING_STATUS':
                window.location.href = (currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST')
                    ? 'admin-bookings.html?id=' + relatedId : 'bookings.html?id=' + relatedId;
                break;
            case 'REFUND_REQUEST':
            case 'REFUND_STATUS':
                window.location.href = (currentUser.role === 'ADMIN' || currentUser.role === 'RECEPTIONIST')
                    ? 'admin-refunds.html?id=' + relatedId : 'refunds.html?id=' + relatedId;
                break;
            default:
                // Do nothing
        }
    }


    // Expose
    global.NotificationManager = {
        init,
        handleNotificationClick
    };

    document.addEventListener('DOMContentLoaded', init);

})(window);
