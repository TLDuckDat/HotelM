(function (global) {
    "use strict";

    function renderTopbar(title) {
        var host = document.getElementById("app-topbar");
        if (!host) {
            return;
        }

        var user = global.AuthStore ? global.AuthStore.getCurrentUser() : null;
        var role = user && user.role ? user.role : "GUEST";
        var userId = user && user.userID ? user.userID : null;
        var name = user && user.fullName ? user.fullName : "Guest";

        var topbarHtml = ""
            + "<div class='topbar'>"
            + "  <div><strong>HotelM</strong> - " + title + "</div>"
            + "  <div style='display: flex; align-items: center;'>"
            + "    <span class='badge'>" + name + " (" + role + ")</span>";

        if (userId) {
            topbarHtml += ""
                + "    <div class='nav-notification' id='nav-notification-bell'>"
                + "      <i class='fas fa-bell'></i>"
                + "      <span class='notification-badge' id='unread-count-badge'>0</span>"
                + "      <div class='notification-dropdown' id='notification-dropdown'>"
                + "        <div class='notification-header'>"
                + "          <span>Notifications</span>"
                + "          <span class='mark-all' id='mark-all-read'>Mark all as read</span>"
                + "        </div>"
                + "        <div class='notification-list' id='notification-list'>"
                + "          <div class='notification-empty'>No notifications</div>"
                + "        </div>"
                + "      </div>"
                + "    </div>";
        }

        topbarHtml += ""
            + "    <a href='index.html'>Home</a>"
            + "    <a href='dashboard.html'>Dashboard</a>"
            + "    <a href='room-list.html'>Rooms</a>"
            + "    <a href='bookings.html'>Bookings</a>"
            + "    <a href='create-booking.html'>Create Booking</a>"
            + "    <a href='payment.html'>Payments</a>"
            + "    <a href='refund.html'>Refunds</a>"
            + "    <a href='review-list.html'>Reviews</a>"
            + "    <a href='account.html'>Account</a>"
            + "    <a href='admin-dashboard.html'>Admin</a>"
            + "    <button id='logout-btn' type='button'>Logout</button>"
            + "  </div>"
            + "</div>";

        host.innerHTML = topbarHtml;

        var logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                if (global.AuthStore) {
                    global.AuthStore.clearCurrentUser();
                }
                window.location.href = "login.html";
            });
        }

        if (userId) {
            initNotifications(userId);
        }
    }

    function initNotifications(userId) {
        var bell = document.getElementById("nav-notification-bell");
        var dropdown = document.getElementById("notification-dropdown");
        var markAll = document.getElementById("mark-all-read");

        if (!bell || !dropdown) return;

        bell.addEventListener("click", function (e) {
            e.stopPropagation();
            var isVisible = dropdown.style.display === "block";
            dropdown.style.display = isVisible ? "none" : "block";
            if (!isVisible) {
                loadNotifications(userId);
            }
        });

        document.addEventListener("click", function () {
            dropdown.style.display = "none";
        });

        dropdown.addEventListener("click", function (e) {
            e.stopPropagation();
        });

        markAll.addEventListener("click", function () {
            if (global.NotificationApi) {
                global.NotificationApi.markAllAsRead(userId).then(function() {
                    loadUnreadCount(userId);
                    loadNotifications(userId);
                });
            }
        });

        loadUnreadCount(userId);
        setupWebSocket(userId);
    }

    function loadUnreadCount(userId) {
        if (!global.NotificationApi) return;
        global.NotificationApi.getUnreadCount(userId).then(function (res) {
            var count = res.payload || res.data || res || 0;
            var badge = document.getElementById("unread-count-badge");
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? "block" : "none";
            }
        });
    }

    function loadNotifications(userId) {
        if (!global.NotificationApi) return;
        global.NotificationApi.getNotificationsForUser(userId).then(function (res) {
            var notifications = Array.isArray(res) ? res : (res.payload || res.data || []);
            renderNotificationList(notifications);
        });
    }

    function renderNotificationList(notifications) {
        var list = document.getElementById("notification-list");
        if (!list) return;

        if (notifications.length === 0) {
            list.innerHTML = "<div class='notification-empty'>No notifications</div>";
            return;
        }

        list.innerHTML = notifications.map(function (n) {
            var timeStr = n.createdAt ? new Date(n.createdAt).toLocaleString() : "";
            var unreadClass = n.isRead ? "" : "unread";
            return ""
                + "<div class='notification-item " + unreadClass + "' data-id='" + n.id + "'>"
                + "  <span class='title'>" + (n.title || "") + "</span>"
                + "  <span class='message'>" + (n.message || "") + "</span>"
                + "  <span class='time'>" + timeStr + "</span>"
                + "</div>";
        }).join("");

        list.querySelectorAll(".notification-item").forEach(function (item) {
            item.addEventListener("click", function () {
                var id = this.getAttribute("data-id");
                if (global.NotificationApi) {
                    global.NotificationApi.markAsRead(id).then(function() {
                        var user = global.AuthStore.getCurrentUser();
                        loadUnreadCount(user.userID);
                        item.classList.remove("unread");
                    });
                }
            });
        });
    }

    function setupWebSocket(userId) {
        // Only setup if libraries are present
        if (!global.SockJS || !global.Stomp) return;

        var socket = new SockJS('/ws/chat');
        var stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable logging

        stompClient.connect({}, function () {
            stompClient.subscribe('/topic/notifications/' + userId, function (msg) {
                var notification = JSON.parse(msg.body);
                // Update badge and if dropdown is open, update list
                loadUnreadCount(userId);
                
                var dropdown = document.getElementById("notification-dropdown");
                if (dropdown && dropdown.style.display === "block") {
                    loadNotifications(userId);
                }
            });
        });
    }

    global.AppShell = {
        renderTopbar: renderTopbar
    };

})(window);

