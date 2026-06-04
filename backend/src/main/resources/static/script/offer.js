/**
 * offer.js — SOT Resort & Hotel — Offer page
 *
 * Each offer card is defined by a metadata block in #offer-data (HTML).
 * Rendered text nodes use data-i18n so language.js can translate them.
 */

function currentLang() {
    return localStorage.getItem('sot_lang') || 'en';
}

function txt(key) {
    if (typeof window.t === 'function') {
        return window.t(key);
    }
    const dict = (window.TRANSLATIONS && window.TRANSLATIONS[currentLang()])
        || (window.TRANSLATIONS && window.TRANSLATIONS.en)
        || {};
    return dict[key] || key;
}

function applyOfferTranslations() {
    if (typeof applyTranslations === 'function') {
        applyTranslations(currentLang());
    }
}

function getOfferData() {
    return Array.from(document.querySelectorAll('#offer-data > div')).map(el => ({
        id:       el.dataset.id,
        category: el.dataset.category,
        image:    el.dataset.image,
        titleKey: el.dataset.titleKey,
        descKey:  el.dataset.descKey,
        rateKey:  el.dataset.rateKey,
        incKeys:  (el.dataset.incKeys  || '').split(',').map(k => k.trim()).filter(Boolean),
        conKeys:  (el.dataset.conKeys  || '').split(',').map(k => k.trim()).filter(Boolean),
    }));
}

function categoryBadgeLabel(category) {
    const map = {
        stay: 'offer_filter_stay',
        spa: 'offer_filter_spa',
        dine: 'offer_filter_dine',
    };
    return txt(map[category] || category);
}

function renderOffers(category = 'all') {
    const container = document.getElementById('offers-container');
    if (!container) return;

    const offers = getOfferData();
    const filtered = category === 'all' ? offers : offers.filter(o => o.category === category);

    const ratesKey = 'offer_rates_label';
    const condKey  = 'offer_cond_label';
    const bookKey  = 'offer_booknow';

    container.innerHTML = filtered.map(o => {
        const incItems = o.incKeys.map(k =>
            `<li data-i18n="${k}">${txt(k)}</li>`
        ).join('');

        const conItems = o.conKeys.map(k =>
            `<li data-i18n="${k}">${txt(k)}</li>`
        ).join('');

        return `
        <div class="offer-card">
            <div class="card-image">
                <img src="${o.image}" alt="${txt(o.titleKey)}">
                <span class="badge">${categoryBadgeLabel(o.category)}</span>
            </div>
            <div class="card-content">
                <h3 data-i18n="${o.titleKey}">${txt(o.titleKey)}</h3>
                <p class="desc" data-i18n="${o.descKey}">${txt(o.descKey)}</p>
                <ul class="inclusions">${incItems}</ul>
                <div class="expandable">
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        <span data-i18n="${ratesKey}">${txt(ratesKey)}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content">
                        <p data-i18n="${o.rateKey}">${txt(o.rateKey)}</p>
                    </div>
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        <span data-i18n="${condKey}">${txt(condKey)}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content">
                        <ul>${conItems}</ul>
                    </div>
                </div>
                <button class="btn-book-offer" data-i18n="${bookKey}">${txt(bookKey)}</button>
            </div>
        </div>`;
    }).join('');

    applyOfferTranslations();
}

function toggleExpand(btn) {
    btn.classList.toggle('open');
    btn.nextElementSibling.classList.toggle('show');
}

function getActiveFilterCategory() {
    const active = document.querySelector('.filter-btn.active');
    return active ? (active.dataset.category || 'all') : 'all';
}

document.addEventListener('DOMContentLoaded', () => {
    renderOffers('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const target = e.currentTarget;
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            target.classList.add('active');
            renderOffers(target.dataset.category || 'all');
        });
    });

    window.addEventListener('languageChanged', () => {
        renderOffers(getActiveFilterCategory());
        if (typeof updateToggleButton === 'function') {
            updateToggleButton(currentLang());
        }
    });

    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    });

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Subscription Successful! Thank you for joining us.');
            e.target.reset();
        });
    }
});
