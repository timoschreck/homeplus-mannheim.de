(function () {
    const siteBase = window.location.origin + (window.location.pathname.includes('/homeplus-mannheim.de/') ? '/homeplus-mannheim.de/' : '/');
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const legacyHosts = ['homeplus.de', 'www.homeplus.de', 'www.homeplus-rn.de'];
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

        document.querySelectorAll('a[href], input[placeholder], textarea[placeholder]').forEach(el => {
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

    function loadSecurityHardening() {
        if (!document.head || document.querySelector('script[data-homeplus-security-loader]')) return;
        const script = document.createElement('script');
        script.src = siteBase + 'security-hardening.js?v=20260602-formbackend';
        script.defer = false;
        script.dataset.homeplusSecurityLoader = 'true';
        script.setAttribute('data-cookieconsent', 'ignore');
        document.head.appendChild(script);
    }

    loadSecurityHardening();

    const cityNames = [
        'Mannheim', 'Heidelberg', 'Ludwigshafen', 'Viernheim', 'Weinheim',
        'Schwetzingen', 'Ladenburg', 'Schriesheim', 'Leimen', 'Heddesheim',
        'Ilvesheim', 'Edingen-Neckarhausen', 'Bruehl', 'Plankstadt', 'Hockenheim',
        'Oftersheim', 'Frankenthal', 'Speyer'
    ];

    const defaultDescription = 'Photovoltaik, Waermepumpen, Stromspeicher und Wallboxen in Mannheim, Heidelberg und dem Rhein-Neckar-Raum. HomePlus plant und montiert alles aus einer Hand.';
    const seoByPage = {
        'index.html': {
            title: 'Photovoltaik & Waermepumpe Mannheim Heidelberg | HomePlus',
            description: defaultDescription,
            keywords: 'Photovoltaik Mannheim, Photovoltaik Heidelberg, Waermepumpe Mannheim, Waermepumpe Heidelberg, Solaranlage Mannheim, Solaranlage Heidelberg, Stromspeicher Rhein-Neckar, Wallbox Mannheim, Energieberatung Heidelberg, HomePlus Mannheim'
        },
        'photovoltaik.html': {
            title: 'Photovoltaik Mannheim & Heidelberg | Solaranlage installieren',
            description: 'Solaranlage in Mannheim, Heidelberg und dem Rhein-Neckar-Raum planen und installieren lassen. HomePlus liefert Photovoltaik, Speicher und Wallbox aus einer Hand.',
            keywords: 'Photovoltaik Mannheim, Solaranlage Mannheim, Photovoltaik Heidelberg, Solaranlage Heidelberg, PV Anlage Rhein-Neckar, Stromspeicher Mannheim, Wallbox Heidelberg'
        },
        'waermepumpen.html': {
            title: 'Waermepumpe Mannheim & Heidelberg | Foerderung & Installation',
            description: 'Waermepumpe in Mannheim, Heidelberg und Rhein-Neckar installieren lassen. HomePlus prueft Foerderung, plant die Anlage und montiert mit Fachteam.',
            keywords: 'Waermepumpe Mannheim, Waermepumpe Heidelberg, Viessmann Waermepumpe Rhein-Neckar, Heizungsmodernisierung Mannheim, Waermepumpe Foerderung Heidelberg'
        },
        'leistungen.html': {
            title: 'Energieloesungen Mannheim Heidelberg | PV, Waermepumpe, Elektro',
            description: 'Alle Energieloesungen fuer Mannheim, Heidelberg und Umgebung: Photovoltaik, Stromspeicher, Wallbox, Waermepumpe und Elektroinstallation aus einer Hand.',
            keywords: 'Energieloesungen Mannheim, Elektroinstallation Heidelberg, Photovoltaik Rhein-Neckar, Waermepumpe Rhein-Neckar, Wallbox Mannheim'
        },
        'kontakt.html': {
            title: 'Angebot Photovoltaik & Waermepumpe Mannheim Heidelberg',
            description: 'Kostenloses Angebot fuer Photovoltaik, Waermepumpe, Speicher oder Wallbox in Mannheim, Heidelberg und dem Rhein-Neckar-Raum anfordern. HomePlus meldet sich persoenlich.',
            keywords: 'Photovoltaik Angebot Mannheim, Waermepumpe Angebot Heidelberg, Solaranlage Beratung Mannheim, HomePlus Kontakt Rhein-Neckar'
        },
        'mannheim-heidelberg.html': {
            title: 'Photovoltaik & Waermepumpe Mannheim Heidelberg Rhein-Neckar-Raum',
            description: 'Regionale Fachberatung fuer Photovoltaik, Waermepumpen, Speicher und Wallboxen in Mannheim, Heidelberg, Ludwigshafen, Viernheim und dem Rhein-Neckar-Raum.',
            keywords: 'Photovoltaik Mannheim Heidelberg, Waermepumpe Mannheim Heidelberg, Solaranlage Rhein-Neckar, HomePlus Rhein-Neckar, Energieberatung Mannheim Heidelberg'
        }
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

    function getAbsolutePageUrl(fileName) {
        return siteBase + (fileName === 'index.html' ? '' : fileName);
    }

    function setMeta(selector, attrs) {
        let el = document.head.querySelector(selector);
        if (!el) {
            el = document.createElement('meta');
            if (attrs.name) el.setAttribute('name', attrs.name);
            if (attrs.property) el.setAttribute('property', attrs.property);
            document.head.appendChild(el);
        }
        Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
    }

    function setLink(rel, href) {
        let el = document.head.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    }

    function setSeoMetadata() {
        const seo = seoByPage[currentFile] || {
            title: document.title ? document.title.replace('HomePlus Rhein-Neckar', 'HomePlus Mannheim Heidelberg') : 'HomePlus Mannheim Heidelberg',
            description: defaultDescription,
            keywords: 'Photovoltaik Mannheim, Waermepumpe Heidelberg, Energieloesungen Rhein-Neckar, HomePlus'
        };
        const pageUrl = getAbsolutePageUrl(currentFile);
        const imageUrl = siteBase + 'Design_ohne_Titel-2.webp';

        document.title = seo.title;
        setLink('canonical', pageUrl);
        setLink('manifest', siteBase + 'site.webmanifest');
        setMeta('meta[name="description"]', { name: 'description', content: seo.description });
        setMeta('meta[name="keywords"]', { name: 'keywords', content: seo.keywords });
        setMeta('meta[name="coverage"]', { name: 'coverage', content: 'Mannheim, Heidelberg, Rhein-Neckar-Raum' });
        setMeta('meta[name="geo.region"]', { name: 'geo.region', content: 'DE-BW' });
        setMeta('meta[name="geo.placename"]', { name: 'geo.placename', content: 'Mannheim, Heidelberg' });
        setMeta('meta[name="geo.position"]', { name: 'geo.position', content: '49.48745;8.46604' });
        setMeta('meta[name="ICBM"]', { name: 'ICBM', content: '49.48745, 8.46604' });
        setMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
        setMeta('meta[property="og:description"]', { property: 'og:description', content: seo.description });
        setMeta('meta[property="og:url"]', { property: 'og:url', content: pageUrl });
        setMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
        setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'HomePlus Mannheim Heidelberg' });
        setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title });
        setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seo.description });
        setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    }

    function installLocalBusinessSchema() {
        const existing = document.head.querySelector('script[data-homeplus-local-seo]');
        if (existing) existing.remove();
        const schema = {
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'HomeAndConstructionBusiness', 'Electrician'],
            '@id': siteBase + '#local-seo-business',
            name: 'HomePlus Mannheim Heidelberg',
            legalName: 'HomePlus GmbH',
            url: siteBase,
            image: siteBase + 'Design_ohne_Titel-2.webp',
            logo: siteBase + 'HomePlus_Logo_horizontal_weiss-gruen-kein-rand.webp',
            telephone: '+49 1565 415254',
            priceRange: '€€',
            description: defaultDescription,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Mannheim',
                postalCode: '68239',
                addressRegion: 'Baden-Wuerttemberg',
                addressCountry: 'DE'
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: 49.48745,
                longitude: 8.46604
            },
            areaServed: cityNames.map(name => ({ '@type': 'City', name: name })),
            serviceArea: {
                '@type': 'GeoCircle',
                geoMidpoint: {
                    '@type': 'GeoCoordinates',
                    latitude: 49.48745,
                    longitude: 8.46604
                },
                geoRadius: 25000
            },
            knowsAbout: [
                'Photovoltaik', 'Solaranlagen', 'Waermepumpen', 'Stromspeicher',
                'Wallboxen', 'Elektroinstallation', 'Energieberatung', 'Foerdermittel'
            ],
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Energieloesungen Mannheim Heidelberg',
                itemListElement: [
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Photovoltaik Installation Mannheim Heidelberg' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Waermepumpe Installation Mannheim Heidelberg' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Stromspeicher und Wallbox Rhein-Neckar' } },
                    { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Elektroinstallation im Rhein-Neckar-Raum' } }
                ]
            }
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.homeplusLocalSeo = 'true';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    function polishRegionalLandingHeader() {
        if (currentFile !== 'mannheim-heidelberg.html') return;
        const header = document.getElementById('main-header');
        if (header) {
            header.classList.remove('bg-brand-blue', 'text-white');
            header.classList.add('bg-white', 'text-brand-blue', 'border-b', 'border-gray-100');
        }
        const logo = document.querySelector('#main-header img');
        if (logo) {
            logo.setAttribute('src', './gruen_blau_schriftzug.webp');
            logo.setAttribute('alt', 'HomePlus Mannheim Heidelberg');
            logo.className = 'h-9 md:h-10 w-auto object-contain';
        }
        document.querySelectorAll('#main-header nav a:not(.bg-brand-disturbingOrange)').forEach(link => {
            link.classList.remove('text-white');
            link.classList.add('text-brand-blue');
        });
    }

    function ensureLocalSeoLink() {
        if (document.querySelector('a[href="mannheim-heidelberg.html"], a[href="./mannheim-heidelberg.html"]')) return;
        const footer = document.querySelector('footer');
        if (!footer) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'px-6 pb-6 text-center text-xs font-semibold uppercase tracking-wide text-brand-blue';
        wrapper.innerHTML = '<a href="./mannheim-heidelberg.html" class="hover:text-brand-primary transition-colors">Photovoltaik & Waermepumpe Mannheim-Heidelberg</a>';
        footer.appendChild(wrapper);
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

    setSeoMetadata();
    installLocalBusinessSchema();
    correctContactDetails();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            normalizeLegacyLinks();
            ensureLocalSeoLink();
            polishRegionalLandingHeader();
            correctContactDetails();
        });
    } else {
        normalizeLegacyLinks();
        ensureLocalSeoLink();
        polishRegionalLandingHeader();
        correctContactDetails();
    }
    window.addEventListener('load', () => {
        installStaticContactFallback();
        polishRegionalLandingHeader();
        correctContactDetails();
    });

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
