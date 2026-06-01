(function () {
    const legacyHosts = ['homeplus-rn.de', 'www.homeplus-rn.de'];
    const pageMap = {
        '/': 'index.html',
        '/index.html': 'index.html',
        '/leistungen.html': 'leistungen.html',
        '/photovoltaik.html': 'photovoltaik.html',
        '/waermepumpen.html': 'waermepumpen.html',
        '/ablauf.html': 'ablauf.html',
        '/ueber-uns.html': 'ueber-uns.html',
        '/kontakt.html': 'kontakt.html',
        '/impressum.html': 'impressum.html',
        '/datenschutz.html': 'datenschutz.html',
        '/agb.html': 'agb.html',
        '/cookie-richtlinie.html': 'cookie-richtlinie.html',
        '/barrierefreiheit.html': 'barrierefreiheit.html'
    };

    function mapLegacyUrl(value) {
        if (!value) return value;
        try {
            const url = new URL(value, window.location.href);
            if (!legacyHosts.includes(url.hostname)) return value;
            return (pageMap[url.pathname] || 'index.html') + url.search + url.hash;
        } catch (e) {
            return value;
        }
    }

    function normalizeLegacyLinks() {
        document.querySelectorAll('a[href]').forEach(link => {
            const current = link.getAttribute('href');
            const next = mapLegacyUrl(current);
            if (next !== current) link.setAttribute('href', next);
        });
    }

    function installStaticContactFallback() {
        window.scrollToKontaktFromModal = function (overlayId, contentId) {
            const overlay = document.getElementById(overlayId);
            const content = document.getElementById(contentId);
            const finish = function () {
                document.body.style.overflow = '';
                const kontaktEl = document.getElementById('kontakt');
                if (kontaktEl) kontaktEl.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = 'kontakt.html';
            };

            if (overlay && content) {
                overlay.classList.add('opacity-0');
                content.classList.add('scale-95');
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    finish();
                }, 300);
            } else {
                finish();
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', normalizeLegacyLinks);
    } else {
        normalizeLegacyLinks();
    }
    window.addEventListener('load', installStaticContactFallback);

    try {
        if (window.CookieConsent && CookieConsent.configuration && Array.isArray(CookieConsent.configuration.tags)) {
            CookieConsent.configuration.tags.push({
                id: 226936181,
                type: 'script',
                tagID: '',
                innerHash: '',
                outerHash: '',
                tagHash: '11494492576747',
                url: 'https://consent.cookiebot.com/uc.js',
                resolvedUrl: 'https://consent.cookiebot.com/uc.js',
                cat: [1]
            });
        }
    } catch (e) {}
})();
