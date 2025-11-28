// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for section animations
const sectionObserverOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, sectionObserverOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

// Work items reveal animation
const workObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const workObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('reveal');
            }, index * 150);
        }
    });
}, workObserverOptions);

// Observe work items
document.querySelectorAll('.work-item').forEach(item => {
    workObserver.observe(item);
});

// Skills animation
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.skill-fill');
            fills.forEach(fill => {
                fill.style.width = fill.style.width || '0%';
            });
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-item').forEach(skill => {
    skillsObserver.observe(skill);
});

// Contact items animation
const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.contact-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    contactObserver.observe(item);
});

// Stats counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const target = parseInt(statNumber.textContent.replace(/[^\d]/g, ''));
            animateCounter(statNumber, 0, target, 2000);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current + (element.textContent.includes('+') ? '+' : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Enhanced scroll effects with parallax and sticky elements
let lastScrollY = window.scrollY;
let ticking = false;

function updateScrollEffects() {
    const scrolled = window.pageYOffset;

    // Dynamic navigation background
    const nav = document.querySelector('.main-nav');
    if (scrolled > 100) {
        nav.style.background = 'rgba(0, 0, 0, 0.95)';
        nav.style.backdropFilter = 'blur(20px)';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.8)';
    }

    // Active navigation link
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) {
                navLinks[index].classList.add('active');
            }
        }
    });

    // Enhanced parallax effect for floating elements
    const rate = scrolled * 0.5;
    document.querySelectorAll('.floating-element').forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        const parallaxY = rate * speed;
        const parallaxX = Math.sin(scrolled * 0.001 + index) * 10;
        element.style.transform = `translate(${parallaxX}px, ${parallaxY}px)`;
    });

    // Parallax for background elements
    document.querySelectorAll('.parallax-bg').forEach((bg, index) => {
        const speed = 0.3 + (index * 0.1);
        bg.style.transform = `translateY(${scrolled * speed}px)`;
    });

    // Sticky elements animation
    document.querySelectorAll('.sticky-element').forEach((element, index) => {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const windowHeight = window.innerHeight;

        if (scrolled > elementTop - windowHeight + 100 && scrolled < elementTop + elementHeight) {
            const progress = (scrolled - (elementTop - windowHeight + 100)) / (elementHeight + windowHeight - 200);
            element.style.transform = `translateY(${progress * 50}px)`;
            element.style.opacity = Math.max(0.3, 1 - progress * 0.5);
        }
    });

    // Fade-in/fade-out effects for sections
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const windowCenter = window.innerHeight / 2;
        const distance = Math.abs(centerY - windowCenter);
        const maxDistance = window.innerHeight / 2;

        if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance) * 0.3;
            const scale = 0.95 + (1 - distance / maxDistance) * 0.05;
            section.style.opacity = opacity;
            section.style.transform = `scale(${scale})`;
        } else {
            section.style.opacity = '0.7';
            section.style.transform = 'scale(0.95)';
        }
    });

    lastScrollY = scrolled;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
});

// Loading animation
window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading');
        loading.classList.add('hidden');
        setTimeout(() => {
            loading.style.display = 'none';
        }, 1200);
    }, 1000);
});

// Mouse interaction effects
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Subtle parallax on hero elements
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

// Custom cursor effect (optional enhancement)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid #00ff00;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
    mix-blend-mode: difference;
`;
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
});

document.addEventListener('mousedown', () => {
    cursor.style.transform = 'scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'scale(1)';
});

// Hover effects for interactive elements
document.querySelectorAll('a, button, .work-item, .contact-item').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = '#ffffff';
    });

    element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = '#00ff00';
    });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize all animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.hero-title .line').forEach((line, index) => {
            setTimeout(() => {
                line.style.animationPlayState = 'running';
            }, index * 200);
        });
    }, 500);
});
