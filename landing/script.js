/* ============================================
   COLLEGE FAST FORWARD - ANIMATIONS & INTERACTIVITY
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initScrollAnimations();
    initNavigation();
    initCounters();
    initFAQ();
    initFormSubmission();
    initParallax();
    initStatBars();
});

/* ============================================
   PARTICLE SYSTEM
   ============================================ */
function initParticles() {
    const container = document.getElementById('particles-container');
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 20;
    const opacity = Math.random() * 0.5 + 0.2;

    // Random color
    const colors = [
        'rgba(79, 125, 243, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(255, 255, 255, 0.6)'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        opacity: ${opacity};
    `;

    container.appendChild(particle);
}

/* ============================================
   SCROLL ANIMATIONS (Custom AOS)
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });

    // Special observer for stat cards
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-card').forEach(el => {
        statObserver.observe(el);
    });
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class when past hero
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Make scrollToSection globally available
window.scrollToSection = scrollToSection;

/* ============================================
   ANIMATED COUNTERS
   ============================================ */
function initCounters() {
    const counters = document.querySelectorAll('.counter');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const counter = setInterval(() => {
        frame++;
        const progress = easeOutQuart(frame / totalFrames);
        const currentCount = Math.round(target * progress);

        element.textContent = currentCount;

        if (frame === totalFrames) {
            clearInterval(counter);
            element.textContent = target;
        }
    }, frameDuration);
}

// Easing function for smooth animation
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

/* ============================================
   STAT BARS
   ============================================ */
function initStatBars() {
    const statCards = document.querySelectorAll('.stat-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target.querySelector('.stat-bar-fill');
                if (bar) {
                    setTimeout(() => {
                        bar.style.width = bar.style.getPropertyValue('--fill-width');
                    }, 500);
                }
            }
        });
    }, { threshold: 0.5 });

    statCards.forEach(card => {
        observer.observe(card);
    });
}

/* ============================================
   FAQ ACCORDION
   ============================================ */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

/* ============================================
   FORM SUBMISSION
   ============================================ */
function initFormSubmission() {
    const form = document.getElementById('signupForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = form.querySelector('input[type="email"]').value;
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;

            // Loading state
            submitBtn.innerHTML = `
                <span>Joining...</span>
                <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
            `;
            submitBtn.style.pointerEvents = 'none';

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Success state
            submitBtn.innerHTML = `
                <span>Welcome to the Network!</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            // Show success message
            showNotification('Check your email for next steps!', 'success');

            // Reset after delay
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.style.pointerEvents = '';
                form.reset();
            }, 3000);
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--glass-bg)'};
        border: 1px solid ${type === 'success' ? '#10b981' : 'var(--glass-border)'};
        border-radius: 12px;
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideIn 0.5s ease;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);

    const closeBtn = notification.querySelector('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/* ============================================
   PARALLAX EFFECTS
   ============================================ */
function initParallax() {
    const orbs = document.querySelectorAll('.gradient-orb');

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 15;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // Parallax on scroll for certain elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // Hero visual parallax
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }

        // Section title parallax
        document.querySelectorAll('.section-title').forEach(title => {
            const rect = title.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                title.style.transform = `translateY(${(1 - progress) * 20}px)`;
            }
        });
    });
}

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

/* ============================================
   TYPING EFFECT FOR HERO (Optional enhancement)
   ============================================ */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/* ============================================
   NETWORK VISUALIZATION ENHANCEMENTS
   ============================================ */
// Add connection lines between nodes
function initNetworkLines() {
    const visualization = document.querySelector('.network-visualization');
    if (!visualization) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    `;
    visualization.insertBefore(canvas, visualization.firstChild);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = visualization.offsetWidth;
        canvas.height = visualization.offsetHeight;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw pulsing circles
        const time = Date.now() * 0.001;

        for (let i = 0; i < 3; i++) {
            const radius = 50 + i * 60 + Math.sin(time + i) * 10;
            const alpha = 0.1 - i * 0.03;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(79, 125, 243, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
}

// Initialize network lines after DOM load
setTimeout(initNetworkLines, 100);

/* ============================================
   SCROLL PROGRESS INDICATOR
   ============================================ */
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #4f7df3, #8b5cf6, #ec4899);
        z-index: 10001;
        transition: width 0.1s ease;
        border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

initScrollProgress();

/* ============================================
   CURSOR GLOW EFFECT (Desktop only)
   ============================================ */
function initCursorGlow() {
    if (window.innerWidth < 1024) return;

    const glow = document.createElement('div');
    glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(79, 125, 243, 0.1), transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform: translate(-50%, -50%);
    `;
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;

        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;

        requestAnimationFrame(animate);
    }

    animate();
}

initCursorGlow();

/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.hero [data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
    }, 300);
});

/* ============================================
   CONSOLE EASTER EGG
   ============================================ */
console.log(`
%c⚡ College Fast Forward %c

Welcome to the UF Family Network!
Built with passion for Gator families.

`, 'color: #4f7df3; font-size: 24px; font-weight: bold;', 'color: #8b5cf6; font-size: 14px;');
