// ====================== MOCK DATA ======================
const services = [
    { id: 1, title: 'Wedding', subtitle: 'Luxurious, classy', image: 'assets/image/home/service/wedding.jpg' },
    { id: 2, title: 'Spa', subtitle: 'Relieve stress and fatigue', image: 'assets/image/home/service/spa.jpg' },
    { id: 3, title: 'Cuisine', subtitle: 'Exquisite culinary creations', image: 'assets/image/home/service/restaurant.jpg' }
];

const villas = [
    { id: 1, name: 'DELUXE BALCONY', clan: 'Khon-Jorn', image: 'assets/image/home/villa/villa1.jpg' },
    { id: 2, name: 'CLAY POOL COTTAGES', clan: 'Pa-Ta-Pea', image: 'assets/image/home/villa/villa2.jpg' },
    { id: 3, name: 'PREMIUM SUITE', clan: 'Khon-Jorn', image: 'assets/image/home/villa/villa3.jpg' },
    { id: 4, name: 'GARDEN VILLA', clan: 'Pa-Ta-Pea', image: 'assets/image/home/villa/villa4.jpg' }
];

const offers = [
    { id: 1, title: 'Happy Hour', category: 'spa', image: 'assets/image/home/offer/offer1.jpg', description: 'Rejuvenate your beauty with our premium treatment packages!' },
    { id: 2, title: 'Relaxation', category: 'spa', image: 'assets/image/home/offer/offer2.jpg', description: 'Enjoy relaxing and restorative treatments at SOT Spa.' },
    { id: 3, title: '20% Seafood Discount', category: 'dine', image: 'assets/image/home/offer/offer3.jpg', description: 'Special package for premium seafood buffet on weekends.' },
    { id: 4, title: 'Full Energy Stay', category: 'stay', image: 'assets/image/home/offer/offer4.jpg', description: 'Experience truly unforgettable romantic moments.' }
];

const galleryImages = [
    'assets/image/home/moment/moment1.jpg',
    'assets/image/home/moment/moment2.jpg',
    'assets/image/home/moment/moment3.jpg',
    'assets/image/home/moment/moment4.jpg',
    'assets/image/home/moment/moment5.jpg',
    'assets/image/home/moment/moment6.jpg'
];

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

// ====================== RENDER FUNCTIONS ======================
function renderServices() {
    const container = document.getElementById('services-container');
    if (!container) return;
    container.innerHTML = services.map(s => `
        <div class="service-card">
            <img src="${s.image}" alt="${s.title}">
            <h3>${s.title}</h3>
            <p>${s.subtitle}</p>
        </div>
    `).join('');
}

let villaIndex = 0;
function renderVillas() {
    const container = document.getElementById('villa-container');
    if (!container) return;

    const displayVillas = [];
    for (let i = 0; i < 3; i++) {
        displayVillas.push(villas[(villaIndex + i) % villas.length]);
    }

    container.innerHTML = displayVillas.map(v => `
        <div class="villa-card">
            <img src="${v.image}" alt="${v.name}">
            <div class="villa-info">
                <h3>${v.name}</h3>
                <p style="color: #C9A050">${v.clan}</p>
            </div>
        </div>
    `).join('');
}

function moveVilla(step) {
    villaIndex = (villaIndex + step + villas.length) % villas.length;
    renderVillas();
}

function renderOffers(category = 'all') {
    const container = document.getElementById('offers-container');
    if (!container) return;

    const filtered = category === 'all'
        ? offers
        : offers.filter(o => o.category === category);

    container.innerHTML = filtered.map(o => `
        <div class="offer-card">
            <img src="${o.image}" alt="${o.title}">
            <div class="content">
                <h3>${o.title}</h3>
                <p>${o.description}</p>
            </div>
        </div>
    `).join('');
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = galleryImages.map(img => `
        <div class="gallery-item">
            <img src="${img}" alt="Gallery">
        </div>
    `).join('');
}

