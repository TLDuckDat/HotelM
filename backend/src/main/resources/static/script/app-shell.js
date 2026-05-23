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

        var lang = (global.getLang && global.getLang()) || "en";
        var L = function (key, fallback) {
            return (global.t && global.t(key, lang)) || fallback;
        };

        host.innerHTML = ""
            + "<div class='topbar'>"
            + "  <div><strong>SOT</strong> — " + title + "</div>"
            + "  <div style='display:flex;align-items:center;flex-wrap:wrap;gap:8px;'>"
            + "    <span class='badge'>" + name + " (" + role + ")</span>"
            + "    <button id='lang-toggle-btn' type='button' onclick='toggleLanguage()'>"
            + "      <span class='lang-flag'>" + (lang === "vi" ? "🇻🇳" : "🇬🇧") + "</span>"
            + "      <span class='lang-label'>" + (lang === "vi" ? "VI" : "EN") + "</span>"
            + "    </button>"
            + "    <a href='index.html'>" + L("nav_home", "Home") + "</a>"
            + "    <a href='dashboard.html'>" + L("sidebar_dashboard", "Dashboard") + "</a>"
            + "    <a href='rooms.html'>" + L("nav_rooms", "Rooms") + "</a>"
            + "    <a href='bookings.html'>" + L("sidebar_bookings", "Bookings") + "</a>"
            + "    <a href='account.html'>" + L("sidebar_account", "Account") + "</a>"
            + "    <button id='logout-btn' type='button'>" + L("sidebar_signout", "Logout") + "</button>"
            + "  </div>"
            + "</div>";

        if (global.updateToggleButton) {
            global.updateToggleButton(lang);
        }

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

