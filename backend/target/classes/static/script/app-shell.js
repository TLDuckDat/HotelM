(function (global) {
    "use strict";

    function renderTopbar(title) {
        var host = document.getElementById("app-topbar");
        if (!host) {
            return;
        }

        var user = global.AuthStore ? global.AuthStore.getCurrentUser() : null;
        var role = user && user.role ? user.role : "GUEST";
        var name = user && user.fullName ? user.fullName : "Guest";

        host.innerHTML = ""
            + "<div class='topbar'>"
            + "  <div><strong>HotelM</strong> - " + title + "</div>"
            + "  <div>"
            + "    <span class='badge'>" + name + " (" + role + ")</span>"
            + "    <a href='index.html'>Home</a>"
            + "    <a href='dashboard.html'>Dashboard</a>"
            + "    <a href='rooms.html'>Rooms</a>"
            + "    <a href='bookings.html'>Bookings</a>"
            + "    <a href='create-booking.html'>Create Booking</a>"
            + "    <a href='payments.html'>Payments</a>"
            + "    <a href='refunds.html'>Refunds</a>"
            + "    <a href='reviews.html'>Reviews</a>"
            + "    <a href='account.html'>Account</a>"
            + "    <a href='admin-dashboard.html'>Admin</a>"
            + "    <button id='logout-btn' type='button'>Logout</button>"
            + "  </div>"
            + "</div>";

        var logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                if (global.AuthStore) {
                    global.AuthStore.clearCurrentUser();
                }
                window.location.href = "index.html";
            });
        }
    }

    global.AppShell = {
        renderTopbar: renderTopbar
    };

    function highlightSidebar() {
        // Lấy tên file hiện tại, mặc định là admin-dashboard.html nếu đường dẫn trống
        let currentPath = window.location.pathname.split("/").pop();
        if (currentPath === "" || currentPath === "index.html") return; // Không xử lý nếu ở trang chủ khách hàng

        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.classList.remove('active');
            
            const onclickAttr = item.getAttribute('onclick') || "";
            
            // Kiểm tra xem thuộc tính onclick có chứa tên file hiện tại không
            if (onclickAttr.includes(currentPath)) {
                item.classList.add('active');
            }
        });
    }

    // Sử dụng 'DOMContentLoaded' là chuẩn, nhưng hãy đảm bảo class active trong HTML đã được xóa
    document.addEventListener("DOMContentLoaded", highlightSidebar);
})(window);

