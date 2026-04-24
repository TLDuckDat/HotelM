const offers = [
    {
        id: 1, category: 'stay',
        title: 'Wake up full of energy - Open the door to the clouds',
        image: 'assets/image/offer/clouds.jpg',
        description: 'Experience truly unforgettable romantic moments with your special someone at SOT.',
        inclusions: [
            'One night stay for 2 people at 1 bedroom Villages.',
            'Complimentary welcome fresh fruit in the room upon check-in.',
            'Complimentary buffet breakfast at the hotel restaurant.',
            'Get 1 voucher for Red Dao leaf bath (20 minutes) at Spa',
            'Complimentary evening bed embellishment service with fresh flowers and chocolates',
            'Complimentary 2 bottles of purified water in the room per day.',
            '10% discount on a la carte menu prices at the restaurant',
            '20% off when using services at Spa'
        ],
        rate: 'For only 4,000,000 VND/2 people',
        conditions: ['The program is valid until December 31, 2025', 'Price includes 5% service charge and 10% VAT', 'Weekend surcharge 200,000 VND/room (Friday and Saturday)', 'Surcharge on public holidays 500,000 VND/room']
    },
    {
        id: 2, category: 'stay',
        title: 'Summer promotion',
        image: 'assets/image/offer/summer.jpg',
        description: 'Coming to SOT, enjoy a wonderful vacation with interesting experiences and extremely attractive incentives.',
        inclusions: [
            'Receive 20% discount voucher for food service at hotel restaurant',
            '50% discount for late check-out.',
            'Customers staying 02 consecutive nights: Free 01 local beer or 01 softdrink.',
            'Guests staying 03 consecutive nights or more: 01 free set of laundry/day',
            'Customers staying 05 consecutive nights or more get one-way airport transfer free',
            'Free room upgrade for guests in case the room is available.'
        ],
        rate: 'From 1,150,000 VND/night',
        conditions: ['The promotion is valid from April 1, 2024 to September 30, 2025.', 'Please contact us for more information']
    },
    {
        id: 3, category: 'spa',
        title: 'Happy Hour',
        image: 'assets/image/offer/happy hour.jpg',
        description: 'Rejuvenate your beauty with our premium treatment packages!',
        inclusions: ['Enjoy a 60-minute facial and 30-minute back relaxation treatment.', 'Promotion applies every day from 10:00 am to 2:00 pm.'],
        rate: 'Price from VND 1,200,000++/person.',
        conditions: ['The above offers apply from now until January 31, 2025.', 'Not applicable at the same time and with other offers/promotions.', 'Retreat Week promotion applies to single treatments.']
    },
    {
        id: 4, category: 'spa',
        title: 'Relaxation',
        image: 'assets/image/offer/relaxtion.jpg',
        description: 'Enjoy relaxing and restorative treatments just for you at SOT Spa.',
        inclusions: ['Enjoy 30 minutes of Indian head relaxation and 45 minutes of back stress relief massage.', 'Promotion applies every day from 10:00 am to 8:00 pm.'],
        rate: 'Price from VND 950,000++/person.',
        conditions: ['The above offers apply from now until January 31, 2025.', 'Not applicable at the same time and with other offers/promotions.']
    },
    {
        id: 5, category: 'dine',
        title: '20% discount on premium seafood buffet on weekends',
        image: 'assets/image/offer/buffet.jpg',
        description: 'SOT offers a special package with a 20% discount for premium seafood buffet on the weekend.',
        inclusions: ['Buffet + soft drinks & juice'],
        rate: 'Original price: 969,000++ VND/person — 20% discount price: 775,000++ VND/person',
        conditions: ['For children from 1m - 1m3: 50% of adult price', 'Contact us to book every Friday and Saturday.']
    }
];

let activeFilter = 'all';

function renderOffers(category) {
    const container = document.getElementById('offers-container');
    const filtered = category === 'all' ? offers : offers.filter(o => o.category === category);

    container.innerHTML = filtered.map((o, idx) => `
        <div class="offer-card">
            <div class="card-image">
                <img src="${o.image}" alt="${o.title}">
                <span class="badge">${o.category}</span>
            </div>
            <div class="card-content">
                <h3>${o.title}</h3>
                <p class="desc">${o.description}</p>
                <ul class="inclusions">
                    ${o.inclusions.map(i => `<li>${i}</li>`).join('')}
                </ul>
                <div class="expandable">
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        Rates <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content"><p>${o.rate}</p></div>
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        Conditions <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content">
                        <ul>${o.conditions.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                </div>
                <button class="btn-book-offer">BOOK NOW</button>
            </div>
        </div>
    `).join('');
}

function toggleExpand(btn) {
    btn.classList.toggle('open');
    const content = btn.nextElementSibling;
    content.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    renderOffers('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderOffers(e.target.dataset.category);
        });
    });

    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    document.getElementById('newsletter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Subscription Successful! Thank you for joining us.');
        e.target.reset();
    });
});
