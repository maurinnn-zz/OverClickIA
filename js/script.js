/**
 * OverClick IA — script.js
 * Versão: 3.0.0
 *
 * Módulos:
 *   1. ScrollBar       — barra de progresso de scroll
 *   2. HeaderHandler   — efeito de scroll no header
 *   3. MobileMenu      — menu hamburger
 *   4. NavigationHandler — smooth scroll + nav ativa
 *   5. ThemeHandler    — alternância dark/light
 *   6. FormHandler     — validação + envio para n8n
 *   7. FadeObserver    — animação fade-up no scroll
 *   8. Init            — inicialização de todos os módulos
 */

'use strict';

/* ══════════════════════════════════════
   1. SCROLL BAR
══════════════════════════════════════ */
class ScrollBar {
    constructor() {
        this.bar = document.getElementById('scrollBar');
        if (!this.bar) return;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.update(), { passive: true });
    }

    update() {
        const scrollTop    = window.scrollY;
        const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        this.bar.style.width = scrollPercent + '%';
    }
}


/* ══════════════════════════════════════
   2. HEADER HANDLER
══════════════════════════════════════ */
class HeaderHandler {
    constructor() {
        this.header = document.getElementById('header');
        if (!this.header) return;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    }

    update() {
        this.header.classList.toggle('scrolled', window.scrollY > 50);
    }
}


/* ══════════════════════════════════════
   3. MOBILE MENU
══════════════════════════════════════ */
class MobileMenu {
    constructor() {
        this.menu      = document.getElementById('mobileMenu');
        this.openBtn   = document.getElementById('hamburger');
        this.closeBtn  = document.getElementById('mobileClose');
        this.links     = document.querySelectorAll('.mobile-links a');

        if (!this.menu) return;
        this.init();
    }

    init() {
        this.openBtn?.addEventListener('click',  () => this.open());
        this.closeBtn?.addEventListener('click', () => this.close());

        this.links.forEach(link => {
            link.addEventListener('click', () => this.close());
        });
    }

    open() {
        this.menu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.menu.classList.remove('open');
        document.body.style.overflow = '';
    }
}


