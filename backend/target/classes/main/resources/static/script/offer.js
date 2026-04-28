/**
 * offer.js — SOT Resort & Hotel — Offer page
 *
 * Each offer card is defined by a metadata block in #offer-data (HTML).
 * The block carries:
 *   data-id, data-category, data-title-key, data-desc-key,
 *   data-rate-key, data-image
 *   data-inc-keys  = comma-separated list of inclusion keys
 *   data-con-keys  = comma-separated list of condition keys
 *
 * Every rendered text node gets a data-i18n attribute so language.js
 * applyTranslations() can swap it on language toggle — no strings are
 * hardcoded in JS.
 */

function currentLang() {
    return localStorage.getItem('sot_lang') || 'en';
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

function renderOffers(category = 'all') {
    const container = document.getElementById('offers-container');
    if (!container) return;

    const en      = (window.TRANSLATIONS && window.TRANSLATIONS.en) || {};
    const offers  = getOfferData();
    const filtered = category === 'all' ? offers : offers.filter(o => o.category === category);

    // Seed every text node with its EN value AND its data-i18n key.
    // applyTranslations() will overwrite textContent to the current lang.
    container.innerHTML = filtered.map(o => {
        const ratesKey = 'offer_rates_label';
        const condKey  = 'offer_cond_label';
        const bookKey  = 'offer_booknow';

        const incItems = o.incKeys.map(k =>
            `<li data-i18n="${k}">${en[k] || k}</li>`
        ).join('');

        const conItems = o.conKeys.map(k =>
            `<li data-i18n="${k}">${en[k] || k}</li>`
        ).join('');

        return `
        <div class="offer-card">
            <div class="card-image">
                <img src="${o.image}" alt="${en[o.titleKey] || o.titleKey}">
                <span class="badge">${o.category}</span>
            </div>
            <div class="card-content">
                <h3 data-i18n="${o.titleKey}">${en[o.titleKey] || o.titleKey}</h3>
                <p class="desc" data-i18n="${o.descKey}">${en[o.descKey] || o.descKey}</p>
                <ul class="inclusions">${incItems}</ul>
                <div class="expandable">
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        <span data-i18n="${ratesKey}">${en[ratesKey] || 'Rates'}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content">
                        <p data-i18n="${o.rateKey}">${en[o.rateKey] || o.rateKey}</p>
                    </div>
                    <button class="expand-btn" onclick="toggleExpand(this)">
                        <span data-i18n="${condKey}">${en[condKey] || 'Conditions'}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="expand-content">
                        <ul>${conItems}</ul>
                    </div>
                </div>
                <button class="btn-book-offer" data-i18n="${bookKey}">${en[bookKey] || 'BOOK NOW'}</button>
            </div>
        </div>`;
    }).join('');
}

function toggleExpand(btn) {
    btn.classList.toggle('open');
    btn.nextElementSibling.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    renderOffers('all');
    // language.js boots after this and calls applyTranslations() on DOMContentLoaded,
    // which will sweep all the data-i18n nodes we just injected.

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderOffers(e.target.dataset.category);
            // Re-apply current language to the freshly-rendered cards
            if (typeof applyTranslations === 'function') applyTranslations(currentLang());
        });
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