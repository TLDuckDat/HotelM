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

// Hàm tự động load Modal từ file riêng vào Index
async function loadAuthModals() {
    try {
        const response = await fetch('auth-modals.html');
        const html = await response.text();
        const placeholder = document.getElementById('auth-modals-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;

            // Khởi tạo lại tham chiếu Element (LoginModal, RegisterModal, ForgotPasswordModal)
            if (typeof initModals === 'function') initModals();
            if (typeof initForgotPasswordModal === 'function') initForgotPasswordModal();

            // Gán sự kiện submit cho Form sau khi đã nạp vào DOM
            const lForm = document.getElementById('loginForm');
            const rForm = document.getElementById('registerForm');
            const fForm = document.getElementById('forgotPasswordForm');

            // handleLogin và handleRegister được lấy từ file auth-modals.js
            if (lForm) lForm.addEventListener('submit', handleLogin);
            if (rForm) rForm.addEventListener('submit', handleRegister);
            if (fForm) fForm.addEventListener('submit', handleForgotPassword);

            // Đóng modal khi click ra ngoài (backdrop)
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.addEventListener('click', () => {
                    if (typeof closeLoginModal === 'function') closeLoginModal();
                    if (typeof closeRegisterModal === 'function') closeRegisterModal();
                    if (typeof closeForgotPasswordModal === 'function') closeForgotPasswordModal();
                });
            });
        }
    } catch (error) {
        console.error("Lỗi nạp file auth-modals.html:", error);
    }
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

    // Xác định role để điều hướng link
    const isAdmin = user.role === 'ADMIN';
    
    // Điều hướng Profile/Dashboard
    const profileHref = isAdmin ? 'admin-dashboard.html' : 'account.html';
    const profileLabel = isAdmin ? 'Admin Dashboard' : 'Profile';

    // Điều hướng Rooms và Bookings dựa trên Role
    const roomsHref = isAdmin ? 'admin-rooms.html' : 'rooms.html';
    const bookingsHref = isAdmin ? 'admin-bookings.html' : 'bookings.html';

    navActions.innerHTML = `
    <div class="notification-dropdown">
        <button class="notification-btn" onclick="toggleNotification(event)">
            <i class="fas fa-bell"></i>
            <span class="notification-badge"></span>
        </button>
        <div class="notification-content" id="notificationMenu">
            <div class="notification-header">Notifications</div>
            <div class="notification-list">
                <div class="notification-empty">No new notifications</div>
            </div>
        </div>
    </div>
    
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
            
            <a href="${profileHref}" class="menu-item">${profileLabel}</a>
            <a href="${roomsHref}" class="menu-item">Rooms</a>
            <a href="${bookingsHref}" class="menu-item">Bookings</a>

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

    // chạy modal auth
    loadAuthModals();

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
    window.openForgotPasswordModal = openForgotPasswordModal;
    window.closeForgotPasswordModal = closeForgotPasswordModal;
    window.switchToForgotPassword = switchToForgotPassword;
    window.switchToLoginFromForgot = switchToLoginFromForgot;

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

    // notfication
    window.toggleNotification = function (e) {
        e.stopPropagation();
        const menu = document.getElementById("notificationMenu");
        // Đóng user menu nếu đang mở (để tránh chồng chéo)
        const userMenu = document.getElementById("userMenu");
        if (userMenu) userMenu.classList.remove("active");

        menu.classList.toggle("active");
    };

    // Click ra ngoài để đóng
    document.addEventListener("click", function (e) {
        const notiDropdown = document.querySelector(".notification-dropdown");
        if (notiDropdown && !notiDropdown.contains(e.target)) {
            const menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });
});