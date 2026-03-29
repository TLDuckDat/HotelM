(function (global) {
    "use strict";

    function setMessage(text, type) {
        var box = document.getElementById("message");
        if (!box) {
            return;
        }

        box.className = type || "notice";
        box.textContent = text;
    }

    function onSubmit(event) {
        event.preventDefault();

        var email = document.getElementById("email").value.trim();
        var password = document.getElementById("password").value;

        setMessage("Checking account...", "notice");

        global.UserApi.getUsers()
            .then(function (users) {
                var matched = (users || []).find(function (item) {
                    return item.email === email && item.password === password;
                });

                if (!matched) {
                    setMessage("Invalid email or password", "error");
                    return;
                }

                if (matched.status && matched.status === "BANNED") {
                    setMessage("Your account is banned", "error");
                    return;
                }

                global.AuthStore.setCurrentUser(matched);
                setMessage("Login success", "success");

                if (matched.role === "ADMIN") {
                    window.location.href = "/admin-dashboard.html";
                    return;
                }

                window.location.href = "/dashboard.html";
            })
            .catch(function (error) {
                var msg = error && error.payload && error.payload.message
                    ? error.payload.message
                    : "Cannot connect to backend";
                setMessage(msg, "error");
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("login-form");
        if (form) {
            form.addEventListener("submit", onSubmit);
        }
    });
})(window);

