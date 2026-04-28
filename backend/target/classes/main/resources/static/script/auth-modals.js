// ====================== REGISTER VALIDATION ======================
function validateRegisterForm() {
    let valid = true;

    const fields = [
        { id: "registerName", check: v => v.trim().length > 0 },
        { id: "registerEmail", check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: "registerPhone", check: v => v.trim().length >= 9 },
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
    loginModal = document.getElementById('loginModal');
    registerModal = document.getElementById('registerModal');
}

function openLoginModal() {
    closeRegisterModal();
    if (loginModal) loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openRegisterModal() {
    closeLoginModal();
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

// ====================== LOGIN HANDLER ======================
async function handleLogin(e) {
    e.preventDefault();

    const btn = document.getElementById('loginBtn');
    const msg = document.getElementById('loginMessage');
    const email = document.getElementById('loginEmail').value.trim();
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
            const auth = await window.HotelMApiBase.post('/auth/login', { email, password });
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
            const user = users.find(u => u.email === email);
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
        if (err && err.status === 401) {
            text = 'Invalid email or password';
        } else if (err && err.payload && err.payload.message) {
            text = err.payload.message;
        } else if (err && err.message) {
            text = err.message;
        }
        msg.textContent = text;
        msg.className = 'form-message error';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== REGISTER HANDLER ======================
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

    const payload = {
        fullName: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        phoneNumber: document.getElementById('registerPhone').value.trim(),
        password: document.getElementById('registerPassword').value,
        role: "USER"
    };

    try {
        if (window.UserApi && typeof window.UserApi.createUser === 'function') {
            const data = await window.UserApi.createUser(payload);

            msg.textContent = `Account created successfully! Welcome ${data.fullName || data.name}`;
            msg.className = 'form-message success';

            setTimeout(() => {
                closeRegisterModal();
                openLoginModal();
            }, 1500);

        } else {
            // Fallback mock
            let users = JSON.parse(localStorage.getItem('sotUsers') || '[]');
            users.push({ ...payload, name: payload.fullName });
            localStorage.setItem('sotUsers', JSON.stringify(users));

            msg.textContent = 'Account created successfully!';
            msg.className = 'form-message success';

            setTimeout(() => {
                closeRegisterModal();
                openLoginModal();
            }, 1200);
        }

    } catch (err) {
        const errorMsg = err?.payload?.message || err?.message || 'Cannot connect to server';
        msg.textContent = '❌ ' + errorMsg;
        msg.className = 'form-message error';
    } finally {
        homeRegisterSubmitInFlight = false;
        btn.classList.remove('loading');
        btn.disabled = false;
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

// Xử lý Forgot Password (tĩnh - chỉ giả lập)
async function handleForgotPassword(e) {
    e.preventDefault();

    const btn = document.getElementById('forgotBtn');
    const msg = document.getElementById('forgotMessage');
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput.value.trim();

    if (!email) {
        msg.textContent = 'Please enter your email address';
        msg.className = 'form-message error';
        return;
    }

    // Kiểm tra email có định dạng hợp lệ không
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Please enter a valid email address';
        msg.className = 'form-message error';
        emailInput.classList.add('error-field');
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;
    msg.textContent = '';

    // Giả lập gửi email (tĩnh)
    try {
        // Giả lập delay như đang gửi email thật
        await new Promise(resolve => setTimeout(resolve, 1200));

        msg.innerHTML = `
            ✅ <strong>Reset link has been sent!</strong><br>
            Please check your email: <strong>${email}</strong><br>
        `;
        msg.className = 'form-message success';

        // Tự động đóng modal sau 4 giây
        setTimeout(() => {
            closeForgotPasswordModal();
            // Mở lại login modal
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