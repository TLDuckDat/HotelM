// ====================== HELPER ======================
function currentLang() {
    return localStorage.getItem('sot_lang') || 'en';
}

// ====================== VILLAS ======================
let villaIndex = 0;

function getVillaData() {
    return Array.from(document.querySelectorAll('#villa-data > div')).map(el => ({
        nameKey: el.dataset.nameKey,   // e.g. "villa_deluxe_balcony"
        clan: el.dataset.clan,
        image: el.dataset.image
    }));
}

function renderVillas() {
    const container = document.getElementById('villa-container');
    if (!container) return;
    const villas = getVillaData();
    if (!villas.length) return;

    const display = [];
    for (let i = 0; i < 3; i++) {
        display.push(villas[(villaIndex + i) % villas.length]);
    }

    // Each name element carries data-i18n so applyTranslations() can swap it.
    // We seed the textContent with the EN value as a visible default.
    container.innerHTML = display.map(v => {
        const enName = (window.TRANSLATIONS && window.TRANSLATIONS.en[v.nameKey]) || v.nameKey;
        return `
        <div class="villa-card">
            <img src="${v.image}" alt="${enName}">
            <div class="villa-info">
                <h3 data-i18n="${v.nameKey}">${enName}</h3>
                <p style="color:#C9A050">${v.clan}</p>
            </div>
        </div>`;
    }).join('');
}

function moveVilla(step) {
    const villas = getVillaData();
    villaIndex = (villaIndex + step + villas.length) % villas.length;
    renderVillas();
    // Re-apply current language to the freshly-rendered nodes
    if (typeof applyTranslations === 'function') applyTranslations(currentLang());
}

// ====================== HOME OFFERS ======================
function getHomeOfferData() {
    return Array.from(document.querySelectorAll('#offer-data > div')).map(el => ({
        id: el.dataset.id,
        category: el.dataset.category,
        titleKey: el.dataset.titleKey,
        descKey: el.dataset.descKey,
        image: el.dataset.image
    }));
}

function renderOffers(category = 'all') {
    const container = document.getElementById('offers-container');
    if (!container) return;

    const offers = getHomeOfferData();
    const en = (window.TRANSLATIONS && window.TRANSLATIONS.en) || {};
    const filtered = category === 'all' ? offers : offers.filter(o => o.category === category);

    // Each h3/p carries data-i18n so the language engine can update them on switch.
    // EN text is seeded as the visible default.
    container.innerHTML = filtered.map(o => `
        <div class="offer-card">
            <img src="${o.image}" alt="${en[o.titleKey] || o.titleKey}">
            <div class="content">
                <h3 data-i18n="${o.titleKey}">${en[o.titleKey] || o.titleKey}</h3>
                <p  data-i18n="${o.descKey}">${en[o.descKey] || o.descKey}</p>
            </div>
        </div>`
    ).join('');
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

    const isAdmin = user.role === 'ADMIN';
    const profileHref = isAdmin ? 'admin-dashboard.html' : 'account.html';
    const profileLabel = isAdmin ? 'Admin Dashboard' : 'Profile';
    const roomsHref = isAdmin ? 'admin-rooms.html' : 'rooms.html';
    const bookingsHref = isAdmin ? 'admin-bookings.html' : 'bookings.html';

    navActions.innerHTML = `
    <button id="lang-toggle-btn" onclick="toggleLanguage()" title="Switch language">
        <span class="lang-flag">🇻🇳</span>
        <span class="lang-label">VI</span>
    </button>

    <div class="notification-dropdown">
        <button class="notification-btn" onclick="toggleNotification(event)">
            <i class="fas fa-bell"></i>
            <span class="notification-badge"></span>
        </button>
        <div class="notification-content" id="notificationMenu">
            <div class="notification-header" data-i18n="notification_title">Notifications</div>
            <div class="notification-list">
                <div class="notification-empty" data-i18n="notification_empty">No new notifications</div>
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
            <a href="${profileHref}" class="menu-item" data-i18n="${isAdmin ? 'menu_dashboard' : 'menu_profile'}">
            ${profileLabel}
        </a>
        <a href="${roomsHref}" class="menu-item" data-i18n="menu_rooms">
            Rooms
        </a>
        <a href="${bookingsHref}" class="menu-item" data-i18n="menu_bookings">
            Bookings
        </a>
        <button class="menu-item logout" onclick="logoutUser()" data-i18n="menu_logout">
            Logout
        </button>
        </div>
    </div>`;

    //Gọi hàm dịch ngay sau khi chèn HTML vào DOM
    if (typeof applyTranslations === 'function') {
        applyTranslations(currentLang());
    }

    // Re-sync language button after nav is re-rendered
    if (typeof updateToggleButton === 'function') updateToggleButton(currentLang());
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', function (e) {
    const dropdown = document.querySelector('.user-dropdown');
    if (!dropdown) return;
    if (!dropdown.contains(e.target)) {
        const menu = document.getElementById('userMenu');
        if (menu) menu.classList.remove('active');
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

// ====================== AUTH MODAL LOADER ======================
async function loadAuthModals() {
    try {
        const response = await fetch('auth-modals.html');
        const html = await response.text();
        const placeholder = document.getElementById('auth-modals-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;

            if (typeof initModals === 'function') initModals();
            if (typeof initForgotPasswordModal === 'function') initForgotPasswordModal();

            const lForm = document.getElementById('loginForm');
            const rForm = document.getElementById('registerForm');
            const fForm = document.getElementById('forgotPasswordForm');

            if (lForm) lForm.addEventListener('submit', handleLogin);
            if (rForm) rForm.addEventListener('submit', handleRegister);
            if (fForm) fForm.addEventListener('submit', handleForgotPassword);

            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.addEventListener('click', () => {
                    if (typeof closeLoginModal === 'function') closeLoginModal();
                    if (typeof closeRegisterModal === 'function') closeRegisterModal();
                    if (typeof closeForgotPasswordModal === 'function') closeForgotPasswordModal();
                });
            });
        }
    } catch (error) {
        console.error('Error loading auth-modals.html:', error);
    }
}

// ====================== INITIALIZATION ======================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initModals === 'function') initModals();

    loadAuthModals();

    // Render dynamic sections (seeds EN text + data-i18n attrs)
    renderVillas();
    renderOffers('all');
    // language.js boot will immediately call applyTranslations() after this,
    // swapping to whatever language is stored.

    // Scroll header effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
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

    // Offer filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderOffers(e.target.dataset.category);
            // Re-apply current language to freshly-rendered cards
            if (typeof applyTranslations === 'function') applyTranslations(currentLang());
        });
    });

    // Expose globals
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

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    checkExistingUser();

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', () => {
            closeLoginModal();
            closeRegisterModal();
        });
    });

    // Notifications
    window.toggleNotification = function (e) {
        e.stopPropagation();
        const menu = document.getElementById('notificationMenu');
        const userMenu = document.getElementById('userMenu');
        if (userMenu) userMenu.classList.remove('active');
        menu.classList.toggle('active');
    };

    document.addEventListener('click', function (e) {
        const notiDropdown = document.querySelector('.notification-dropdown');
        if (notiDropdown && !notiDropdown.contains(e.target)) {
            const menu = document.getElementById('notificationMenu');
            if (menu) menu.classList.remove('active');
        }
    });
});