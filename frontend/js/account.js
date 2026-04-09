// (function (global) {
//     "use strict";

//     function renderProfile() {
//         if (!global.Guard.requireLogin()) {
//             return;
//         }

//         global.AppShell.renderTopbar("Account");

//         var user = global.AuthStore.getCurrentUser();
//         document.getElementById("profile-name").textContent = user.fullName || "";
//         document.getElementById("profile-email").textContent = user.email || "";
//         document.getElementById("profile-phone").textContent = user.phoneNumber || "";
//         document.getElementById("profile-role").textContent = user.role || "";
//     }

//     document.addEventListener("DOMContentLoaded", renderProfile);
// })(window);

(function (global) {
    "use strict";

    function loadProfile() {
        if (!global.Guard.requireLogin()) return;

        const user = global.AuthStore.getCurrentUser();
        if (!user) return;

        document.getElementById('topbar-username').textContent = user.fullName || 'Guest';
        document.getElementById('sidebar-username').textContent = user.fullName || 'Guest';
        document.getElementById('sidebar-role').textContent = user.role || 'USER';

        document.getElementById('profile-name').textContent = user.fullName || '';
        document.getElementById('profile-email').textContent = user.email || '';
        document.getElementById('profile-phone').textContent = user.phoneNumber || '';
        document.getElementById('profile-role').textContent = user.role || '';
    }

    function handleLogout() {
        if (global.AuthStore) global.AuthStore.clearCurrentUser();
        window.location.href = 'login.html';
    }

    // Sidebar mobile
    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    };

    window.closeSidebar = function () {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadProfile();
    });

    global.AccountPage = { handleLogout };

})(window);