const REGISTER_BASE_URL = "";
let registerResendTimer = null;

// ====================== REGISTER VALIDATION ======================
function validateRegisterForm() {
    let valid = true;

    const fields = [
        { id: "registerName",     check: v => v.trim().length > 0 },
        { id: "registerEmail",    check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: "registerPhone",    check: v => v.trim().length >= 9 },
        { id: "registerPassword", check: v => v.length >= 6 },
    ];

    fields.forEach(({ id, check }) => {
        const input = document.getElementById(id);
        if (!input) return;
        const ok = check(input.value);
        input.classList.toggle("error-field", !ok);
        if (!ok) valid = false;
    });

    return valid;
}

// ====================== MODALS ======================
let loginModal, registerModal;
let homeRegisterSubmitInFlight = false;

function initModals() {
    loginModal    = document.getElementById('loginModal');
    registerModal = document.getElementById('registerModal');
}

function openLoginModal() {
    closeRegisterModal();
    if (loginModal) loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openRegisterModal() {
    closeLoginModal();
    // Reset về bước 1 mỗi lần mở
    _showRegisterStep(1);
    if (registerModal) registerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    if (loginModal) loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeRegisterModal() {
    if (registerModal) registerModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    // Reset về bước 1 khi đóng
    _showRegisterStep(1);
    if (registerResendTimer) clearInterval(registerResendTimer);
}

function switchToRegister(e) {
    if (e) e.preventDefault();
    closeLoginModal();
    setTimeout(openRegisterModal, 300);
}

function switchToLogin(e) {
    if (e) e.preventDefault();
    closeRegisterModal();
    setTimeout(openLoginModal, 300);
}

// Helper ẩn/hiện bước
function _showRegisterStep(step) {
    const stepInfo = document.getElementById('register-step-info');
    const stepOtp  = document.getElementById('register-step-otp');
    const msg      = document.getElementById('registerMessage');
    if (stepInfo) stepInfo.style.display = step === 1 ? 'block' : 'none';
    if (stepOtp)  stepOtp.style.display  = step === 2 ? 'block' : 'none';
    if (msg)      msg.textContent = '';
}

// Helper đếm ngược nút Resend
function _startRegisterResendCountdown(seconds) {
    const link      = document.getElementById('register-resend-link');
    const countdown = document.getElementById('register-resend-countdown');
    if (registerResendTimer) clearInterval(registerResendTimer);

    if (link)      link.style.display = 'none';
    let remain = seconds;
    if (countdown) countdown.textContent = ' (' + remain + 's)';

    registerResendTimer = setInterval(() => {
        remain--;
        if (countdown) countdown.textContent = ' (' + remain + 's)';
        if (remain <= 0) {
            clearInterval(registerResendTimer);
            if (countdown) countdown.textContent = '';
            if (link)      link.style.display = 'inline';
        }
    }, 1000);
}

// ====================== LOGIN HANDLER ======================
async function handleLogin(e) {
    e.preventDefault();

    const btn      = document.getElementById('loginBtn');
    const msg      = document.getElementById('loginMessage');
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        msg.textContent = 'Please enter email and password';
        msg.className = 'form-message error';
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;
    msg.textContent = '';

    try {
        if (window.HotelMApiBase && window.UserApi && typeof window.UserApi.getUserById === 'function') {
            const auth    = await window.HotelMApiBase.post('/auth/login', { email, password });
            window.HotelMApiBase.setAuthToken(auth.accessToken);
            const profile = await window.UserApi.getUserById(auth.userId);

            if (profile.status === 'BANNED') {
                window.HotelMApiBase.clearAuthToken();
                throw new Error('Your account is banned');
            }

            const stored = { ...profile, accessToken: auth.accessToken };

            if (window.AuthStore && typeof window.AuthStore.setCurrentUser === 'function') {
                window.AuthStore.setCurrentUser(stored);
            } else {
                localStorage.setItem('sotCurrentUser', JSON.stringify(stored));
            }

            msg.textContent = `Welcome back, ${profile.fullName || profile.name}!`;
            msg.className = 'form-message success';

            setTimeout(() => {
                window.location.href = profile.role === 'ADMIN' ? 'admin-dashboard.html' : 'account.html';
            }, 800);

        } else {
            // Fallback mock
            const users = JSON.parse(localStorage.getItem('sotUsers') || '[]');
            const user  = users.find(u => u.email === email);
            if (!user) throw new Error('User not found. Please register first.');

            localStorage.setItem('sotCurrentUser', JSON.stringify(user));
            msg.textContent = `Welcome back, ${user.name || user.fullName}!`;
            msg.className = 'form-message success';
            setTimeout(() => location.reload(), 1000);
        }

    } catch (err) {
        if (window.HotelMApiBase && err && err.status != null) {
            window.HotelMApiBase.clearAuthToken();
        }
        let text = 'Login failed. Please try again.';
        if (err && err.status === 401)                    text = 'Invalid email or password';
        else if (err && err.payload && err.payload.message) text = err.payload.message;
        else if (err && err.message)                        text = err.message;

        msg.textContent = text;
        msg.className = 'form-message error';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== REGISTER HANDLER (BƯỚC 1 — GỬI OTP) ======================
async function handleRegister(e) {
    e.preventDefault();
    if (homeRegisterSubmitInFlight) return;

    const btn = document.getElementById('registerBtn');
    const msg = document.getElementById('registerMessage');

    if (!validateRegisterForm()) {
        msg.textContent = 'Please check your information again';
        msg.className = 'form-message error';
        return;
    }

    homeRegisterSubmitInFlight = true;
    btn.classList.add('loading');
    btn.disabled = true;
    msg.textContent = '';

    const email = document.getElementById('registerEmail').value.trim().toLowerCase();

    try {
        const res  = await fetch(REGISTER_BASE_URL + '/auth/otp/send', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email })
        });
        const data = await res.json();

        if (!res.ok) {
            const errMsg = data.message || data.error || 'Failed to send OTP';
            msg.textContent = '❌ ' + errMsg;
            msg.className = 'form-message error';
            return;
        }

        // Chuyển sang bước 2
        _showRegisterStep(2);
        const emailDisplay = document.getElementById('register-otp-email');
        if (emailDisplay) emailDisplay.textContent = email;
        _startRegisterResendCountdown(60);

        msg.textContent = '✅ OTP sent to your email!';
        msg.className = 'form-message success';

    } catch (err) {
        msg.textContent = '❌ Cannot connect to server. Check backend!';
        msg.className = 'form-message error';
    } finally {
        homeRegisterSubmitInFlight = false;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== BƯỚC 2 — XÁC NHẬN OTP & TẠO TÀI KHOẢN ======================
async function handleRegisterOtpVerify() {
    if (homeRegisterSubmitInFlight) return;

    const btn  = document.getElementById('registerOtpBtn');
    const msg  = document.getElementById('registerMessage');
    const otp  = document.getElementById('registerOtp').value.trim();
    const otpInput = document.getElementById('registerOtp');

    const otpOk = otp.length === 6 && /^\d{6}$/.test(otp);
    otpInput.classList.toggle('error-field', !otpOk);
    if (!otpOk) {
        msg.textContent = 'Please enter a valid 6-digit OTP';
        msg.className = 'form-message error';
        return;
    }

    homeRegisterSubmitInFlight = true;
    btn.classList.add('loading');
    btn.disabled = true;
    msg.textContent = '';

    const email       = document.getElementById('registerEmail').value.trim().toLowerCase();
    const fullName    = document.getElementById('registerName').value.trim();
    const phoneNumber = document.getElementById('registerPhone').value.trim();
    const password    = document.getElementById('registerPassword').value;

    try {
        const res  = await fetch(REGISTER_BASE_URL + '/auth/otp/verify', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, otp, fullName, password })
        });
        const data = await res.json();

        if (!res.ok) {
            const errMsg = data.message || data.error || 'Invalid OTP';
            otpInput.classList.add('error-field');
            msg.textContent = '❌ ' + errMsg;
            msg.className = 'form-message error';
            return;
        }

        // Cập nhật phoneNumber nếu backend hỗ trợ
        if (data.userId && phoneNumber && data.accessToken) {
            try {
                await fetch(REGISTER_BASE_URL + '/users/' + data.userId, {
                    method:  'PUT',
                    headers: {
                        'Content-Type':  'application/json',
                        'Authorization': 'Bearer ' + data.accessToken
                    },
                    body: JSON.stringify({ fullName, email, phoneNumber, password })
                });
            } catch (_) { /* không chặn flow */ }
        }

        msg.textContent = `✅ Account created! Welcome ${fullName}`;
        msg.className = 'form-message success';

        setTimeout(() => {
            closeRegisterModal();
            openLoginModal();
        }, 1500);

    } catch (err) {
        msg.textContent = '❌ Cannot connect to server. Check backend!';
        msg.className = 'form-message error';
    } finally {
        homeRegisterSubmitInFlight = false;
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== GỬI LẠI OTP ======================
async function handleRegisterResendOtp(e) {
    e.preventDefault();
    const msg   = document.getElementById('registerMessage');
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();

    try {
        const res = await fetch(REGISTER_BASE_URL + '/auth/otp/send', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email })
        });
        if (res.ok) {
            msg.textContent = '✅ OTP resent!';
            msg.className = 'form-message success';
            _startRegisterResendCountdown(60);
        } else {
            msg.textContent = '❌ Failed to resend OTP';
            msg.className = 'form-message error';
        }
    } catch {
        msg.textContent = '❌ Cannot connect to server';
        msg.className = 'form-message error';
    }
}

