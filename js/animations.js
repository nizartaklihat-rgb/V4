class LMAJHOLAnimations {
    constructor() { gsap.registerPlugin(ScrollTrigger); this.init(); }
    init() { this.setupPreloader(); this.setupHeroAnimations(); this.setupScrollAnimations(); this.setupMicroInteractions(); }
    setupPreloader() {
        const preloader = document.getElementById('preloader');
        const fill = document.querySelector('.preloader-fill');
        if (!preloader || !fill) return;
        gsap.to(fill, { width: '100%', duration: 2, ease: 'power2.inOut', onComplete: () => {
            gsap.to(preloader, { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => { preloader.classList.add('loaded'); this.animateHeroEntrance(); } });
        }});
    }
    animateHeroEntrance() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to('.hero-overline', { opacity: 1, y: 0, duration: 0.8, delay: 0.2 })
          .to('.hero-title-line', { opacity: 1, y: 0, duration: 1, ease: 'power4.out' }, '-=0.4')
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
          .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
          .to('.hero-scroll-indicator', { opacity: 1, duration: 1 }, '-=0.2');
    }
    setupHeroAnimations() {
        gsap.to('.hero-content', { yPercent: 30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    setupScrollAnimations() {
        this.animateSectionHeaders();
        this.animateProductCards();
        this.animateShowcase();
        this.animateAbout();
        this.animateOrder();
    }
    animateSectionHeaders() {
        gsap.utils.toArray('.section-header').forEach(header => {
            const number = header.querySelector('.section-number');
            const title = header.querySelector('.section-title');
            const desc = header.querySelector('.section-desc');
            const tl = gsap.timeline({ scrollTrigger: { trigger: header, start: 'top 80%', toggleActions: 'play none none reverse' } });
            if (number) tl.from(number, { opacity: 0, y: 20, duration: 0.6 });
            if (title) tl.from(title, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.3');
            if (desc) tl.from(desc, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
        });
    }
    animateProductCards() {
        gsap.utils.toArray('.product-card').forEach((card, i) => {
            gsap.from(card, { opacity: 0, y: 60, duration: 0.8, delay: i * 0.15, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' } });
        });
    }
    animateShowcase() {
        const showcase = document.querySelector('.showcase-section');
        if (!showcase) return;
        gsap.from(showcase.querySelector('.showcase-text'), { opacity: 0, x: -50, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: showcase, start: 'top 60%', toggleActions: 'play none none reverse' } });
        showcase.querySelectorAll('.spec').forEach((spec, i) => {
            gsap.from(spec, { opacity: 0, y: 30, duration: 0.6, delay: 0.3 + i * 0.15, ease: 'power3.out', scrollTrigger: { trigger: showcase, start: 'top 60%', toggleActions: 'play none none reverse' } });
        });
    }
    animateAbout() {
        const section = document.querySelector('.about-section');
        if (!section) return;
        gsap.from(section.querySelector('.about-left'), { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } });
        section.querySelectorAll('.about-text').forEach((t, i) => gsap.from(t, { opacity: 0, y: 20, duration: 0.6, delay: 0.2 + i * 0.1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } }));
    }
    animateOrder() {
        const section = document.querySelector('.order-section');
        if (!section) return;
        gsap.from(section.querySelector('.order-left'), { opacity: 0, x: -30, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } });
        gsap.from(section.querySelector('.order-form'), { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } });
    }
    setupMicroInteractions() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.02, duration: 0.3 }));
            btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.3 }));
        });
        const navbar = document.getElementById('navbar');
        if (navbar) ScrollTrigger.create({ start: 'top -80', end: 99999, toggleClass: { className: 'scrolled', targets: navbar } });
    }
}
document.addEventListener('DOMContentLoaded', () => { window.lmajholAnimations = new LMAJHOLAnimations(); });
