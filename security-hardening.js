(function () {
    const legacyHosts = new Set(['homeplus.de', 'www.homeplus.de', 'www.homeplus-rn.de']);
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
        '/barrierefreiheit.html': 'barrierefreiheit.html',
        '/mannheim-heidelberg.html': 'mannheim-heidelberg.html'
    };

    const securityPolicy = [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'self' https://formspree.io",
        "img-src 'self' data: https:",
        "font-src 'self' data: https:",
        "style-src 'self' 'unsafe-inline' https:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://consent.cookiebot.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.tailwindcss.com",
        "connect-src 'self' https://formspree.io https://consent.cookiebot.com https://maps.googleapis.com https://maps.gstatic.com",
        "frame-src 'self' https://consent.cookiebot.com https://www.google.com",
        "media-src 'self'",
        "manifest-src 'self' https://www.homeplus-rn.de",
        "worker-src 'self' blob:",
        "upgrade-insecure-requests"
    ].join('; ');

    function upsertHttpEquivMeta(httpEquiv, content) {
        if (!document.head) return;
        let el = document.head.querySelector(`meta[http-equiv="${httpEquiv}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('http-equiv', httpEquiv);
            const anchor = document.head.querySelector('meta[charset], meta[http-equiv="Content-Type"]');
            if (anchor && anchor.nextSibling) document.head.insertBefore(el, anchor.nextSibling);
            else document.head.prepend(el);
        }
        el.setAttribute('content', content);
        el.dataset.homeplusSecurity = 'true';
    }

    function upsertNamedMeta(name, content) {
        if (!document.head) return;
        let el = document.head.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
        el.dataset.homeplusSecurity = 'true';
    }

    function mapLegacyUrl(value) {
        if (!value) return value;
        try {
            const url = new URL(value, window.location.href);
            if (!legacyHosts.has(url.hostname)) return value;
            const page = pageMap[url.pathname] || 'index.html';
            return (page === 'index.html' ? './' : './' + page) + url.search + url.hash;
        } catch (e) {
            return value;
        }
    }

    function normalizeLegacyDomainLinks() {
        document.querySelectorAll('a[href], area[href]').forEach(link => {
            const current = link.getAttribute('href');
            const next = mapLegacyUrl(current);
            if (next === current) return;

            link.setAttribute('href', next);
            const visibleText = (link.textContent || '').trim();
            if (/^https?:\/\/(www\.)?homeplus\.de\/?$/i.test(visibleText)) {
                const targetUrl = new URL(next, window.location.origin + window.location.pathname);
                link.textContent = targetUrl.href.replace(/index\.html$/, '');
            }
        });
    }

    function secureInteractiveAttributes() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
            rel.add('noopener');
            rel.add('noreferrer');
            link.setAttribute('rel', Array.from(rel).join(' '));
            if (!link.getAttribute('referrerpolicy')) link.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        });

        document.querySelectorAll('form[action]').forEach(form => {
            if (!form.getAttribute('referrerpolicy')) form.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        });

        document.querySelectorAll('script[src], link[href], img[src], iframe[src]').forEach(el => {
            const url = el.getAttribute('src') || el.getAttribute('href') || '';
            if (/^https?:/i.test(url) && !el.getAttribute('referrerpolicy')) {
                el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            }
        });
    }

    function installSecurityAttributes() {
        upsertHttpEquivMeta('Content-Security-Policy', securityPolicy);
        upsertNamedMeta('referrer', 'strict-origin-when-cross-origin');
        secureInteractiveAttributes();
        normalizeLegacyDomainLinks();
    }

    installSecurityAttributes();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            secureInteractiveAttributes();
            normalizeLegacyDomainLinks();
        }, { once: true });
    } else {
        secureInteractiveAttributes();
        normalizeLegacyDomainLinks();
    }
})();
