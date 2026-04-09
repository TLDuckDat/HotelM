(function (global) {
    "use strict";

    function setMessage(text, type) {
        var el = document.getElementById("contact-message");
        if (!el) return;
        el.className = type || "notice";
        el.textContent = text;
    }

    function submitContact(event) {
        event.preventDefault();

        var name = document.getElementById("contact-name").value.trim();
        var email = document.getElementById("contact-email").value.trim();
        var content = document.getElementById("contact-content").value.trim();
        var user = global.AuthStore ? global.AuthStore.getCurrentUser() : null;

        if (!name || !email || !content) {
            setMessage("Please fill all fields.", "error");
            return;
        }

        setMessage("Submitting contact request...", "notice");

        var payload = {
            name: name,
            email: email,
            content: content,
            userId: user && user.userID ? user.userID : null
        };

        global.ContactApi.createContact(payload)
            .then(function () {
                setMessage("Contact request sent successfully.", "success");
                document.getElementById("contact-form").reset();
            })
            .catch(function (err) {
                var msg = err && err.payload
                    ? (err.payload.message || err.payload.error || "Cannot submit contact request")
                    : "Cannot submit contact request";
                setMessage(msg, "error");
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("contact-form");
        if (!form) return;
        form.addEventListener("submit", submitContact);
    });
})(window);
