// Main JavaScript - Loads sections, handles animations & interactions

document.addEventListener('DOMContentLoaded', () => {
    loadAllSections();
    setupScrollListeners();
    setupBackToTop();
    setupMobileMenu();
});

// ==========================================
// Load all HTML sections dynamically
// ==========================================
async function loadAllSections() {
    const sections = [
        { id: 'section-header', file: 'sections/header.html' },
        { id: 'section-hero', file: 'sections/hero.html' },
        { id: 'section-features', file: 'sections/features.html' },
        { id: 'section-stats', file: 'sections/stats.html' },
        { id: 'section-cards', file: 'sections/cards.html' },
        { id: 'section-testimonials', file: 'sections/testimonials.html' },
        { id: 'section-security', file: 'sections/security.html' },
        { id: 'section-cta', file: 'sections/cta.html' },
        { id: 'section-footer', file: 'sections/footer.html' },
    ];

    const loadPromises = sections.map(async (section) => {
        const container = document.getElementById(section.id);
        if (!container) return;
        try {
            const response = await fetch(section.file);
            if (response.ok) {
                const html = await response.text();
                container.innerHTML = html;
            } else {
                console.warn(`Failed to load ${section.file}: ${response.status}`);
            }
        } catch (error) {
            console.warn(`Error loading ${section.file}:`, error);
        }
    });

    await Promise.all(loadPromises);

    // Initialize features that depend on loaded sections
    initStatsCounter();
    initTestimonialsSlider();
    observeAnimatedElements();
    updateAllInternalLinks();
}

// ==========================================
// Scroll Listeners
// ==========================================
function setupScrollListeners() {
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.site-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    });
}

// ==========================================
// Back to Top
// ==========================================
function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ==========================================
// Mobile Menu
// ==========================================
function setupMobileMenu() {
    // Delegated event listener since header is loaded dynamically
    document.addEventListener('click', (e) => {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        const overlay = document.querySelector('.mobile-overlay');

        if (!menuBtn || !mobileNav) return;

        if (e.target.closest('.mobile-menu-btn')) {
            const isActive = menuBtn.classList.contains('active');
            if (isActive) {
                closeMobileMenu(menuBtn, mobileNav, overlay);
            } else {
                openMobileMenu(menuBtn, mobileNav, overlay);
            }
        }

        if (e.target.closest('.mobile-overlay')) {
            closeMobileMenu(menuBtn, mobileNav, overlay);
        }

        if (e.target.closest('.mobile-nav a')) {
            closeMobileMenu(menuBtn, mobileNav, overlay);
        }
    });
}

function openMobileMenu(btn, nav, overlay) {
    btn.classList.add('active');
    nav.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu(btn, nav, overlay) {
    btn.classList.remove('active');
    nav.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// Stats Counter Animation
// ==========================================
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number .count-up');
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    animateCounter(el);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    statNumbers.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    const duration = 2000;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (target - startValue) * eased;

        if (target >= 100) {
            el.textContent = Math.floor(current).toLocaleString();
        } else {
            el.textContent = current.toFixed(1);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (target >= 100) {
                el.textContent = target.toLocaleString();
            } else {
                el.textContent = target.toFixed(1);
            }
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// Testimonials Slider
// ==========================================
function initTestimonialsSlider() {
    const track = document.querySelector('.testimonials-track');
    const dots = document.querySelectorAll('.testimonials-dots button');
    const prevBtn = document.querySelector('.testimonials-arrow.prev');
    const nextBtn = document.querySelector('.testimonials-arrow.next');

    if (!track || dots.length === 0) return;

    let currentIndex = 0;
    const totalSlides = dots.length;
    let autoSlideInterval;

    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % totalSlides);
    }

    function prevSlide() {
        goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide();
        resetAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide();
        resetAutoSlide(); });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetAutoSlide();
        });
    });

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 4500);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
            resetAutoSlide();
        }
    });

    startAutoSlide();
    goToSlide(0);
}

// ==========================================
// Intersection Observer for animations
// ==========================================
function observeAnimatedElements() {
    const animatedElements = document.querySelectorAll(
        '.fade-up, .fade-in, .scale-in'
    );

    if (animatedElements.length === 0) {
        // Retry after a short delay (sections may still be loading)
        setTimeout(observeAnimatedElements, 300);
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    animatedElements.forEach((el) => observer.observe(el));
}

// ==========================================
// Update all links to point to 404 page
// ==========================================
function updateAllInternalLinks() {
    // All social media links, external-looking links, etc. go to 404
    const allLinks = document.querySelectorAll(
        'a[href="#"]:not([href^="#section"]), a.footer-social, .footer-social a, ' +
        '.footer-bottom-links a, .card-apply-link, .cta-btn, .mobile-nav a[href="#"]'
    );

    // Specifically target social media links and other redirect links
    document.querySelectorAll('a').forEach((link) => {
        const href = link.getAttribute('href');
        // Convert placeholder or social links to 404
        if (
            href === '#' &&
            (link.closest('.footer-social') ||
                link.closest('.footer-bottom-links') ||
                link.classList.contains('card-apply-link') ||
                link.closest('.mobile-nav'))
        ) {
            link.setAttribute('href', '404.html');
        }
    });

    // Ensure footer social links go to 404
    document.querySelectorAll('.footer-social a').forEach((link) => {
        link.setAttribute('href', '404.html');
    });

    // Ensure footer bottom links go to 404
    document.querySelectorAll('.footer-bottom-links a').forEach((link) => {
        link.setAttribute('href', '404.html');
    });

    // Card apply links
    document.querySelectorAll('.card-apply-link').forEach((link) => {
        link.setAttribute('href', '404.html');
    });

    // CTA buttons that are placeholders
    document.querySelectorAll('.cta-btn').forEach((link) => {
        if (link.getAttribute('href') === '#') {
            link.setAttribute('href', '404.html');
        }
    });

    // Mobile nav links
    document.querySelectorAll('.mobile-nav a').forEach((link) => {
        if (link.getAttribute('href') === '#') {
            link.setAttribute('href', '404.html');
        }
    });
}