// ====================== FORGOT PASSWORD ======================
let forgotPasswordModal;

function initForgotPasswordModal() {
    forgotPasswordModal = document.getElementById('forgotPasswordModal');
}

function openForgotPasswordModal() {
    closeLoginModal();
    closeRegisterModal();
    if (forgotPasswordModal) forgotPasswordModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeForgotPasswordModal() {
    if (forgotPasswordModal) forgotPasswordModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switchToForgotPassword(e) {
    if (e) e.preventDefault();
    closeLoginModal();
    setTimeout(openForgotPasswordModal, 300);
}

function switchToLoginFromForgot(e) {
    if (e) e.preventDefault();
    closeForgotPasswordModal();
    setTimeout(openLoginModal, 300);
}

async function handleForgotPassword(e) {
    e.preventDefault();

    const btn        = document.getElementById('forgotBtn');
    const msg        = document.getElementById('forgotMessage');
    const emailInput = document.getElementById('forgotEmail');
    const email      = emailInput.value.trim();

    if (!email) {
        msg.textContent = 'Please enter your email address';
        msg.className = 'form-message error';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Please enter a valid email address';
        msg.className = 'form-message error';
        emailInput.classList.add('error-field');
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;
    msg.textContent = '';

    try {
        await new Promise(resolve => setTimeout(resolve, 1200));

        msg.innerHTML = `✅ <strong>Reset link has been sent!</strong><br>
            Please check your email: <strong>${email}</strong>`;
        msg.className = 'form-message success';

        setTimeout(() => {
            closeForgotPasswordModal();
            setTimeout(openLoginModal, 600);
        }, 4000);

    } catch (err) {
        msg.textContent = 'Something went wrong. Please try again.';
        msg.className = 'form-message error';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Expose globals cần thiết
window.handleRegisterOtpVerify    = handleRegisterOtpVerify;
window.handleRegisterResendOtp    = handleRegisterResendOtp;