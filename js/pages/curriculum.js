import { State } from '../state.js';
import { curriculum } from '../data/curriculum.js';
import { Renderer } from '../renderer.js';

export default {
    render(container) {
        const total = curriculum.getTotalLessonCount();
        const completed = State.getCompletedCount();
        const totalTime = curriculum.getTotalTime();

        container.innerHTML = `
            <div class="content-inner">
                <div class="breadcrumb">
                    <a href="#/">Главная</a>
                    <span class="breadcrumb-sep">›</span>
                    <span class="breadcrumb-current">Программа</span>
                </div>

                <h1 class="page-title animate-in">Учебная программа</h1>
                <p class="page-subtitle animate-in stagger-1">
                    ${curriculum.modules.length} модулей · ${total} уроков · ~${Renderer.formatTime(totalTime)}
                </p>

                <div class="curriculum-grid">
                    ${curriculum.modules.map((mod, i) => {
                        const progress = State.getModuleProgress(mod.id, mod.lessons);
                        const completedInMod = State.getModuleCompletedCount(mod.lessons);
                        const modTime = mod.lessons.reduce((s, l) => s + (l.time || 0), 0);
                        const circumference = 2 * Math.PI * 24;
                        const dashoffset = circumference - (progress / 100) * circumference;
                        const isComplete = progress === 100;

                        return `
                            <div class="module-progress-card animate-in stagger-${Math.min(i + 2, 10)}" onclick="location.hash='#/lesson/${mod.id}/${mod.lessons[0].id}'">
                                <div class="progress-ring ${isComplete ? 'complete' : ''}">
                                    <svg viewBox="0 0 56 56">
                                        <circle class="ring-bg" cx="28" cy="28" r="24"/>
                                        <circle class="ring-fill" cx="28" cy="28" r="24"
                                            stroke-dasharray="${circumference}"
                                            stroke-dashoffset="${dashoffset}"/>
                                    </svg>
                                    <span class="progress-ring-label">${progress}%</span>
                                </div>
                                <div class="module-progress-info">
                                    <div class="module-progress-title"><i class="bi ${mod.icon}"></i> ${mod.title}</div>
                                    <div class="module-progress-desc">${mod.description}</div>
                                    <div class="module-progress-stats">
                                        ${completedInMod}/${mod.lessons.length} ${Renderer.pluralize(mod.lessons.length, ['урок','урока','уроков'])} · ${Renderer.formatTime(modTime)}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <style>
                .page-title { font-size: var(--fs-3xl); margin-bottom: var(--sp-2); }
                .page-subtitle { color: var(--text-muted); margin-bottom: var(--sp-8); font-size: var(--fs-lg); }
                .curriculum-grid { display: flex; flex-direction: column; gap: var(--sp-3); }
            </style>
        `;
    }
};
