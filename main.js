// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Lucide Icons
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (e) {}

    // 2. Navigation & Header Scroll Logic
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const stickyCta = document.getElementById('sticky-mobile-cta');
    const progressBar = document.getElementById('scroll-progress');
    const menuBtn = document.getElementById('mobile-menu-btn');
    
    // Prüfen, ob wir auf der Startseite sind
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
    
    function updateHeaderStyle() {
        if (!header) return;
        // Auf Unterseiten (oder wenn gescrollt wurde) ist der Header immer ausgefüllt (weiß)
        if (!isHomePage || window.scrollY > 50) {
            header.classList.add('glass-nav');
            // Die Textfarbe der Links nur auf den Standard-Links anpassen (nicht auf dem aktiven Link, der grün bleibt)
            navLinks.forEach(l => { 
                if(!l.classList.contains('text-brand-primary')) {
                    l.classList.remove('text-white'); 
                    l.classList.add('text-gray-700'); 
                }
            });
            // Kugelsicherer Fix für den Mobile Menu Button (Umgeht den CSS-Cache von Smartphones)
            if (menuBtn) {
                menuBtn.classList.remove('text-white', 'bg-white/10');
                menuBtn.style.color = '#321EE6'; 
                menuBtn.style.backgroundColor = 'rgba(50, 30, 230, 0.05)'; 
            }
        } else {
            // Nur auf der Startseite ganz oben ist der Header transparent
            header.classList.remove('glass-nav');
            navLinks.forEach(l => { 
                if(!l.classList.contains('text-brand-primary')) {
                    l.classList.remove('text-gray-700'); 
                    l.classList.add('text-white'); 
                }
            });
            if (menuBtn) {
                menuBtn.classList.add('text-white', 'bg-white/10');
                menuBtn.style.color = ''; 
                menuBtn.style.backgroundColor = '';
            }
        }
    }
    
    // Direkt beim Laden prüfen
    updateHeaderStyle();

    let kontaktTop = Infinity;
    function calculatePositions() {
        const kontaktSection = document.getElementById('kontakt');
        kontaktTop = kontaktSection ? (kontaktSection.offsetTop - window.innerHeight + 200) : Infinity;
    }
    window.addEventListener('load', calculatePositions);
    window.addEventListener('resize', calculatePositions);

    let rafPending = false;
    window.addEventListener('scroll', () => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
            rafPending = false;
            if (progressBar) {
                const totalScroll = document.documentElement.scrollTop;
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                progressBar.style.width = `${(totalScroll / windowHeight) * 100}%`;
            }
            updateHeaderStyle();
            if (stickyCta) {
                if (window.scrollY > 400 && window.scrollY < kontaktTop) {
                    stickyCta.classList.remove('translate-y-[200%]');
                } else {
                    stickyCta.classList.add('translate-y-[200%]');
                }
            }
        });
    }, { passive: true });

    // 3. Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 4. Mobile Menu
    const mobileMenu = document.getElementById('mobile-menu');
    if(menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => { 
            const expanded = menuBtn.getAttribute('aria-expanded') === 'true' || false;
            menuBtn.setAttribute('aria-expanded', !expanded);
            mobileMenu.classList.toggle('hidden'); 
        });

        // Menü schließen, wenn man auf eine freie Fläche tippt
        document.addEventListener('click', (event) => {
            if (!mobileMenu.classList.contains('hidden') && !menuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 5. Contact Form Email Validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', function() {
            if(this.value.length > 0) {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
                if(isValid) {
                    this.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500', 'bg-red-50');
                    this.classList.add('border-green-500', 'focus:border-green-500', 'focus:ring-green-500');
                } else {
                    this.classList.remove('border-green-500', 'focus:border-green-500', 'focus:ring-green-500');
                    this.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500', 'bg-red-50');
                }
            } else {
                this.classList.remove('border-red-500', 'border-green-500', 'focus:border-red-500', 'focus:border-green-500', 'focus:ring-red-500', 'focus:ring-green-500', 'bg-red-50');
            }
        });
    });

    // 6. Escape Key Listener for Modals
    document.addEventListener('keydown', function(event) {
        if (event.key !== 'Escape' && event.key !== 'Esc') return;
        const overlayClosers = [
            { id: 'legal-overlay',          fn: window.closeLegal },
            { id: 'lightbox',               fn: window.closeLightbox },
            { id: 'review-overlay',         fn: window.closeReviewModal },
            { id: 'photovoltaik-overlay',   fn: window.closePhotovoltaikModal },
            { id: 'speicher-overlay',       fn: window.closeSpeicherModal },
            { id: 'wechselrichter-overlay', fn: window.closeWechselrichterModal },
            { id: 'wallbox-overlay',        fn: window.closeWallboxModal },
            { id: 'waermepumpen-overlay',   fn: window.closeWaermepumpenModal },
            { id: 'backup-overlay',         fn: window.closeBackupModal },
        ];
        overlayClosers.forEach(({ id, fn }) => {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('hidden') && typeof fn === 'function') fn();
        });
    });

    // 7. FAQ Search
    const searchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item-container');
    if(searchInput && faqItems) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            faqItems.forEach(item => {
                const question = item.querySelector('span').innerText.toLowerCase();
                const answer = item.querySelector('.text-brand-textBody').innerText.toLowerCase();
                if(question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // --- 10. MULTI-STEP FUNNEL & AJAX SUBMISSION ---
    const multiStepForms = document.querySelectorAll('.multi-step-form');
    
    multiStepForms.forEach(form => {
        form.addEventListener('keydown', function(e) {
            if(e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });

        const steps = form.querySelectorAll('.step-container');
        const indicators = form.querySelectorAll('.step-indicator');
        const progressBar = form.querySelector('.progress-bar-fill');
        const nextBtns = form.querySelectorAll('.next-btn');
        const prevBtns = form.querySelectorAll('.prev-btn');
        let currentStep = 0;

        function updateStep() {
            steps.forEach((step, index) => {
                if(index === currentStep) {
                    step.classList.remove('hidden');
                    setTimeout(() => {
                        step.classList.remove('opacity-0');
                        step.classList.add('opacity-100');
                    }, 50);
                } else {
                    step.classList.remove('opacity-100');
                    step.classList.add('opacity-0');
                    step.classList.add('hidden');
                }
            });

            const progress = ((currentStep + 1) / steps.length) * 100;
            if(progressBar) progressBar.style.width = `${progress}%`;

            if(indicators.length > 0) {
                indicators.forEach((ind, index) => {
                    if(index <= currentStep) {
                        ind.classList.add('text-brand-primary');
                        ind.classList.remove('text-gray-400');
                    } else {
                        ind.classList.remove('text-brand-primary');
                        ind.classList.add('text-gray-400');
                    }
                });
            }
        }

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                let isValid = true;
                
                if(currentStep === 0) {
                    const checkboxes = steps[0].querySelectorAll('input[type="checkbox"]');
                    const isChecked = Array.from(checkboxes).some(cb => cb.checked);
                    
                    const warning = steps[0].querySelector('.checkbox-warning');
                    if(!isChecked) {
                        if(warning) warning.classList.remove('hidden');
                        isValid = false;
                    } else {
                        if(warning) warning.classList.add('hidden');
                    }
                } 
                else {
                    const currentInputs = steps[currentStep].querySelectorAll('input[required]');
                    currentInputs.forEach(input => {
                        if(!input.checkValidity()) {
                            input.reportValidity();
                            isValid = false;
                        }
                    });
                }

                if(isValid) {
                    currentStep++;
                    updateStep();
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                currentStep--;
                updateStep();
            });
        });

        const actionInput = form.querySelector('input[name="action"][value="send_lead"]');
        if (!actionInput) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> WIRD GESENDET...';
            submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
            
            const formData = new FormData(form);
            formData.append('is_ajax', '1'); 
            
            const oldAlerts = form.querySelectorAll('.ajax-alert');
            oldAlerts.forEach(a => a.remove());

            fetch('/kontakt.html', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const successHtml = `
                        <div class="ajax-alert bg-[#00B67A]/10 border border-[#00B67A]/30 text-[#00B67A] px-6 py-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm animate-[fadeIn_0.5s_ease-out] h-full min-h-[400px]">
                            <div class="w-20 h-20 bg-[#00B67A] text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#00B67A]/30">
                                <i data-lucide="check" class="w-10 h-10"></i>
                            </div>
                            <p class="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-wide mb-3 text-brand-blue">Vielen Dank!</p>
                            <p class="text-lg font-light text-brand-textBody max-w-md">Ihre Anfrage wurde erfolgreich an unser System übergeben. Unser Team meldet sich in Kürze bei Ihnen.</p>
                        </div>
                    `;
                    form.style.transition = 'opacity 0.4s ease';
                    form.style.opacity = '0';
                    setTimeout(() => {
                        form.style.display = 'none';
                        form.insertAdjacentHTML('beforebegin', successHtml);
                        if (typeof lucide !== 'undefined') lucide.createIcons();
                    }, 400);
                } else {
                    throw new Error('Server returned an error status.');
                }
            })
            .catch(() => {
                const errorHtml = `
                    <div class="ajax-alert bg-red-500/10 border border-red-500/30 text-red-600 px-5 py-4 rounded-xl mb-6 flex items-center gap-3 animate-[fadeIn_0.5s_ease-out]">
                        <i data-lucide="alert-circle" class="w-6 h-6 shrink-0"></i>
                        <p class="font-bold text-sm">Es gab einen Fehler beim Senden. Bitte überprüfen Sie Ihre Daten oder rufen Sie uns an.</p>
                    </div>
                `;
                submitBtn.insertAdjacentHTML('beforebegin', errorHtml);
                if (typeof lucide !== 'undefined') lucide.createIcons();
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            });
        });
    });

    // --- 11. WHATSAPP TOOLTIP ANIMATION ---
    const waTooltip = document.getElementById('whatsapp-tooltip');
    if (waTooltip) {
        setTimeout(() => {
            waTooltip.classList.remove('opacity-0', 'translate-y-4');
            waTooltip.classList.add('opacity-100', 'translate-y-0');
            setTimeout(() => {
                if (waTooltip) {
                    waTooltip.classList.remove('opacity-100', 'translate-y-0');
                    waTooltip.classList.add('opacity-0', 'translate-y-4');
                    setTimeout(() => waTooltip.style.display = 'none', 500);
                }
            }, 10000);
        }, 5000);
    }

    // --- 12. PAGE TRANSITIONS (APP-FEELING) ---
    const pageLinks = document.querySelectorAll('a[href]');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.href) return;
            const target = this.getAttribute('target');
            const hrefAttr = this.getAttribute('href');
            
            if (
                e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0 || 
                target === '_blank' || 
                hrefAttr.startsWith('mailto:') || hrefAttr.startsWith('tel:') || 
                hrefAttr.startsWith('javascript:')
            ) return;

            try {
                const linkUrl = new URL(this.href);
                const currentUrl = new URL(window.location.href);

                if (linkUrl.pathname === currentUrl.pathname && linkUrl.search === currentUrl.search && linkUrl.hash !== '') return; 

                if (linkUrl.host === currentUrl.host) {
                    e.preventDefault();
                    document.body.style.opacity = '0';
                    setTimeout(() => { window.location.href = this.href; }, 150);
                }
            } catch (err) {}
        });
    });

    // --- 13. DYNAMIC SEO & AI SCHEMA ---
    const faqElements = document.querySelectorAll('.faq-item-container');
    if (faqElements.length > 0) {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
        };
        faqElements.forEach(item => {
            const questionEl = item.querySelector('button span');
            const answerEl = item.querySelector('.faq-answer-wrapper p');
            if (questionEl && answerEl) {
                faqSchema.mainEntity.push({
                    "@type": "Question",
                    "name": questionEl.innerText.trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answerEl.innerText.trim()
                    }
                });
            }
        });
        if (faqSchema.mainEntity.length > 0) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(faqSchema);
            document.head.appendChild(script);
        }
    }

    const productDrawers = document.querySelectorAll('.drawer-panel');
    if (productDrawers.length > 0) {
        productDrawers.forEach(drawer => {
            const titleEl = drawer.querySelector('h3');
            const descEl = drawer.querySelector('p'); 
            const imgEl = drawer.querySelector('img');
            
            if (titleEl && descEl) {
                const productSchema = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": titleEl.innerText.replace('■', '').replace(/\n/g, ' ').trim(),
                    "description": descEl.innerText.trim(),
                    "brand": {
                        "@type": "Brand",
                        "name": "HomePlus"
                    },
                    "offers": {
                        "@type": "Offer",
                        "availability": "https://schema.org/InStock",
                        "priceCurrency": "EUR"
                    }
                };
                if (imgEl && imgEl.src) {
                    productSchema.image = imgEl.src;
                }
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(productSchema);
                document.head.appendChild(script);
            }
        });
    }

    const reviewCards = document.querySelectorAll('#reviews-slider .shrink-0, #bewertungen .bg-white.rounded-\\[2\\.5rem\\]');
    if (reviewCards.length > 0) {
        let ratingValue = '4.9';
        let reviewCount = '166'; 
        
        const ratingMatch = document.body.innerText.match(/(\d[\.,]\d)\/5\s*(auf\s*Google)?/i);
        if (ratingMatch && ratingMatch[1]) {
            ratingValue = ratingMatch[1].replace(',', '.');
        }

        const businessSchema = {
            "@context": "https://schema.org",
            "@type": "EnergyBusiness",
            "@id": "https://homeplus-rn.de/#organization",
            "name": "HomePlus GmbH",
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": ratingValue,
                "bestRating": "5",
                "ratingCount": reviewCount
            },
            "review": []
        };

        reviewCards.forEach(card => {
            const textEl = card.querySelector('p.line-clamp-6, p.line-clamp-4');
            const authorEl = card.querySelector('p.font-bold.text-sm, p.font-bold.text-base');
            
            if (textEl && authorEl) {
                businessSchema.review.push({
                    "@type": "Review",
                    "author": {
                        "@type": "Person",
                        "name": authorEl.innerText.trim()
                    },
                    "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                    },
                    "reviewBody": textEl.innerText.replace(/"/g, '').trim()
                });
            }
        });

        if (businessSchema.review.length > 0) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(businessSchema);
            document.head.appendChild(script);
        }
    }

});

