import { State } from '../state.js';
import { curriculum } from '../data/curriculum.js';
import { Renderer } from '../renderer.js';

export const Sidebar = {
    render() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        const totalLessons = curriculum.getTotalLessonCount();
        const completedCount = State.getCompletedCount();
        const level = State.getLevel();

        let html = `
            <div class="d-flex flex-column h-100">
                <div class="p-3 border-bottom">
                    <a href="#/" class="d-flex align-items-center text-white text-decoration-none">
                        <span class="fs-4 fw-bold me-2">G</span>
                        <span class="fs-5 fw-bold">GoJourney</span>
                    </a>
                </div>

                <div class="p-3 border-bottom bg-body-tertiary">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-primary">Lvl ${level}</span>
                        <span class="badge bg-warning text-dark"><i class="bi bi-lightning-charge"></i> ${State.data.xp} XP</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                         <div class="progress-bar bg-success" role="progressbar" style="width: ${(completedCount / totalLessons) * 100}%"></div>
                    </div>
                    <small class="text-secondary mt-1 d-block">${completedCount} / ${totalLessons} уроков</small>
                </div>

                <div class="flex-grow-1 overflow-auto">
                    <div class="accordion accordion-flush" id="sidebarAccordion">
        `;

        curriculum.modules.forEach((mod, index) => {
            const completedInMod = State.getModuleCompletedCount(mod.lessons);
            const totalInMod = mod.lessons.length;
            const isComplete = completedInMod === totalInMod;
            const progress = Math.round((completedInMod / totalInMod) * 100);

            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${mod.id}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${mod.id}" aria-expanded="false" aria-controls="collapse${mod.id}">
                            <div class="d-flex w-100 align-items-center justify-content-between me-2">
                                <span class="me-2"><i class="bi ${mod.icon} module-icon"></i> ${mod.title}</span>
                                <span class="badge bg-${isComplete ? 'success' : 'secondary'} rounded-pill">${completedInMod}/${totalInMod}</span>
                            </div>
                        </button>
                    </h2>
                    <div id="collapse${mod.id}" class="accordion-collapse collapse" aria-labelledby="heading${mod.id}" data-bs-parent="#sidebarAccordion">
                        <div class="accordion-body p-0">
                            <div class="list-group list-group-flush">
            `;

            mod.lessons.forEach(lesson => {
                const completed = State.isLessonCompleted(lesson.id);
                html += `
                    <a href="#/lesson/${mod.id}/${lesson.id}" class="list-group-item list-group-item-action ${completed ? 'list-group-item-success' : ''}" data-lesson-id="${lesson.id}">
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <span>${lesson.title}</span>
                            ${completed ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-circle"></i>'}
                        </div>
                    </a>
                `;
            });

            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>

                <div class="p-3 border-top mt-auto">
                    <div class="d-flex justify-content-around">
                        <a href="#/" class="btn btn-outline-secondary btn-sm" title="Главная"><i class="bi bi-house"></i></a>
                        <a href="#/curriculum" class="btn btn-outline-secondary btn-sm" title="Программа"><i class="bi bi-journal-text"></i></a>
                        <a href="#/achievements" class="btn btn-outline-secondary btn-sm" title="Достижения"><i class="bi bi-trophy"></i></a>
                        <a href="#/settings" class="btn btn-outline-secondary btn-sm" title="Настройки"><i class="bi bi-gear"></i></a>
                    </div>
                </div>
            </div>
        `;

        sidebar.innerHTML = html;

        // No custom listeners needed for accordion, Bootstrap handles it.
        // We only listen for app state.

        State.on('lesson-completed', () => this.render());
        State.on('xp-changed', () => this._updateStats());
        State.on('progress-reset', () => this.render());
    },

    _renderUserStats(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="fw-bold" style="font-size: 13px; color: var(--color-text-primary);">Прогресс</span>
                <span class="badge text-bg-secondary rounded-pill" style="font-size: 11px;">Ур. ${State.getLevel()}</span>
            </div>
            <div class="progress mb-3" style="height: 4px; background-color: var(--color-bg-elevated);" role="progressbar">
                <div class="progress-bar" style="width: ${State.getXpInLevel()}%; background-color: var(--color-accent);"></div>
            </div>
            <div class="d-flex justify-content-between">
                <a href="#/achievements" class="btn btn-sm btn-link text-decoration-none p-0 text-muted" title="Достижения"><i class="bi bi-trophy"></i></a>
                <a href="#/" class="btn btn-sm btn-link text-decoration-none p-0 text-muted" title="Главная"><i class="bi bi-house"></i></a>
                <a href="#/settings" class="btn btn-sm btn-link text-decoration-none p-0 text-muted" title="Настройки"><i class="bi bi-gear"></i></a>
            </div>
        `;
    },

    _updateStats() {
        const userSection = document.querySelector('.user-profile-section');
        this._renderUserStats(userSection);
    },

    updateActive(pattern, params) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Clear active states
        sidebar.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active'));

        if (pattern === '/lesson/:moduleId/:lessonId' && params) {
            const lessonEl = sidebar.querySelector(`[data-lesson-id="${params.lessonId}"]`);
            if (lessonEl) {
                lessonEl.classList.add('active');
                // Open accordion
                const collapseId = `collapse${params.moduleId}`;
                const collapseEl = document.getElementById(collapseId);
                if (collapseEl) {
                    // Use Bootstrap API if available, or just class manipulation
                    collapseEl.classList.add('show');
                    const btn = document.querySelector(`[data-bs-target="#${collapseId}"]`);
                    if (btn) btn.classList.remove('collapsed');
                }
            }
        }
    },

    _updateStats() {
        // Re-render handled by full render for simplicity in this implementation
        this.render();
    }
};
