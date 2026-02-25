export const Router = {
    routes: [],
    currentRoute: null,
    currentParams: null,
    _onNavigateCallbacks: [],

    init() {
        window.addEventListener('hashchange', () => this.resolve());
        // Resolve immediately — don't wait for load event
        this.resolve();
    },

    register(pattern, loader) {
        const paramNames = [];
        const regexStr = pattern.replace(/:(\w+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
        });
        this.routes.push({
            pattern,
            loader,
            regex: new RegExp(`^${regexStr}$`),
            paramNames
        });
    },

    async resolve() {
        const hash = location.hash.slice(1) || '/';

        for (const route of this.routes) {
            const match = hash.match(route.regex);
            if (match) {
                const params = {};
                route.paramNames.forEach((name, i) => {
                    params[name] = decodeURIComponent(match[i + 1]);
                });

                this.currentRoute = route.pattern;
                this.currentParams = params;

                const content = document.getElementById('content');
                if (content) {
                    content.classList.add('transitioning');

                    await new Promise(r => setTimeout(r, 150));

                    try {
                        const module = await route.loader();
                        const page = module.default || module;
                        await page.render(content, params);
                    } catch (err) {
                        console.error('Route error:', err);
                        content.innerHTML = `
                            <div class="content-inner">
                                <div class="empty-state">
                                    <div class="empty-state-icon"><i class="bi bi-search"></i></div>
                                    <div class="empty-state-title">Страница не найдена</div>
                                    <p>Проверьте URL или вернитесь на главную</p>
                                    <a href="#/" class="btn btn-primary" style="margin-top:1rem">На главную</a>
                                </div>
                            </div>
                        `;
                    }

                    content.classList.remove('transitioning');
                }

                this._onNavigateCallbacks.forEach(cb => cb(route.pattern, params));
                return;
            }
        }

        this.navigate('/');
    },

    navigate(path) {
        location.hash = path;
    },

    onNavigate(callback) {
        this._onNavigateCallbacks.push(callback);
    },

    getCurrentLesson() {
        if (this.currentRoute === '/lesson/:moduleId/:lessonId') {
            return this.currentParams;
        }
        return null;
    }
};
