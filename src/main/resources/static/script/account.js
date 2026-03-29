(function (global) {
    "use strict";

    function renderProfile() {
        if (!global.Guard.requireLogin()) {
            return;
        }

        global.AppShell.renderTopbar("Account");

        var user = global.AuthStore.getCurrentUser();
        document.getElementById("profile-name").textContent = user.fullName || "";
        document.getElementById("profile-email").textContent = user.email || "";
        document.getElementById("profile-phone").textContent = user.phoneNumber || "";
        document.getElementById("profile-role").textContent = user.role || "";
    }

    document.addEventListener("DOMContentLoaded", renderProfile);
})(window);

