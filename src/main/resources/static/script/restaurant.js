const restaurantImages = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800'
];

const barImages = [
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800'
];

const carousels = {
    restaurant: { images: restaurantImages, current: 0 },
    bar: { images: barImages, current: 0 }
};

function renderCarousel(name) {
    const data = carousels[name];
    const img = document.getElementById(name + '-img');
    const dotsContainer = document.getElementById(name + '-dots');

    img.src = data.images[data.current];

    dotsContainer.innerHTML = data.images.map((_, i) =>
        '<button class="dot' + (i === data.current ? ' active' : '') + '" onclick="goToSlide(\'' + name + '\',' + i + ')"></button>'
    ).join('');
}

function carouselNext(name) {
    const data = carousels[name];
    data.current = (data.current + 1) % data.images.length;
    renderCarousel(name);
}

function carouselPrev(name) {
    const data = carousels[name];
    data.current = (data.current - 1 + data.images.length) % data.images.length;
    renderCarousel(name);
}

function goToSlide(name, index) {
    carousels[name].current = index;
    renderCarousel(name);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCarousel('restaurant');
    renderCarousel('bar');

    // Scroll header effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Newsletter
    document.getElementById('newsletter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Subscription Successful! Thank you for joining us.');
        e.target.reset();
    });
});
