export const Renderer = {
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    escapeAttr(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');
    },

    mount(container, html, animate = true) {
        container.innerHTML = html;
        if (animate) {
            const children = container.querySelectorAll('.animate-in');
            children.forEach((el, i) => {
                el.style.animationDelay = `${i * 60}ms`;
            });
        }
    },

    createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },

    staggerChildren(container, selector, delayMs = 50) {
        const items = container.querySelectorAll(selector);
        items.forEach((item, i) => {
            item.style.animationDelay = `${i * delayMs}ms`;
            item.classList.add('animate-in');
        });
    },

    observeReveal(container) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return observer;
    },

    formatTime(minutes) {
        if (minutes < 60) return `${minutes} мин`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
    },

    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    pluralize(n, forms) {
        // forms = ['урок', 'урока', 'уроков']
        const abs = Math.abs(n) % 100;
        const n1 = abs % 10;
        if (abs > 10 && abs < 20) return forms[2];
        if (n1 > 1 && n1 < 5) return forms[1];
        if (n1 === 1) return forms[0];
        return forms[2];
    }
};