/* ══════════════════════════════════════
   4. NAVIGATION HANDLER
══════════════════════════════════════ */
class NavigationHandler {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        // Smooth scroll em todos os links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // Destaque do link ativo conforme scroll
        window.addEventListener('scroll', () => this.updateActiveLink(), { passive: true });
        this.updateActiveLink();
    }

    updateActiveLink() {
        const scrollPos = window.scrollY + 120;

        this.sections.forEach(section => {
            const top    = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                const id = section.getAttribute('id');
                this.navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }
}


/* ══════════════════════════════════════
   5. THEME HANDLER
══════════════════════════════════════ */
class ThemeHandler {
    constructor() {
        this.btn   = document.getElementById('themeBtn');
        this.light = localStorage.getItem('theme') === 'light';

        if (!this.btn) return;

        if (this.light) this.applyLight();

        this.btn.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.light = !this.light;
        this.light ? this.applyLight() : this.applyDark();
        localStorage.setItem('theme', this.light ? 'light' : 'dark');
    }

    applyLight() {
        const r = document.documentElement;
        r.style.setProperty('--bg',      '#F4F4F8');
        r.style.setProperty('--bg2',     '#EAEAF0');
        r.style.setProperty('--card',    '#FFFFFF');
        r.style.setProperty('--card2',   '#F0F0F6');
        r.style.setProperty('--text',    '#0D0D14');
        r.style.setProperty('--text2',   '#4A4A6A');
        r.style.setProperty('--text3',   '#8888AA');
        r.style.setProperty('--border',  'rgba(0,0,0,0.08)');
        r.style.setProperty('--border2', 'rgba(0,0,0,0.15)');
        this.btn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    applyDark() {
        const r = document.documentElement;
        r.style.setProperty('--bg',      '#0D0D14');
        r.style.setProperty('--bg2',     '#11111C');
        r.style.setProperty('--card',    '#141420');
        r.style.setProperty('--card2',   '#1A1A2A');
        r.style.setProperty('--text',    '#F0EEF8');
        r.style.setProperty('--text2',   '#9897B4');
        r.style.setProperty('--text3',   '#5C5A78');
        r.style.setProperty('--border',  'rgba(255,255,255,0.07)');
        r.style.setProperty('--border2', 'rgba(255,255,255,0.12)');
        this.btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}


/* ══════════════════════════════════════
   6. FORM HANDLER
══════════════════════════════════════ */
class FormHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.options = {
            // ⚠️ Substitua pela sua URL real do n8n
            webhookUrl:     'http://localhost:5678/webhook-test/formulario-overclick',
            successMessage: '✅ Enviado! Nossa equipe entrará em contato em breve.',
            errorMessage:   '❌ Falha no envio. Fale conosco: (11) 92166-8441',
            ...options,
        };

        // Configuração dos campos e suas regras de validação
        this.fields = [
            {
                id:       'nome',
                errId:    'err-nome',
                validate: v => v.trim().length >= 3,
            },
            {
                id:       'email',
                errId:    'err-email',
                validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
            },
            {
                id:       'telefone',
                errId:    'err-telefone',
                validate: v => v.replace(/\D/g, '').length >= 10,
            },
            {
                id:       'empresa',
                errId:    'err-empresa',
                validate: v => v.trim().length >= 2,
            },
            {
                id:       'cargo',
                errId:    'err-cargo',
                validate: v => v.trim().length >= 2,
            },
        ];

        this.init();
    }

    init() {
        this.setupPhoneMask();
        this.setupInlineValidation();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    /* Máscara de telefone */
    setupPhoneMask() {
        const tel = document.getElementById('telefone');
        if (!tel) return;

        tel.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length <= 10) {
                v = v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = v;
        });
    }

    /* Limpa erro ao digitar */
    setupInlineValidation() {
        this.fields.forEach(({ id, errId }) => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('input', () => {
                input.classList.remove('err');
                const errEl = document.getElementById(errId);
                if (errEl) errEl.classList.remove('show');
            });
        });
    }

    /* Valida todos os campos, retorna true se tudo ok */
    validate() {
        let valid = true;

        this.fields.forEach(({ id, errId, validate }) => {
            const input = document.getElementById(id);
            const errEl = document.getElementById(errId);
            if (!input) return;

            if (!validate(input.value)) {
                input.classList.add('err');
                if (errEl) errEl.classList.add('show');
                valid = false;
            } else {
                input.classList.remove('err');
                if (errEl) errEl.classList.remove('show');
            }
        });

        return valid;
    }

    /* Coleta dados do formulário */
    getFormData() {
        const data = {};

        this.fields.forEach(({ id }) => {
            const input = document.getElementById(id);
            if (input) data[id] = input.value.trim();
        });

        // Campo opcional
        const interesse = document.getElementById('interesse');
        if (interesse) data.interesse = interesse.value;

        // Timestamp
        data.data_hora = new Date().toLocaleString('pt-BR', {
            timeZone:  'America/Sao_Paulo',
            day:       '2-digit',
            month:     '2-digit',
            year:      'numeric',
            hour:      '2-digit',
            minute:    '2-digit',
            second:    '2-digit',
        });

        return data;
    }

    /* Estado de loading do botão */
    setLoading(loading) {
        const btn     = document.getElementById('submitBtn');
        const txtEl   = document.getElementById('btnText');
        const loadEl  = document.getElementById('btnLoading');
        if (!btn) return;

        btn.disabled = loading;
        if (txtEl)  txtEl.style.display  = loading ? 'none'         : 'inline-flex';
        if (loadEl) loadEl.style.display = loading ? 'inline-flex'  : 'none';
    }

    /* Exibe mensagem global de feedback */
    showGlobalMessage(message, type = 'ok') {
        const el = document.getElementById('globalMsg');
        if (!el) return;

        el.textContent = message;
        el.className   = type;
        el.style.display = 'block';

        setTimeout(() => {
            el.style.display = 'none';
        }, 6000);
    }

    /* Envio do formulário */
    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validate()) return;

        this.setLoading(true);
        const data = this.getFormData();

        console.log('📊 Lead capturado:', data);

        try {
            const response = await fetch(this.options.webhookUrl, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this.showGlobalMessage(this.options.successMessage, 'ok');
            this.form.reset();

        } catch (err) {
            console.error('Erro no envio:', err);
            this.showGlobalMessage(this.options.errorMessage, 'fail');
        } finally {
            this.setLoading(false);
        }
    }
}


/* ══════════════════════════════════════
   7. FADE OBSERVER
══════════════════════════════════════ */
class FadeObserver {
    constructor() {
        this.elements = document.querySelectorAll('.fade-up');
        if (!this.elements.length) return;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.12 }
        );

        this.elements.forEach(el => observer.observe(el));
    }
}


/* ══════════════════════════════════════
   8. INICIALIZAÇÃO
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    new ScrollBar();
    new HeaderHandler();
    new MobileMenu();
    new NavigationHandler();
    new ThemeHandler();
    new FadeObserver();

    new FormHandler('contactForm', {
        // ⚠️ Substitua pela URL real do seu webhook n8n
        webhookUrl:     'http://localhost:5678/webhook-test/formulario-overclick',
        successMessage: '✅ Enviado! Nossa equipe entrará em contato em breve.',
        errorMessage:   '❌ Falha no envio. Fale conosco pelo WhatsApp: (11) 92166-8441',
    });
});


/* ══════════════════════════════════════
   EXPORT (para uso como módulo ES6)
══════════════════════════════════════ */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollBar,
        HeaderHandler,
        MobileMenu,
        NavigationHandler,
        ThemeHandler,
        FormHandler,
        FadeObserver,
    };
}
