const restaurantImages = [
    'assets/image/restaurant/restaurant/banner1.jpg',
    'assets/image/restaurant/restaurant/banner2.jpg',
    'assets/image/restaurant/restaurant/banner3.jpg',
    'assets/image/restaurant/restaurant/banner4.jpg',
    'assets/image/restaurant/restaurant/banner5.jpg',
    'assets/image/restaurant/restaurant/banner6.jpg'
];

const barImages = [
    'assets/image/restaurant/bar/banner1.jpg',
    'assets/image/restaurant/bar/banner2.jpg',
    'assets/image/restaurant/bar/banner3.jpg',
    'assets/image/restaurant/bar/banner4.jpg',
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
