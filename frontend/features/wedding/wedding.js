const weddingImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800',
    'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800'
];

document.addEventListener('DOMContentLoaded', () => {
    // Render gallery
    const gallery = document.getElementById('wedding-gallery');
    gallery.innerHTML = weddingImages.map(img =>
        '<div class="gallery-item"><img src="' + img + '" alt="Wedding"></div>'
    ).join('');

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
