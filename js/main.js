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
        
        // Hero slider images
        HERO_SLIDES: [
            { image: 'images/slider1.jpg', alt: 'Schöll GmbH Filiale' },
            { image: 'images/slider2.jpg', alt: 'Schöll Team bei der Arbeit' }
        ],
        
        // Auto-slide interval (ms)
        SLIDER_INTERVAL: 5000,
        
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
    // HERO SLIDER
    // ========================================
    
    const HeroSlider = {
        slider: null,
        slides: [],
        dots: [],
        currentSlide: 0,
        interval: null,
        
        init: function() {
            this.slider = document.getElementById('heroSlider');
            this.dotsContainer = document.getElementById('heroSliderDots');
            
            if (!this.slider) return;
            
            this.slides = this.slider.querySelectorAll('.hero-slide');
            
            if (this.slides.length === 0) return;
            
            // Setup dots
            if (this.dotsContainer) {
                this.setupDots();
            }
            
            // Start auto-slide
            this.startAutoSlide();
            
            // Pause on hover
            this.slider.addEventListener('mouseenter', () => {
                this.stopAutoSlide();
            });
            
            this.slider.addEventListener('mouseleave', () => {
                this.startAutoSlide();
            });
        },
        
        setupDots: function() {
            this.dots = this.dotsContainer.querySelectorAll('.slider-dot');
            
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.goToSlide(index);
                });
                
                // Keyboard support
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Zu Slide ${index + 1} wechseln`);
                
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.goToSlide(index);
                    }
                });
            });
        },
        
        goToSlide: function(index) {
            if (index === this.currentSlide) return;
            
            // Remove active class from current
            this.slides[this.currentSlide].classList.remove('active');
            if (this.dots[this.currentSlide]) {
                this.dots[this.currentSlide].classList.remove('active');
            }
            
            // Add active class to new
            this.currentSlide = index;
            this.slides[this.currentSlide].classList.add('active');
            if (this.dots[this.currentSlide]) {
                this.dots[this.currentSlide].classList.add('active');
            }
        },
        
        nextSlide: function() {
            const next = (this.currentSlide + 1) % this.slides.length;
            this.goToSlide(next);
        },
        
        startAutoSlide: function() {
            this.stopAutoSlide();
            this.interval = setInterval(() => {
                this.nextSlide();
            }, CONFIG.SLIDER_INTERVAL);
        },
        
        stopAutoSlide: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
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
        HeroSlider.init();
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
        hero: HeroSlider,
        utils: utils
    };
    
})();
