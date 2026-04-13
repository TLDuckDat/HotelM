(function (global) {
    "use strict";

    function goToLogin() {
        window.location.href = "index.html";
    }

    function requireLogin() {
        if (!global.AuthStore || !global.AuthStore.isLoggedIn()) {
            goToLogin();
            return false;
        }

        return true;
    }

    function requireAdmin() {
        if (!requireLogin()) {
            return false;
        }

        if (!global.AuthStore.hasRole("ADMIN")) {
            window.location.href = "dashboard.html";
            return false;
        }

        return true;
    }

    global.Guard = {
        requireLogin: requireLogin,
        requireAdmin: requireAdmin
    };
})(window);

