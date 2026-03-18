/**
 * SCHÖLL GMBH WEBSITE – MAIN JAVASCRIPT
 * Features: Ticker, Seasonal Hero, Mobile Nav
 */

(function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    
    const CONFIG = {
        // Ticker messages (can be updated here)
        TICKER_MESSAGES: [
            '50 Jahre Schöll – Danke für Ihr Vertrauen!',
            'Verkaufsoffener Sonntag am 23.03. – 13-18 Uhr',
            'Neue Frühjahrskollektion eingetroffen',
            'Gratis Lieferung ab 50€ Bestellwert',
            'Schweinfurt & Bad Kissingen – immer für Sie da'
        ],
        
        // Seasonal hero images (placeholder for actual images)
        SEASONS: {
            spring: {
                name: 'Frühling',
                months: [3, 4, 5, 6, 7, 8], // March - August
                bg: 'linear-gradient(135deg, rgba(212, 228, 212, 0.3) 0%, rgba(26, 26, 26, 1) 100%)'
            },
            autumn: {
                name: 'Herbst / Winter',
                months: [9, 10, 11, 12, 1, 2], // September - February
                bg: 'linear-gradient(135deg, rgba(232, 216, 200, 0.3) 0%, rgba(26, 26, 26, 1) 100%)'
            }
        },
        
        // Mobile breakpoint
        MOBILE_BREAKPOINT: 768
    };

    // ========================================
    // UTILITIES
    // ========================================
    
    const utils = {
        // Debounce function for performance
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Check if device is touch
        isTouch: function() {
            return window.matchMedia('(pointer: coarse)').matches;
        },
        
        // Get current month (1-12)
        getCurrentMonth: function() {
            return new Date().getMonth() + 1;
        }
    };

    // ========================================
    // TICKER COMPONENT
    // ========================================
    
    const Ticker = {
        element: null,
        content: null,
        
        init: function() {
            this.element = document.getElementById('headerTicker');
            if (!this.element) return;
            
            this.content = this.element.querySelector('.ticker-content');
            if (!this.content) return;
            
            // Build ticker from config
            this.build();
            
            // Pause on touch (mobile)
            if (utils.isTouch()) {
                this.element.addEventListener('touchstart', () => {
                    this.content.style.animationPlayState = 'paused';
                }, { passive: true });
                
                this.element.addEventListener('touchend', () => {
                    setTimeout(() => {
                        this.content.style.animationPlayState = 'running';
                    }, 3000);
                }, { passive: true });
            }
        },
        
        build: function() {
            const messages = CONFIG.TICKER_MESSAGES;
            let html = '';
            
            // Duplicate messages for seamless loop
            const displayMessages = [...messages, ...messages];
            
            displayMessages.forEach((msg, index) => {
                html += `<span class="ticker-item">${msg}</span>`;
                if (index < displayMessages.length - 1) {
                    html += '<span class="ticker-separator">•</span>';
                }
            });
            
            this.content.innerHTML = html;
        },
        
        // Public method to update messages
        updateMessages: function(newMessages) {
            CONFIG.TICKER_MESSAGES = newMessages;
            this.build();
        },
        
        // Public method to add a message
        addMessage: function(message) {
            CONFIG.TICKER_MESSAGES.push(message);
            this.build();
        }
    };

    // ========================================
    // MOBILE NAVIGATION
    // ========================================
    
    const MobileNav = {
        toggle: null,
        nav: null,
        isOpen: false,
        
        init: function() {
            this.toggle = document.getElementById('navToggle');
            this.nav = document.getElementById('mainNav');
            
            if (!this.toggle || !this.nav) return;
            
            // Toggle click
            this.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNav();
            });
            
            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeNav();
                }
            });
            
            // Close on clicking outside
            document.addEventListener('click', (e) => {
                if (this.isOpen && 
                    !this.nav.contains(e.target) && 
                    !this.toggle.contains(e.target)) {
                    this.closeNav();
                }
            });
            
            // Close nav when clicking a link
            const links = this.nav.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeNav();
                });
            });
            
            // Handle resize
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT && this.isOpen) {
                    this.closeNav();
                }
            }, 250));
        },
        
        toggleNav: function() {
            this.isOpen = !this.isOpen;
            this.toggle.classList.toggle('active', this.isOpen);
            this.nav.classList.toggle('active', this.isOpen);
            
            // Prevent body scroll when nav is open
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
            
            // Update aria attributes
            this.toggle.setAttribute('aria-expanded', this.isOpen.toString());
        },
        
        closeNav: function() {
            if (!this.isOpen) return;
            this.isOpen = false;
            this.toggle.classList.remove('active');
            this.nav.classList.remove('active');
            document.body.style.overflow = '';
            this.toggle.setAttribute('aria-expanded', 'false');
        },
        
        openNav: function() {
            if (this.isOpen) return;
            this.isOpen = true;
            this.toggle.classList.add('active');
            this.nav.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.toggle.setAttribute('aria-expanded', 'true');
        }
    };

    // ========================================
    // SEASONAL HERO
    // ========================================
    
    const SeasonalHero = {
        hero: null,
        background: null,
        indicator: null,
        currentSeason: null,
        dots: [],
        
        init: function() {
            this.hero = document.getElementById('heroSection');
            this.background = document.getElementById('heroBackground');
            this.indicator = document.getElementById('seasonIndicator');
            
            if (!this.hero || !this.background) return;
            
            // Determine current season
            this.currentSeason = this.getCurrentSeason();
            
            // Apply season
            this.applySeason(this.currentSeason);
            
            // Setup indicator
            if (this.indicator) {
                this.setupIndicator();
            }
            
            // Add transition class after initial load
            setTimeout(() => {
                this.background.style.transition = 'opacity 500ms ease';
            }, 100);
        },
        
        getCurrentSeason: function() {
            const month = utils.getCurrentMonth();
            
            if (CONFIG.SEASONS.spring.months.includes(month)) {
                return 'spring';
            }
            return 'autumn';
        },
        
        applySeason: function(season) {
            this.background.setAttribute('data-season', season);
            this.currentSeason = season;
            
            // Update indicator dots
            this.updateIndicatorDots();
        },
        
        setupIndicator: function() {
            this.dots = this.indicator.querySelectorAll('.season-dot');
            
            this.dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const season = e.target.dataset.season;
                    if (season && season !== this.currentSeason) {
                        this.applySeason(season);
                    }
                });
                
                // Add keyboard support
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Saison wechseln zu ${CONFIG.SEASONS[dot.dataset.season]?.name || 'Frühling'}`);
                
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const season = dot.dataset.season;
                        if (season && season !== this.currentSeason) {
                            this.applySeason(season);
                        }
                    }
                });
            });
            
            this.updateIndicatorDots();
        },
        
        updateIndicatorDots: function() {
            this.dots.forEach(dot => {
                const isActive = dot.dataset.season === this.currentSeason;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        },
        
        // Public method to manually set season
        setSeason: function(season) {
            if (CONFIG.SEASONS[season]) {
                this.applySeason(season);
            }
        }
    };

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    
    const SmoothScroll = {
        init: function() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    };

    // ========================================
    // LAZY LOADING IMAGES
    // ========================================
    
    const LazyLoader = {
        init: function() {
            if ('IntersectionObserver' in window) {
                const imgObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            imgObserver.unobserve(img);
                        }
                    });
                }, {
                    rootMargin: '50px 0px'
                });
                
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imgObserver.observe(img);
                });
            }
        }
    };

    // ========================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================
    
    const Accessibility = {
        init: function() {
            // Add skip link
            this.addSkipLink();
            
            // Focus management
            this.handleFocus();
        },
        
        addSkipLink: function() {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Zum Hauptinhalt springen';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 0;
                background: #C41E3A;
                color: white;
                padding: 8px 16px;
                z-index: 10000;
                transition: top 0.3s;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '0';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            // Add main-content id to first section after header
            const firstSection = document.querySelector('section:not(.page-header)');
            if (firstSection) {
                firstSection.id = 'main-content';
                firstSection.setAttribute('tabindex', '-1');
            }
        },
        
        handleFocus: function() {
            // Remove focus outline on mouse click, keep for keyboard
            document.body.addEventListener('mousedown', () => {
                document.body.classList.add('mouse-user');
            });
            
            document.body.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.remove('mouse-user');
                }
            });
        }
    };

    // ========================================
    // INITIALIZE
    // ========================================
    
    function init() {
        // Initialize all components
        Ticker.init();
        MobileNav.init();
        SeasonalHero.init();
        SmoothScroll.init();
        LazyLoader.init();
        Accessibility.init();
        
        // Console welcome
        if (console && console.log) {
            console.log('%cSchöll GmbH', 'font-size: 24px; font-weight: bold; color: #C41E3A;');
            console.log('%cWebsite gestartet ✓', 'font-size: 14px; color: #1A1A1A;');
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose global API for debugging and updates
    window.SchoellApp = {
        config: CONFIG,
        ticker: Ticker,
        nav: MobileNav,
        hero: SeasonalHero,
        utils: utils
    };
    
})();
