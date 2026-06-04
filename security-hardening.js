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
        "form-action 'self' https://formular.homeplus-rn.de",
        "img-src 'self' data: https:",
        "font-src 'self' data: https:",
        "style-src 'self' 'unsafe-inline' https:",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://consent.cookiebot.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.tailwindcss.com",
        "connect-src 'self' https://formular.homeplus-rn.de https://consent.cookiebot.com https://maps.googleapis.com https://maps.gstatic.com",
        "frame-src 'self' https://consent.cookiebot.com https://www.google.com",
        "media-src 'self'",
        "manifest-src 'self' https://www.homeplus-rn.de",
        "worker-src 'self' blob:",
        "upgrade-insecure-requests"
    ].join('; ');

    const contactReplacements = [
        [/\+49 15565 - 415 254/g, '+49 1565 - 415 254'],
        [/\+49 15565 415 254/g, '+49 1565 - 415 254'],
        [/\+49 15565 415254/g, '+49 1565 415254'],
        [/15565 - 415 254/g, '+49 1565 - 415 254'],
        [/15565 415 254/g, '+49 1565 - 415 254'],
        [/4915565415254/g, '491565415254'],
        [/68159/g, '68239']
    ];

    function applyContactCorrections(value) {
        if (!value || !/(15565|4915565415254|68159)/.test(value)) return value;
        return contactReplacements.reduce((next, pair) => next.replace(pair[0], pair[1]), value);
    }

    function correctContactDetails() {
        if (document.head) {
            document.head.querySelectorAll('meta[content], script[type="application/ld+json"]').forEach(el => {
                const attr = el.getAttribute('content');
                if (attr) {
                    const next = applyContactCorrections(attr);
                    if (next !== attr) el.setAttribute('content', next);
                }
                if (el.tagName === 'SCRIPT' && el.textContent) {
                    const next = applyContactCorrections(el.textContent);
                    if (next !== el.textContent) el.textContent = next;
                }
            });
        }

        document.querySelectorAll('a[href], area[href], input[placeholder], textarea[placeholder]').forEach(el => {
            ['href', 'placeholder'].forEach(attrName => {
                if (!el.hasAttribute(attrName)) return;
                const current = el.getAttribute(attrName);
                const next = applyContactCorrections(current);
                if (next !== current) el.setAttribute(attrName, next);
            });
        });

        if (!document.body || !window.NodeFilter) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !/(15565|4915565415254|68159)/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                const parent = node.parentElement;
                if (parent && /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            const next = applyContactCorrections(node.nodeValue);
            if (next !== node.nodeValue) node.nodeValue = next;
        });
    }

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

    function getCurrentPageName() {
        const path = window.location.pathname || '/';
        if (path === '/' || path.endsWith('/')) return 'index.html';
        return path.split('/').pop() || 'index.html';
    }

    function normalizeTrackingValue(value) {
        return (value || '').toString().replace(/\s+/g, ' ').trim().slice(0, 120);
    }

    function getElementLabel(el) {
        return normalizeTrackingValue(
            el.getAttribute('data-track-label') ||
            el.getAttribute('aria-label') ||
            el.getAttribute('title') ||
            el.textContent ||
            el.value ||
            ''
        );
    }

    function getPlacement(el) {
        if (el.getAttribute('data-track-placement')) return el.getAttribute('data-track-placement');
        const section = el.closest('header, footer, nav, main, section, aside');
        if (!section) return 'unknown';
        if (section.id) return section.id;
        if (section.tagName) return section.tagName.toLowerCase();
        return 'unknown';
    }

    function getServiceAndCity() {
        const page = getCurrentPageName().toLowerCase();
        const service = page.includes('waermepumpe') || page.includes('waermepumpen')
            ? 'waermepumpe'
            : (page.includes('photovoltaik') ? 'photovoltaik' : '');
        const city = page.includes('heidelberg') ? 'heidelberg' : (page.includes('mannheim') ? 'mannheim' : '');
        return { service, city };
    }

    function dispatchTrackingEvent(eventName, params) {
        const payload = Object.assign({
            page: getCurrentPageName(),
            path: window.location.pathname
        }, params || {});

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: eventName }, payload));

        if (typeof window.plausible === 'function') {
            window.plausible(eventName, { props: payload });
        }
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, payload);
        }
        if (Array.isArray(window._paq)) {
            window._paq.push(['trackEvent', 'lead', eventName, payload.label || payload.placement || payload.page]);
        }

        window.dispatchEvent(new CustomEvent('homeplus:track', {
            detail: { event: eventName, params: payload }
        }));
    }

    function installLeadTracking() {
        if (window.HomePlusTracking && window.HomePlusTracking.installed) return;

        const startedForms = new WeakSet();
        window.HomePlusTracking = {
            installed: true,
            track: dispatchTrackingEvent
        };

        document.addEventListener('click', event => {
            const target = event.target.closest('a[href], button[data-track-event]');
            if (!target) return;

            const href = target.getAttribute('href') || '';
            const explicitEvent = target.getAttribute('data-track-event');
            const common = Object.assign(getServiceAndCity(), {
                placement: getPlacement(target),
                label: getElementLabel(target)
            });

            if (explicitEvent) {
                dispatchTrackingEvent(explicitEvent, common);
                return;
            }

            if (/^tel:/i.test(href)) {
                dispatchTrackingEvent('click_tel', Object.assign(common, {
                    phone_number: href.replace(/^tel:/i, '')
                }));
                return;
            }

            if (/^mailto:/i.test(href)) {
                dispatchTrackingEvent('click_mail', Object.assign(common, {
                    email: href.replace(/^mailto:/i, '').split('?')[0]
                }));
                return;
            }

            if (/(wa\.me|whatsapp\.com|api\.whatsapp\.com)/i.test(href)) {
                dispatchTrackingEvent('click_whatsapp', common);
                return;
            }

            if (/kontakt\.html|#kontakt/i.test(href) && /angebot|anfrage|beratung|kontakt|foerder|förder/i.test(common.label + ' ' + href)) {
                dispatchTrackingEvent('project_page_cta_click', common);
            }
        }, true);

        document.addEventListener('focusin', event => {
            const field = event.target.closest('input, select, textarea');
            if (!field) return;
            const form = field.closest('form');
            if (!form || startedForms.has(form)) return;
            startedForms.add(form);
            dispatchTrackingEvent('form_start', {
                page: getCurrentPageName(),
                form_name: normalizeTrackingValue(form.getAttribute('data-track-form') || form.getAttribute('name') || form.id || 'contact_form')
            });
        }, true);

        document.addEventListener('submit', event => {
            const form = event.target;
            if (!form || !form.matches || !form.matches('form')) return;
            const formName = normalizeTrackingValue(form.getAttribute('data-track-form') || form.getAttribute('name') || form.id || 'contact_form');
            const common = Object.assign(getServiceAndCity(), {
                page: getCurrentPageName(),
                form_name: formName
            });
            dispatchTrackingEvent('form_submit', common);
            if (/kontakt|contact|angebot|anfrage|quote/i.test(formName + ' ' + (form.getAttribute('action') || ''))) {
                dispatchTrackingEvent('quote_request', common);
            }
        }, true);
    }

    function installSecurityAttributes() {
        upsertHttpEquivMeta('Content-Security-Policy', securityPolicy);
        upsertNamedMeta('referrer', 'strict-origin-when-cross-origin');
        secureInteractiveAttributes();
        normalizeLegacyDomainLinks();
        correctContactDetails();
        installLeadTracking();
    }

    installSecurityAttributes();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            secureInteractiveAttributes();
            normalizeLegacyDomainLinks();
            correctContactDetails();
            installLeadTracking();
        }, { once: true });
    } else {
        secureInteractiveAttributes();
        normalizeLegacyDomainLinks();
        correctContactDetails();
        installLeadTracking();
    }
    window.addEventListener('load', correctContactDetails);
})();
