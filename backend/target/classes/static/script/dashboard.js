(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("dashboard-message");
        if (!el) return;
        el.className = "message-box " + (type || "notice");
        el.textContent = text;
        el.style.display = text ? "block" : "none";
    }

    function countAvailableRooms(rooms) {
        return (rooms || []).filter(function (r) {
            var status = (r.status || r.roomStatus || "").toUpperCase();
            return !status || status === "AVAILABLE";
        }).length;
    }

    function filterByCurrentUser(items, userId) {
        return (items || []).filter(function (item) {
            return String(item.userId || item.userID || "") === userId;
        });
    }

    function loadDashboard() {
        if (!global.Guard.requireLogin()) return;

        var user = global.AuthStore && global.AuthStore.getCurrentUser();
        var userId = user ? String(user.userId || user.userID || user.id || "") : "";

        var roomPromise = global.RoomApi.getRooms();
        var bookingPromise = global.BookingApi.getBookings();
        var paymentPromise = global.PaymentApi && userId
            ? global.PaymentApi.getPaymentsByUser(userId)
            : Promise.resolve([]);
        var reviewPromise = global.ReviewApi
            ? global.ReviewApi.getReviews()
            : Promise.resolve([]);

        Promise.all([roomPromise, bookingPromise, paymentPromise, reviewPromise])
            .then(function (results) {
                var rooms = results[0] || [];
                var bookings = results[1] || [];
                var payments = results[2] || [];
                var reviews = results[3] || [];

                var myBookings = filterByCurrentUser(bookings, userId);
                var myPayments = filterByCurrentUser(payments, userId);
                var myReviews = filterByCurrentUser(reviews, userId);

                var elBookings = document.getElementById("stat-bookings");
                var elRooms = document.getElementById("stat-rooms");
                var elPayments = document.getElementById("stat-payments");
                var elReviews = document.getElementById("stat-reviews");

                if (elBookings) elBookings.textContent = String(myBookings.length);
                if (elRooms) elRooms.textContent = String(countAvailableRooms(rooms));
                if (elPayments) elPayments.textContent = String(myPayments.length);
                if (elReviews) elReviews.textContent = String(myReviews.length);
            })
            .catch(function (err) {
                var msg = (err && err.payload && err.payload.message) || "Cannot load dashboard data";
                setMessage(msg, "error");
            });
    }

    function renderUserUI() {
        var user = global.AuthStore && global.AuthStore.getCurrentUser();
        if (!user) return;

        var topbarName = document.getElementById("topbar-username");
        var sidebarName = document.getElementById("sidebar-username");
        var sidebarRole = document.getElementById("sidebar-role");

        if (topbarName) topbarName.textContent = user.fullName || "Guest";
        if (sidebarName) sidebarName.textContent = user.fullName || "Guest";
        if (sidebarRole) sidebarRole.textContent = user.role || "USER";
    }

    global.handleLogout = function () {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = "index.html";
    };

    global.toggleSidebar = function () {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    };

    global.closeSidebar = function () {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    };

    global.toggleNotification = function (e) {
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

    document.addEventListener("DOMContentLoaded", function () {
        loadDashboard();
        renderUserUI();
    });
})(window);
