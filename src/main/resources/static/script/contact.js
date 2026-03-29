(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("contact-form");
        var message = document.getElementById("contact-message");

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            message.className = "success";
            message.textContent = "Contact request saved on frontend. Backend contact API is not available yet.";
        });
    });
})();