// --- BFCache Fix für Safari/Mobile ---
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.style.opacity = '1';
    }
});

// --- GLOBAL FUNCTIONS ---

// Review Pop-Up / Modal Logik
window.openReviewModal = function(element) {
    const overlay = document.getElementById('review-overlay');
    const content = document.getElementById('review-modal-content');
    if(!overlay || !content) return;

    const titleEl = element.querySelector('h4');
    const textEl = element.querySelector('p[title]') || element.querySelector('p.line-clamp-4') || element.querySelector('p.line-clamp-6');

    let authorEl = null;
    element.querySelectorAll('p').forEach(p => {
        if(p.classList.contains('font-bold') || p.innerText.includes('Familie') || p.innerText.includes('Kunde')) {
            authorEl = p;
        }
    });

    const modalTitle = document.getElementById('modal-review-title');
    const modalText = document.getElementById('modal-review-text');
    const modalAuthor = document.getElementById('modal-review-author');

    if(titleEl && modalTitle) modalTitle.innerText = titleEl.innerText;
    if(authorEl && modalAuthor) modalAuthor.innerText = authorEl.innerText;
    if(textEl && modalText) modalText.innerText = textEl.getAttribute('title') || textEl.innerText;

    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.closeReviewModal = function() {
    const overlay = document.getElementById('review-overlay');
    const content = document.getElementById('review-modal-content');
    if(!overlay || !content) return;
    
    overlay.classList.add('opacity-0'); 
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => { 
        overlay.classList.add('hidden'); 
        document.body.style.overflow = ''; 
    }, 300);
};

