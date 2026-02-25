import { State } from '../state.js';

export default {
    render(container) {
        container.innerHTML = `
            <div class="content-inner">
                <div class="breadcrumb">
                    <a href="#/">Главная</a>
                    <span class="breadcrumb-sep">›</span>
                    <span class="breadcrumb-current">Настройки</span>
                </div>

                <h1 class="page-title animate-in">Настройки</h1>

                <div class="settings-section animate-in stagger-1">
                    <h3>Редактор кода</h3>
                    <div class="settings-row">
                        <label>Размер шрифта: <span id="font-size-value">${State.data.settings.fontSize}px</span></label>
                        <input type="range" id="font-size-slider" min="12" max="24" value="${State.data.settings.fontSize}" step="1">
                    </div>
                </div>

                <div class="settings-section animate-in stagger-2">
                    <h3>Данные</h3>
                    <div class="settings-actions">
                        <button class="btn btn-secondary" id="export-btn"><i class="bi bi-download"></i> Экспорт прогресса</button>
                        <button class="btn btn-secondary" id="import-btn"><i class="bi bi-upload"></i> Импорт прогресса</button>
                        <button class="btn btn-secondary" style="color: var(--error)" id="reset-btn"><i class="bi bi-trash3"></i> Сбросить прогресс</button>
                    </div>
                    <textarea id="import-export-area" class="settings-textarea" placeholder="Данные для импорта/экспорта..." style="display:none"></textarea>
                </div>

                <div class="settings-section animate-in stagger-3">
                    <h3>Статистика</h3>
                    <div class="settings-stats">
                        <div>Пройдено уроков: <strong>${Object.keys(State.data.completedLessons).length}</strong></div>
                        <div>Пройдено квизов: <strong>${Object.keys(State.data.quizScores).length}</strong></div>
                        <div>Достижений: <strong>${State.data.achievements.length}</strong></div>
                        <div>XP: <strong>${State.data.xp}</strong></div>
                        <div>Серия дней: <strong>${State.data.streak}</strong></div>
                    </div>
                </div>
            </div>

            <style>
                .page-title { font-size: var(--fs-3xl); margin-bottom: var(--sp-8); }
                .settings-section {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--r-lg);
                    padding: var(--sp-6);
                    margin-bottom: var(--sp-6);
                }
                .settings-section h3 { margin-bottom: var(--sp-4); }
                .settings-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--sp-4);
                }
                .settings-row input[type="range"] { flex: 1; max-width: 200px; }
                .settings-actions { display: flex; gap: var(--sp-3); flex-wrap: wrap; }
                .settings-textarea {
                    width: 100%;
                    min-height: 120px;
                    margin-top: var(--sp-4);
                    padding: var(--sp-3);
                    font-family: var(--font-mono);
                    font-size: var(--fs-sm);
                    resize: vertical;
                }
                .settings-stats { display: flex; flex-direction: column; gap: var(--sp-2); color: var(--text-secondary); }
                .settings-stats strong { color: var(--text-primary); }
            </style>
        `;

        // Font size slider
        const slider = container.querySelector('#font-size-slider');
        const sizeLabel = container.querySelector('#font-size-value');
        slider?.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            sizeLabel.textContent = `${size}px`;
            State.updateSettings('fontSize', size);
        });

        // Export
        container.querySelector('#export-btn')?.addEventListener('click', () => {
            const area = container.querySelector('#import-export-area');
            area.style.display = 'block';
            area.value = State.exportData();
            area.select();
        });

        // Import
        container.querySelector('#import-btn')?.addEventListener('click', () => {
            const area = container.querySelector('#import-export-area');
            area.style.display = 'block';
            area.placeholder = 'Вставьте сюда JSON данные и нажмите Enter...';
            area.value = '';
            area.focus();
            area.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (State.importData(area.value)) {
                        area.value = 'Импорт успешен! Перезагрузите страницу.';
                    } else {
                        area.value = 'Ошибка импорта. Проверьте формат JSON.';
                    }
                }
            };
        });

        // Reset
        container.querySelector('#reset-btn')?.addEventListener('click', () => {
            if (confirm('Вы уверены? Весь прогресс будет удалён.')) {
                State.resetProgress();
                location.reload();
            }
        });
    }
};
