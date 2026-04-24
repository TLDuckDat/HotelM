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

        if (!global.HotelMApiBase || !global.UserApi) {
            setMessage("API scripts not loaded", "error");
            return;
        }

        global.HotelMApiBase.post("/auth/login", { email: email, password: password })
            .then(function (auth) {
                global.HotelMApiBase.setAuthToken(auth.accessToken);
                return global.UserApi.getUserById(auth.userId).then(function (profile) {
                    return { auth: auth, profile: profile };
                });
            })
            .then(function (result) {
                var profile = result.profile;
                if (profile.status && profile.status === "BANNED") {
                    global.HotelMApiBase.clearAuthToken();
                    setMessage("Your account is banned", "error");
                    return;
                }

                var stored = Object.assign({}, profile, { accessToken: result.auth.accessToken });
                global.AuthStore.setCurrentUser(stored);
                setMessage("Login success", "success");

                if (profile.role === "ADMIN") {
                    window.location.href = "admin-dashboard.html";
                    return;
                }

                window.location.href = "dashboard.html";
            })
            .catch(function (error) {
                if (global.HotelMApiBase) {
                    global.HotelMApiBase.clearAuthToken();
                }
                var msg = "Cannot connect to backend";
                if (error && error.status === 401) {
                    msg = "Invalid email or password";
                } else if (error && error.payload) {
                    if (typeof error.payload === "string") {
                        msg = error.payload;
                    } else if (error.payload.message) {
                        msg = error.payload.message;
                    }
                }
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