// Google Maps Autocomplete
window.initAutocomplete = function() {
    // Autocomplete für die Hauptkontaktseite
    const addressInput = document.getElementById('strasse_hausnummer');
    if (addressInput) {
        addressInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') e.preventDefault(); });
        const autocomplete = new google.maps.places.Autocomplete(addressInput, {
            types: ['address'],
            componentRestrictions: { 'country': ['de'] },
            fields: ['address_components']
        });
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            let postcode = '', city = '';
            if (place.address_components) {
                for (const component of place.address_components) {
                    if (component.types[0] === 'postal_code') postcode = component.long_name;
                    if (component.types[0] === 'locality') city = component.long_name;
                }
            }
            const plzInput = document.getElementById('plz');
            const ortInput = document.getElementById('ort');
            if(plzInput && postcode) {
                plzInput.value = postcode;
                plzInput.classList.add('border-green-500', 'bg-green-50');
                setTimeout(() => plzInput.classList.remove('border-green-500', 'bg-green-50'), 1500);
            }
            if(ortInput && city) {
                ortInput.value = city;
                ortInput.classList.add('border-green-500', 'bg-green-50');
                setTimeout(() => ortInput.classList.remove('border-green-500', 'bg-green-50'), 1500);
            }
        });
    }

    // Autocomplete für das Formular auf der Startseite (andere IDs)
    const addressInputHome = document.getElementById('strasse_hausnummer_home');
    if (addressInputHome) {
        addressInputHome.addEventListener('keydown', function(e) { if (e.key === 'Enter') e.preventDefault(); });
        const autocompleteHome = new google.maps.places.Autocomplete(addressInputHome, {
            types: ['address'],
            componentRestrictions: { 'country': ['de'] },
            fields: ['address_components']
        });
        autocompleteHome.addListener('place_changed', function() {
            const place = autocompleteHome.getPlace();
            let postcode = '', city = '';
            if (place.address_components) {
                for (const component of place.address_components) {
                    if (component.types[0] === 'postal_code') postcode = component.long_name;
                    if (component.types[0] === 'locality') city = component.long_name;
                }
            }
            const plzInputHome = document.getElementById('plz_home');
            const ortInputHome = document.getElementById('ort_home');
            if(plzInputHome && postcode) {
                plzInputHome.value = postcode;
                plzInputHome.classList.add('border-green-500', 'bg-green-50');
                setTimeout(() => plzInputHome.classList.remove('border-green-500', 'bg-green-50'), 1500);
            }
            if(ortInputHome && city) {
                ortInputHome.value = city;
                ortInputHome.classList.add('border-green-500', 'bg-green-50');
                setTimeout(() => ortInputHome.classList.remove('border-green-500', 'bg-green-50'), 1500);
            }
        });
    }
};

