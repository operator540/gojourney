import { State } from '../state.js';
import { achievements } from '../data/achievements.js';

export default {
    render(container) {
        const unlocked = State.data.achievements.length;
        const total = achievements.length;

        container.innerHTML = `
            <div class="content-inner">
                <div class="breadcrumb">
                    <a href="#/">Главная</a>
                    <span class="breadcrumb-sep">›</span>
                    <span class="breadcrumb-current">Достижения</span>
                </div>

                <h1 class="page-title animate-in">Достижения</h1>
                <p class="page-subtitle animate-in stagger-1">
                    Разблокировано: ${unlocked} из ${total}
                </p>

                <div class="achievements-grid">
                    ${achievements.map((a, i) => {
                        const isUnlocked = State.hasAchievement(a.id);
                        return `
                            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} animate-in stagger-${Math.min(i + 2, 10)}">
                                <div class="achievement-icon"><i class="bi ${a.icon}"></i></div>
                                <div class="achievement-title">${a.title}</div>
                                <div class="achievement-desc">${a.description}</div>
                                <div class="achievement-xp">+${a.xpBonus} XP</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <style>
                .page-title { font-size: var(--fs-3xl); margin-bottom: var(--sp-2); }
                .page-subtitle { color: var(--text-muted); margin-bottom: var(--sp-8); font-size: var(--fs-lg); }
            </style>
        `;
    }
};
