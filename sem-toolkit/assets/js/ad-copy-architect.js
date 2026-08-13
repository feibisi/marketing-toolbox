/**
 * Ad Copy Architect Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const inputs = {
        h1: document.getElementById('inputH1'),
        h2: document.getElementById('inputH2'),
        h3: document.getElementById('inputH3'),
        primary: document.getElementById('inputPrimary'),
        desc: document.getElementById('inputDesc'),
        url: document.getElementById('inputUrl')
    };

    const views = {
        h1: document.getElementById('viewH1'),
        h2: document.getElementById('viewH2'),
        h3: document.getElementById('viewH3'),

        urlGoogle: document.getElementById('viewUrlGoogle'),
        descGoogle: document.getElementById('viewDescGoogle'),

        primaryFb: document.getElementById('viewPrimary'),
        h1Fb: document.getElementById('viewH1Fb'),
        descFb: document.getElementById('viewDescFb'),
        urlFb: document.getElementById('viewUrlFb')
    };

    const counters = {
        h1: document.getElementById('countH1'),
        h2: document.getElementById('countH2'),
        h3: document.getElementById('countH3'),
        primary: document.getElementById('countPrimary'),
        desc: document.getElementById('countDesc')
    };

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // UI State
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const platform = tab.dataset.platform;
            switchPlatform(platform);
        });
    });

    function switchPlatform(platform) {
        // Inputs Visibility
        const googleOnly = document.querySelectorAll('.google-only');
        const fbOnly = document.querySelectorAll('.fb-only');
        const previewGoogle = document.getElementById('previewGoogle');
        const previewFb = document.getElementById('previewFacebook');

        if (platform === 'google') {
            googleOnly.forEach(el => el.classList.remove('hidden'));
            fbOnly.forEach(el => el.classList.add('hidden'));
            previewGoogle.classList.remove('hidden');
            previewFb.classList.add('hidden');
        } else {
            googleOnly.forEach(el => el.classList.add('hidden'));
            fbOnly.forEach(el => el.classList.remove('hidden'));
            previewGoogle.classList.add('hidden');
            previewFb.classList.remove('hidden');
        }
    }

    // Input Handling
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        if (input) {
            input.addEventListener('input', () => {
                updatePreview();
                updateCounter(key);
            });
        }
    });

    function updatePreview() {
        const h1 = inputs.h1.value || 'Headline 1';
        const h2 = inputs.h2.value || 'Headline 2';
        const h3 = inputs.h3.value || 'Headline 3';
        const primary = inputs.primary.value || 'Primary text appears here...';
        const desc = inputs.desc.value || 'Description goes here...';
        const url = inputs.url.value || 'example.com';

        // Google View
        views.h1.textContent = h1;
        views.h2.textContent = h2;
        views.h3.textContent = h3;
        views.descGoogle.textContent = desc;
        views.urlGoogle.textContent = url;

        // FB View
        views.primaryFb.textContent = primary;
        views.h1Fb.textContent = h1; // FB uses Headline input as its Headline
        views.descFb.textContent = desc; // FB uses Desc as Link Desc
        views.urlFb.textContent = url.toUpperCase();
    }

    function updateCounter(key) {
        const input = inputs[key];
        const counter = counters[key];

        if (!input || !counter) return;

        const max = input.getAttribute('maxlength');
        const current = input.value.length;

        counter.textContent = `${current}/${max}`;

        // Styling
        counter.classList.remove('limit-near', 'limit-reached');
        if (current >= max) {
            counter.classList.add('limit-reached');
        } else if (current >= max * 0.9) {
            counter.classList.add('limit-near');
        }
    }

    // Init
    setTimeout(() => {
        updatePreview();
        Object.keys(inputs).forEach(key => updateCounter(key));
    }, 200);

});
