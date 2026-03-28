// Mock Data from your React files
const services = [
    { id: 1, title: 'Wedding', subtitle: 'Luxurious, classy', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800' },
    { id: 2, title: 'Spa', subtitle: 'Relieve stress and fatigue', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800' },
    { id: 3, title: 'Cuisine', subtitle: 'Exquisite culinary creations', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' }
];

const villas = [
    { id: 1, name: 'DELUXE BALCONY', clan: 'Khon-Jorn', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
    { id: 2, name: 'CLAY POOL COTTAGES', clan: 'Pa-Ta-Pea', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    { id: 3, name: 'PREMIUM SUITE', clan: 'Khon-Jorn', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },
    { id: 4, name: 'GARDEN VILLA', clan: 'Pa-Ta-Pea', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800' }
];

const offers = [
    { id: 1, title: 'Happy Hour', category: 'spa', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', description: 'Rejuvenate your beauty with our premium treatment packages!' },
    { id: 2, title: 'Relaxation', category: 'spa', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', description: 'Enjoy relaxing and restorative treatments at Rosalia Spa.' },
    { id: 3, title: '20% Seafood Discount', category: 'dine', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', description: 'Special package for premium seafood buffet on weekends.' },
    { id: 4, title: 'Full Energy Stay', category: 'stay', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', description: 'Experience truly unforgettable romantic moments.' }
];

const galleryImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    renderVillas();
    renderOffers('all');
    renderGallery();

    // Scroll Header Effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Newsletter Logic
    document.getElementById('newsletter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Subscription Successful! Thank you for joining us.');
        e.target.reset();
    });

    // Offer Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderOffers(e.target.dataset.category);
        });
    });
});

// --- Render Functions ---
function renderServices() {
    const container = document.getElementById('services-container');
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
    const displayVillas = [];
    for(let i=0; i<3; i++) {
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

function renderOffers(category) {
    const container = document.getElementById('offers-container');
    const filtered = category === 'all' ? offers : offers.filter(o => o.category === category);
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
    container.innerHTML = galleryImages.map(img => `
        <div class="gallery-item">
            <img src="${img}" alt="Gallery">
        </div>
    `).join('');
}