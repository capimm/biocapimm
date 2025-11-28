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

// Project items reveal animation
const projectObserverOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('reveal');
            }, index * 150);
        }
    });
}, projectObserverOptions);

// Observe project items
document.querySelectorAll('.project-item').forEach(item => {
    projectObserver.observe(item);
});

// Download functionality
document.querySelectorAll('.download-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const projectName = this.getAttribute('data-project');

        // Generate password based on project name (e.g., projeto6 -> @a@_6)
        const projectNumber = projectName.replace('projeto', '');
        const expectedPassword = '@a@_@'.slice(0, -1) + projectNumber;

        // Show password modal
        showPasswordModal(projectName, expectedPassword);
    });
});

// Password modal functionality
function showPasswordModal(projectName, expectedPassword) {
    const modal = document.getElementById('password-modal');
    const projectNameSpan = document.getElementById('password-project-name');
    const passwordInput = document.getElementById('password-input');
    const confirmBtn = document.getElementById('password-confirm');
    const cancelBtn = document.getElementById('password-cancel');

    // Set project name in modal
    projectNameSpan.textContent = projectName;

    // Clear previous input
    passwordInput.value = '';

    // Show modal
    modal.classList.add('show');

    // Focus on input
    setTimeout(() => passwordInput.focus(), 300);

    // Handle confirm button
    const handleConfirm = () => {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === expectedPassword) {
            hidePasswordModal();
            initiateDownload(projectName);
        } else {
            showNotification('Senha incorreta. Tente novamente.', 'error');
            passwordInput.focus();
            passwordInput.select();
        }
    };

    // Handle cancel button
    const handleCancel = () => {
        hidePasswordModal();
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    passwordInput.addEventListener('keypress', handleKeyPress);

    // Remove event listeners when modal is hidden
    function hidePasswordModal() {
        modal.classList.remove('show');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        passwordInput.removeEventListener('keypress', handleKeyPress);
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            handleCancel();
        }
    });

    // Password toggle functionality
    const passwordToggle = document.getElementById('toggle-password');
    const toggleHandler = () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
        passwordToggle.title = type === 'password' ? 'Mostrar senha' : 'Ocultar senha';
    };

    passwordToggle.addEventListener('click', toggleHandler);

    // Update hidePasswordModal to remove toggle listener
    const originalHidePasswordModal = hidePasswordModal;
    hidePasswordModal = () => {
        originalHidePasswordModal();
        passwordToggle.removeEventListener('click', toggleHandler);
    };
}

function initiateDownload(projectName) {
    // Simulate download (replace with actual download URLs)
    const downloadUrls = {
        'projeto1': 'https://example.com/download/projeto1.zip',
        'projeto2': 'https://example.com/download/projeto2.zip',
        'projeto3': 'https://example.com/download/projeto3.zip',
        'projeto4': 'https://example.com/download/projeto4.zip',
        'projeto5': 'https://example.com/download/projeto5.zip',
        'projeto6': 'https://example.com/download/projeto6.zip'
    };

    const url = downloadUrls[projectName];
    if (url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        showNotification(`Download do ${projectName} iniciado!`, 'success');
    } else {
        showNotification('Link de download não disponível.', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
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



// Mouse interaction effects
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Subtle parallax on hero elements
    const projectIcon = document.querySelector('.project-icon');
    if (projectIcon) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        projectIcon.style.transform = `translate(${moveX}px, ${moveY}px)`;
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
document.querySelectorAll('a, button, .project-item, .download-button').forEach(element => {
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
