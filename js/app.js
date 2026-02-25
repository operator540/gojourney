import { Router } from './router.js';
import { State } from './state.js';
import { Sidebar } from './components/sidebar.js';
import { ProgressBar } from './components/progress-bar.js';
import { AchievementPopup } from './components/achievement-popup.js';
import { Search } from './components/search.js';
import { achievements } from './data/achievements.js';
import { curriculum } from './data/curriculum.js';

const App = {
    init() {
        State.load();

        // Register routes
        Router.register('/', () => import('./pages/home.js'));
        Router.register('/curriculum', () => import('./pages/curriculum.js'));
        Router.register('/achievements', () => import('./pages/achievements.js'));
        Router.register('/settings', () => import('./pages/settings.js'));
        Router.register('/lesson/:moduleId/:lessonId', () => import('./pages/lesson.js'));

        // Init components
        Sidebar.render();
        ProgressBar.render();
        AchievementPopup.init();
        Search.init();

        // Route navigation callback — update sidebar active state
        Router.onNavigate((pattern, params) => {
            Sidebar.updateActive(pattern, params);
        });

        // Achievement checking on state changes
        State.on('lesson-completed', () => this.checkAchievements());
        State.on('quiz-completed', () => this.checkAchievements());
        State.on('xp-changed', () => this.checkAchievements());

        // Mobile sidebar toggle
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('visible');
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('visible');
            });
        }

        // Init router (triggers first page load)
        Router.init();

        console.log(`%c GoJourney %c v1.0 `,
            'background: #d97706; color: white; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
            'background: #00add8; color: white; padding: 2px 6px; border-radius: 0 4px 4px 0;'
        );
        console.log(`${curriculum.getTotalLessonCount()} уроков, ~${Math.round(curriculum.getTotalTime() / 60)} часов контента`);
    },

    checkAchievements() {
        for (const achievement of achievements) {
            if (!State.hasAchievement(achievement.id) && achievement.condition(State.data)) {
                State.unlockAchievement(achievement);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
