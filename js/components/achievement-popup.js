import { State } from '../state.js';

export const AchievementPopup = {
    init() {
        State.on('achievement-unlocked', (achievement) => {
            this._showToast(achievement);
        });
    },

    _showToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-toast-icon"><i class="bi ${achievement.icon}"></i></div>
            <div class="achievement-toast-body">
                <div class="achievement-toast-title">Достижение разблокировано!</div>
                <div class="achievement-toast-name">${achievement.title}</div>
                <div class="achievement-toast-xp">+${achievement.xpBonus} XP</div>
            </div>
        `;
        document.body.appendChild(toast);

        // this._spawnConfetti();

        setTimeout(() => {
            toast.classList.add('slide-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 4000);
    },

    // Confetti removed
};