// Legal Modals
window.openLegal = function(type) {
    const overlay = document.getElementById('legal-overlay');
    if(!overlay) return;
    overlay.classList.remove('hidden');
    ['impressum', 'datenschutz', 'agb', 'cookie', 'barrierefreiheit'].forEach(t => {
        const el = document.getElementById('content-' + t);
        if(el) el.classList.add('hidden');
    });
    const target = document.getElementById('content-' + type);
    if(target) target.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};
window.closeLegal = function() {
    const overlay = document.getElementById('legal-overlay');
    if(overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
};

// Team Cards
window.toggleTeamContact = function(element) {
    document.querySelectorAll('.team-card').forEach(card => {
        if (card !== element) {
            card.classList.remove('active-card', 'border-brand-primary', 'shadow-md');
            card.classList.add('border-gray-100', 'shadow-sm');
            const quote = card.querySelector('.quote-text');
            const contact = card.querySelector('.contact-info');
            const img = card.querySelector('.img-container');
            if(quote) quote.classList.remove('hidden');
            if(contact) contact.classList.add('hidden');
            if(img) { img.classList.remove('w-20', 'h-20'); img.classList.add('w-32', 'h-32'); }
        }
    });
    element.classList.toggle('active-card');
    const quote = element.querySelector('.quote-text');
    const contact = element.querySelector('.contact-info');
    const img = element.querySelector('.img-container');
    if (element.classList.contains('active-card')) {
        element.classList.remove('border-gray-100', 'shadow-sm');
        element.classList.add('border-brand-primary', 'shadow-md');
        if(quote) quote.classList.add('hidden');
        if(contact) contact.classList.remove('hidden');
        if(img) { img.classList.remove('w-32', 'h-32'); img.classList.add('w-20', 'h-20'); }
    } else {
        element.classList.remove('border-brand-primary', 'shadow-md');
        element.classList.add('border-gray-100', 'shadow-sm');
        if(quote) quote.classList.remove('hidden');
        if(contact) contact.classList.add('hidden');
        if(img) { img.classList.remove('w-20', 'h-20'); img.classList.add('w-32', 'h-32'); }
    }
};

// Scroll to Contact
window.scrollToKontaktFromModal = function(overlayId, contentId) {
    const overlay = document.getElementById(overlayId);
    const content = document.getElementById(contentId);
    if(overlay && content) {
        overlay.classList.add('opacity-0'); 
        content.classList.add('scale-95');
        setTimeout(() => {
            overlay.classList.add('hidden'); 
            document.body.style.overflow = '';
            const kontaktEl = document.getElementById('kontakt');
            if(kontaktEl) kontaktEl.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = '/kontakt.html';
        }, 300);
    } else {
        const kontaktEl = document.getElementById('kontakt');
        if(kontaktEl) kontaktEl.scrollIntoView({ behavior: 'smooth' });
        else window.location.href = '/kontakt.html';
    }
};

// FAQ Toggle
window.toggleFaqAdvanced = function(button) {
    const wrapper = button.nextElementSibling;
    const iconWrapper = button.querySelector('.faq-icon-wrapper');
    const container = button.closest('.faq-item-container');
    const isOpen = wrapper.style.gridTemplateRows === '1fr';

    document.querySelectorAll('.faq-answer-wrapper').forEach(w => w.style.gridTemplateRows = '0fr');
    document.querySelectorAll('.faq-icon-wrapper').forEach(i => i.style.transform = 'rotate(0deg)');
    document.querySelectorAll('.faq-item-container').forEach(c => {
        c.classList.remove('border-brand-primary', 'shadow-md');
        c.classList.add('border-gray-100', 'shadow-sm');
    });
    document.querySelectorAll('[onclick="toggleFaqAdvanced(this)"]').forEach(b => b.setAttribute('aria-expanded', 'false'));

    if (!isOpen) {
        wrapper.style.gridTemplateRows = '1fr';
        iconWrapper.style.transform = 'rotate(180deg)';
        button.setAttribute('aria-expanded', 'true');
        container.classList.remove('border-gray-100', 'shadow-sm');
        container.classList.add('border-brand-primary', 'shadow-md');
    }
};

// Portfolio Filter
window.filterPortfolio = function(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if(btn.dataset.filter === category) {
            btn.classList.remove('bg-white', 'text-brand-blue', 'border', 'border-gray-200');
            btn.classList.add('bg-brand-blue', 'text-white', 'shadow-md');
        } else {
            btn.classList.add('bg-white', 'text-brand-blue', 'border', 'border-gray-200');
            btn.classList.remove('bg-brand-blue', 'text-white', 'shadow-md');
        }
    });

    const items = document.querySelectorAll('.portfolio-item');
    items.forEach(item => {
        if(category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(() => { if(item.style.opacity === '0') item.style.display = 'none'; }, 500);
        }
    });
};

// Lightbox
window.openLightbox = function(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = imageSrc; 
    lightbox.classList.remove('hidden');
    setTimeout(() => { lightbox.classList.remove('opacity-0'); lightboxImg.classList.remove('scale-95'); lightboxImg.classList.add('scale-100'); }, 10);
    document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if(!lightbox || !lightboxImg) return;
    lightbox.classList.add('opacity-0'); 
    lightboxImg.classList.remove('scale-100'); 
    lightboxImg.classList.add('scale-95');
    setTimeout(() => { lightbox.classList.add('hidden'); lightboxImg.src = ''; document.body.style.overflow = ''; }, 300);
};

window.addEventListener('click', function(event) {
    const backdropModals = [
        { id: 'review-overlay', fn: window.closeReviewModal },
        { id: 'lightbox',       fn: window.closeLightbox },
    ];
    backdropModals.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        if (el && event.target === el && typeof fn === 'function') fn();
    });
});
