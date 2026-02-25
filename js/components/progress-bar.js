import { State } from '../state.js';
import { curriculum } from '../data/curriculum.js';

export const ProgressBar = {
    render() {
        const container = document.getElementById('progress-header');
        if (!container) return;

        const total = curriculum.getTotalLessonCount();
        const progress = State.getTotalProgress(total);
        const level = State.getLevel();
        const xpInLevel = State.getXpInLevel();

        container.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary">Уровень ${level}</span>
                    <span class="small fw-bold text-nowrap">${State.data.xp} XP</span>
                </div>
                <div class="progress flex-grow-1" role="progressbar" style="height: 8px; width: 120px;">
                    <div class="progress-bar bg-info" style="width: ${xpInLevel}%"></div>
                </div>
                <!-- <span class="small text-muted">${Math.round(progress)}%</span> -->
            </div>
        `;

        // Reactively update
        State.on('xp-changed', () => this.render());
        State.on('lesson-completed', () => this.render());
        State.on('progress-reset', () => this.render());
    }
};
