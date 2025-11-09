// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Enhanced scroll effects
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax effect for sections
    document.querySelectorAll('.section').forEach((section, index) => {
        const speed = (index + 1) * 0.1;
        section.style.transform = `translateY(${rate * speed}px)`;
    });

    // Dynamic header opacity based on scroll direction
    const header = document.querySelector('header');
    if (scrolled > lastScrollY && scrolled > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScrollY = scrolled;

    // Scale effect on cards based on scroll
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const windowCenter = window.innerHeight / 2;
        const distance = Math.abs(centerY - windowCenter);
        const scale = Math.max(0.8, 1 - distance / window.innerHeight);
        card.style.transform = `scale(${scale})`;
    });
});

// Header background change on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 1)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.9)';
    }
});

// Typing effect for the welcome message
const welcomeText = "Bem-vinda a Minha Bio :D";
const welcomeElement = document.querySelector('#inicio h1');
let i = 0;

function typeWriter() {
    if (i < welcomeText.length) {
        welcomeElement.innerHTML += welcomeText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}

// Start typing effect when page loads
window.addEventListener('load', () => {
    welcomeElement.innerHTML = '';
    typeWriter();
    loadPortfolioData();
});

function loadPortfolioData() {
    const data = JSON.parse(localStorage.getItem('portfolioData'));
    if (data) {
        document.getElementById('inicio-text').textContent = data.inicio.text;
        document.getElementById('inicio-img').src = data.inicio.img;

        for (let i = 1; i <= 3; i++) {
            document.getElementById(`projeto${i}-title`).textContent = data.projetos[i-1].title;
            document.getElementById(`projeto${i}-desc`).textContent = data.projetos[i-1].desc;
            document.getElementById(`projeto${i}-img`).src = data.projetos[i-1].img;
            document.getElementById(`projeto${i}-link`).href = data.projetos[i-1].link;

            // Make the card clickable
            const card = document.getElementById(`projeto${i}-link`).parentElement;
            card.style.cursor = 'pointer';
            card.onclick = () => window.open(data.projetos[i-1].link, '_blank');
        }

        if (data.contatos) {
            // Footer links
            document.getElementById('discord-link-footer').href = data.contatos.discord.startsWith('http') ? data.contatos.discord : `https://discord.gg/${data.contatos.discord}`;
            document.getElementById('tiktok-link-footer').href = data.contatos.tiktok.startsWith('http') ? data.contatos.tiktok : `https://tiktok.com/@${data.contatos.tiktok}`;
            document.getElementById('email-link-footer').href = `mailto:${data.contatos.email}`;
            document.getElementById('youtube-link-footer').href = data.contatos.youtube.startsWith('http') ? data.contatos.youtube : `https://youtube.com/@${data.contatos.youtube}`;
        }
    }
}

// Mouse follow effect for cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Particle effect (simple)
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 5000);
}

setInterval(createParticle, 200);

// Add particle styles dynamically
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(0, 255, 0, 0.5);
        border-radius: 50%;
        pointer-events: none;
        animation: float 5s linear infinite;
        top: 100vh;
    }

    @keyframes float {
        to {
            transform: translateY(-100vh);
        }
    }

    .card {
        background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 0, 0.1), rgba(0, 0, 0, 0.8));
    }
`;
document.head.appendChild(particleStyle);
