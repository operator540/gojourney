const STORAGE_KEY = 'gojourney_state';

export const State = {
    data: {
        completedLessons: {},
        quizScores: {},
        achievements: [],
        xp: 0,
        streak: 0,
        lastActiveDate: null,
        editorCode: {},
        settings: {
            fontSize: 14,
            sidebarCollapsed: false,
        }
    },

    listeners: new Map(),

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = this._deepMerge(this.data, parsed);
            }
        } catch (e) {
            console.warn('GoJourney: Failed to load state', e);
        }
        this._updateStreak();
    },

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn('GoJourney: Failed to save state', e);
        }
    },

    // === Getters ===
    isLessonCompleted(lessonId) {
        return !!this.data.completedLessons[lessonId];
    },

    getQuizScore(lessonId) {
        return this.data.quizScores[lessonId] || null;
    },

    getModuleProgress(moduleId, lessons) {
        if (!lessons || lessons.length === 0) return 0;
        const completed = lessons.filter(l => this.data.completedLessons[l.id]).length;
        return Math.round((completed / lessons.length) * 100);
    },

    getModuleCompletedCount(lessons) {
        if (!lessons) return 0;
        return lessons.filter(l => this.data.completedLessons[l.id]).length;
    },

    getTotalProgress(totalLessons) {
        const completed = Object.keys(this.data.completedLessons).length;
        return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    },

    getCompletedCount() {
        return Object.keys(this.data.completedLessons).length;
    },

    getLevel() {
        return Math.floor(this.data.xp / 100) + 1;
    },

    getXpInLevel() {
        return this.data.xp % 100;
    },

    hasAchievement(id) {
        return this.data.achievements.includes(id);
    },

    // === Mutations ===
    completeLesson(lessonId, xpReward = 10) {
        if (this.data.completedLessons[lessonId]) return;

        this.data.completedLessons[lessonId] = Date.now();
        this.data.xp += xpReward;
        this.save();
        this.emit('lesson-completed', lessonId);
        this.emit('xp-changed', this.data.xp);
        this.emit('progress-changed');
    },

    saveQuizScore(lessonId, score, total) {
        const existing = this.data.quizScores[lessonId];
        const attempts = existing ? existing.attempts + 1 : 1;

        this.data.quizScores[lessonId] = { score, total, attempts, date: Date.now() };

        // XP: 5 per correct answer (first attempt only)
        if (!existing) {
            this.data.xp += score * 5;
            this.emit('xp-changed', this.data.xp);
        }

        this.save();
        this.emit('quiz-completed', { lessonId, score, total });
    },

    saveEditorCode(lessonId, code) {
        this.data.editorCode[lessonId] = code;
        this.save();
    },

    getEditorCode(lessonId) {
        return this.data.editorCode[lessonId] || null;
    },

    unlockAchievement(achievement) {
        if (this.data.achievements.includes(achievement.id)) return;

        this.data.achievements.push(achievement.id);
        this.data.xp += achievement.xpBonus || 0;
        this.save();
        this.emit('achievement-unlocked', achievement);
        this.emit('xp-changed', this.data.xp);
    },

    updateSettings(key, value) {
        this.data.settings[key] = value;
        this.save();
        this.emit('settings-changed', { key, value });
    },

    // === Progress export/import ===
    exportData() {
        return JSON.stringify(this.data, null, 2);
    },

    importData(json) {
        try {
            const parsed = JSON.parse(json);
            this.data = this._deepMerge(this.data, parsed);
            this.save();
            this.emit('data-imported');
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    },

    resetProgress() {
        localStorage.removeItem(STORAGE_KEY);
        this.data = {
            completedLessons: {},
            quizScores: {},
            achievements: [],
            xp: 0,
            streak: 0,
            lastActiveDate: null,
            editorCode: {},
            settings: this.data.settings,
        };
        this.save();
        this.emit('progress-reset');
    },

    // === Pub/Sub ===
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
        return () => this.off(event, callback);
    },

    off(event, callback) {
        const cbs = this.listeners.get(event);
        if (cbs) {
            const idx = cbs.indexOf(callback);
            if (idx > -1) cbs.splice(idx, 1);
        }
    },

    emit(event, data) {
        const cbs = this.listeners.get(event);
        if (cbs) cbs.forEach(cb => cb(data));
    },

    // === Internal ===
    _updateStreak() {
        const today = new Date().toDateString();
        const last = this.data.lastActiveDate;

        if (!last) {
            this.data.streak = 1;
        } else if (last === today) {
            // Same day, no change
            return;
        } else {
            const lastDate = new Date(last);
            const diff = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                this.data.streak += 1;
            } else {
                this.data.streak = 1;
            }
        }

        this.data.lastActiveDate = today;
        this.save();
    },

    _deepMerge(target, source) {
        const output = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
                && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
                output[key] = this._deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
        return output;
    }
};
