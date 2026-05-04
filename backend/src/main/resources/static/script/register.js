let registerSubmitInFlight = false;
let resendTimer = null;
const BASE_URL = "http://localhost:8080";

function showToast(msg, type) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast " + type;
}

function validate() {
    let valid = true;

    const fields = [
        { id: "fullName",    errId: "err-fullName",    check: v => v.trim().length > 0 },
        { id: "email",       errId: "err-email",       check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: "phoneNumber", errId: "err-phoneNumber", check: v => v.trim().length >= 9 },
        { id: "password",    errId: "err-password",    check: v => v.length >= 6 },
    ];

    fields.forEach(({ id, errId, check }) => {
        const input = document.getElementById(id);
        const err   = document.getElementById(errId);
        const ok    = check(input.value);
        input.classList.toggle("error-field", !ok);
        err.classList.toggle("show", !ok);
        if (!ok) valid = false;
    });

    return valid;
}

//Gui OTP (dùng mail của ng deptrais1tg gửi đến ng dùng)
async function submitForm() {
    if (registerSubmitInFlight) return;
    if (!validate()) return;

    registerSubmitInFlight = true;

    const btn = document.getElementById("submitBtn");
    btn.classList.add("loading");
    btn.disabled = true;

    const email = document.getElementById("email").value.trim().toLowerCase();

    try {
        const res = await fetch(BASE_URL + "/auth/otp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            const msg = data.message || data.error || "Gửi OTP thất bại";
            showToast("❌ " + msg, "error");
            return;
        }

        document.getElementById("step-info").style.display = "none";
        document.getElementById("step-otp").style.display  = "block";
        document.getElementById("otp-email-display").textContent = email;
        startResendCountdown(60);
        showToast("✅ Mã OTP đã được gửi đến email của bạn!", "success");

    } catch (e) {
        showToast("❌ Không kết nối được server. Kiểm tra backend!", "error");
    } finally {
        registerSubmitInFlight = false;
        btn.classList.remove("loading");
        btn.disabled = false;
    }
}


async function verifyOtp() {
    if (registerSubmitInFlight) return;

    const otp = document.getElementById("otpInput").value.trim();
    const errOtp = document.getElementById("err-otp");
    const otpInput = document.getElementById("otpInput");

    const otpOk = otp.length === 6 && /^\d{6}$/.test(otp);
    otpInput.classList.toggle("error-field", !otpOk);
    errOtp.classList.toggle("show", !otpOk);
    if (!otpOk) return;

    registerSubmitInFlight = true;

    const btnVerify = document.getElementById("btnVerify");
    btnVerify.classList.add("loading");
    btnVerify.disabled = true;

    const email       = document.getElementById("email").value.trim().toLowerCase();
    const fullName    = document.getElementById("fullName").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password    = document.getElementById("password").value;

    try {
        const res = await fetch(BASE_URL + "/auth/otp/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, fullName, password })
        });

        const data = await res.json();

        if (!res.ok) {
            const msg = data.message || data.error || "OTP không hợp lệ";
            errOtp.textContent = msg;
            otpInput.classList.add("error-field");
            errOtp.classList.add("show");
            showToast("❌ " + msg, "error");
            return;
        }


        if (data.userId && phoneNumber) {
            try {
                await fetch(BASE_URL + "/users/" + data.userId, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + data.accessToken
                    },
                    body: JSON.stringify({ fullName, email, phoneNumber, password })
                });
            } catch (_) { /* không chặn flow nếu update thất bại */ }
        }

        // Lưu
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("currentUser", JSON.stringify({
                userId:   data.userId,
                email:    data.email,
                role:     "USER",
                fullName: fullName
            }));
        }

        showToast("✅ Đăng ký thành công! Đang chuyển hướng...", "success");
        document.querySelectorAll("input").forEach(i => i.value = "");
        setTimeout(() => { window.location.href = "login.html"; }, 1500);

    } catch (e) {
        showToast("❌ Không kết nối được server. Kiểm tra backend!", "error");
    } finally {
        registerSubmitInFlight = false;
        btnVerify.classList.remove("loading");
        btnVerify.disabled = false;
    }
}

async function resendOtp(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    try {
        const res = await fetch(BASE_URL + "/auth/otp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (res.ok) {
            showToast("✅ Đã gửi lại OTP!", "success");
            startResendCountdown(60);
        } else {
            showToast("❌ Gửi lại OTP thất bại", "error");
        }
    } catch {
        showToast("❌ Không kết nối được server", "error");
    }
}


function startResendCountdown(seconds) {
    const link      = document.getElementById("resend-link");
    const countdown = document.getElementById("resend-countdown");
    if (resendTimer) clearInterval(resendTimer);

    link.style.display = "none";
    let remain = seconds;
    countdown.textContent = " (" + remain + "s)";

    resendTimer = setInterval(() => {
        remain--;
        countdown.textContent = " (" + remain + "s)";
        if (remain <= 0) {
            clearInterval(resendTimer);
            countdown.textContent = "";
            link.style.display = "inline";
        }
    }, 1000);
}


window.submitForm = submitForm;
window.verifyOtp  = verifyOtp;
window.resendOtp  = resendOtp;


document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.repeat || registerSubmitInFlight) return;
    const el = e.target;
    if (!el || el.tagName !== "INPUT") return;

    const stepOtp = document.getElementById("step-otp");
    if (stepOtp && stepOtp.style.display !== "none" && el.id === "otpInput") {
        e.preventDefault();
        verifyOtp();
        return;
    }


    const card = document.querySelector(".card");
    if (!card || !card.contains(el)) return;
    e.preventDefault();
    submitForm();
});