// ====================== MODALS ======================
let loginModal, registerModal;

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
        if (window.UserApi && typeof window.UserApi.getUsers === 'function') {
            const users = await window.UserApi.getUsers();
            const matched = users.find(u => u.email === email && u.password === password);

            if (!matched) throw new Error('Invalid email or password');
            if (matched.status === "BANNED") throw new Error('Your account is banned');

            if (window.AuthStore && typeof window.AuthStore.setCurrentUser === 'function') {
                window.AuthStore.setCurrentUser(matched);
            } else {
                localStorage.setItem('sotCurrentUser', JSON.stringify(matched));
            }

            msg.textContent = `Welcome back, ${matched.fullName || matched.name}!`;
            msg.className = 'form-message success';

            setTimeout(() => {
                window.location.href = matched.role === "ADMIN" ? "admin-dashboard.html" : "dashboard.html";
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
        msg.textContent = err.message || 'Login failed. Please try again.';
        msg.className = 'form-message error';
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== REGISTER HANDLER ======================
async function handleRegister(e) {
    e.preventDefault();

    const btn = document.getElementById('registerBtn');
    const msg = document.getElementById('registerMessage');

    if (!validateRegisterForm()) {
        msg.textContent = 'Please check your information again';
        msg.className = 'form-message error';
        return;
    }

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
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// ====================== NAV USER ======================
function checkExistingUser() {
    let user = null;

    if (window.AuthStore && typeof window.AuthStore.getCurrentUser === 'function') {
        user = window.AuthStore.getCurrentUser();
    } else {
        user = JSON.parse(localStorage.getItem('sotCurrentUser'));
    }

    const navActions = document.getElementById('nav-actions');
    if (!navActions || !user) return;

    navActions.innerHTML = `
    <div class="user-dropdown">
        <div class="user-avatar" onclick="toggleUserMenu()">
            <img src="assets/image/logo.svg" alt="avatar">
        </div>

        <div class="user-menu" id="userMenu">
            <div class="menu-header">
                <img src="assets/image/logo.svg" class="menu-logo">
                <div class="menu-brand">SOT</div>
                <div class="menu-avatar"><i class="fas fa-user"></i></div>
                <div class="menu-username">${user.fullName || user.name || 'User'}</div>
            </div>
            
            <a href="account.html" class="menu-item">Profile</a>
            <a href="dashboard.html" class="menu-item">Dashboard</a>
            <a href="rooms.html" class="menu-item">Rooms</a>
            <a href="bookings.html" class="menu-item">Bookings</a>

            <button class="menu-item logout" onclick="logoutUser()">Logout</button>
        </div>
    </div>
`;
}

function toggleUserMenu() {
    const menu = document.getElementById("userMenu");
    if (menu) menu.classList.toggle("active");
}

document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".user-dropdown");
    if (!dropdown) return;
    if (!dropdown.contains(e.target)) {
        const menu = document.getElementById("userMenu");
        if (menu) menu.classList.remove("active");
    }
});

function logoutUser() {
    if (window.AuthStore && typeof window.AuthStore.clearCurrentUser === 'function') {
        window.AuthStore.clearCurrentUser();
    } else {
        localStorage.removeItem('sotCurrentUser');
    }
    location.reload();
}

// ====================== INITIALIZATION ======================
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo modal elements
    initModals();

    // Render nội dung trang
    renderServices();
    renderVillas();
    renderOffers('all');
    renderGallery();

    // Scroll header effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Subscription Successful! Thank you for joining us.');
            e.target.reset();
        });
    }

    // Offer Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderOffers(e.target.dataset.category);
        });
    });

    // Expose functions ra global
    window.openLoginModal = openLoginModal;
    window.openRegisterModal = openRegisterModal;
    window.closeLoginModal = closeLoginModal;
    window.closeRegisterModal = closeRegisterModal;
    window.switchToRegister = switchToRegister;
    window.switchToLogin = switchToLogin;
    window.logoutUser = logoutUser;

    // Form submit
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Check user đã đăng nhập
    checkExistingUser();

    // Đóng modal khi click backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeLoginModal();
            closeRegisterModal();
        });
    });
});