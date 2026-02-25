import { State } from '../state.js';
import { curriculum } from '../data/curriculum.js';
import { Renderer } from '../renderer.js';

export default {
    render(container) {
        const total = curriculum.getTotalLessonCount();
        const completed = State.getCompletedCount();
        const level = State.getLevel();
        const streak = State.data.streak;

        // Find next uncompleted lesson
        const allLessons = curriculum.getAllLessons();
        const nextLesson = allLessons.find(l => !State.isLessonCompleted(l.id));

        container.innerHTML = `
            <div class="home-wrapper animate-in">
                <!-- Hero Section -->
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="hero-badge animate-scale-in">
                            <span class="badge-dot"></span>
                            v1.0 Release
                        </div>
                        <h1 class="hero-title">
                            Master <span class="hero-go">Go</span> Programming
                        </h1>
                        <p class="hero-subtitle animate-in stagger-1">
                            Интерактивный курс для разработчиков. <br class="d-none d-md-block">
                            От "Hello World" до микросервисов и архитектуры.
                        </p>

                        <div class="hero-actions animate-in stagger-2">
                             ${nextLesson ? `
                                <a href="#/lesson/${nextLesson.moduleId}/${nextLesson.id}" class="btn btn-primary btn-lg">
                                    ${completed === 0 ? 'Начать бесплатно' : 'Продолжить обучение'}
                                    <i class="bi bi-arrow-right ms-2"></i>
                                </a>
                            ` : `<button class="btn btn-success btn-lg"><i class="bi bi-check-circle me-2"></i>Курс пройден!</button>`}
                            <a href="https://github.com/golang/go" target="_blank" class="btn btn-outline-secondary btn-lg">
                                <i class="bi bi-github me-2"></i> GitHub
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid animate-in stagger-3">
                    <div class="stat-item">
                        <div class="stat-label">Уровень</div>
                        <div class="stat-value stat-accent">${level}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Прогресс</div>
                        <div class="stat-value">${completed}/${total}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">XP</div>
                        <div class="stat-value stat-warning">${State.data.xp}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Стрик</div>
                        <div class="stat-value">${streak} <i class="bi bi-fire"></i></div>
                    </div>
                </div>

                <!-- Visual Roadmap -->
                <div class="roadmap-section animate-in stagger-4">
                    <h2 class="section-heading">Ваш путь</h2>
                    <div class="roadmap-container">
                        ${curriculum.modules.map((mod, idx) => {
            const modProgress = State.getModuleProgress(mod.id, mod.lessons);
            const isCompleted = modProgress === 100;
            const isLocked = idx > 0 && State.getModuleProgress(curriculum.modules[idx - 1].id, curriculum.modules[idx - 1].lessons) < 100;
            const isActive = !isLocked && !isCompleted;

            return `
                                <div class="roadmap-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}">
                                    <div class="node-marker">
                                        ${isCompleted ? '<i class="bi bi-check-lg"></i>' :
                    isLocked ? '<i class="bi bi-lock-fill"></i>' :
                        `<span class="node-dot"></span>`}
                                    </div>
                                    <div class="node-content card">
                                        <div class="node-header">
                                            <div class="node-icon"><i class="bi ${mod.icon}"></i></div>
                                            <div class="node-info">
                                                <h3 class="node-title">${mod.title}</h3>
                                                <div class="node-meta">${mod.lessons.length} уроков</div>
                                            </div>
                                            ${isActive ? `<a href="#/lesson/${mod.id}/${mod.lessons[0].id}" class="btn btn-sm btn-primary">Продолжить</a>` : ''}
                                        </div>
                                        ${!isLocked ? `
                                            <div class="node-progress">
                                                <div class="progress" style="height: 3px;">
                                                    <div class="progress-bar" style="width: ${modProgress}%"></div>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>

            <style>
                .home-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .hero-section {
                    text-align: center;
                    padding: 60px 0 48px;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    border-radius: var(--r-md);
                    font-size: var(--fs-xs);
                    color: var(--text-muted);
                    margin-bottom: 20px;
                }

                .badge-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--accent);
                    border-radius: 50%;
                }

                .hero-title {
                    font-size: 3rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin-bottom: 16px;
                    line-height: 1.1;
                    color: var(--text-primary);
                }

                .hero-go {
                    color: var(--accent);
                }

                .hero-subtitle {
                    font-size: var(--fs-lg);
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 28px;
                }

                .hero-actions {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1px;
                    background: var(--border);
                    border: 1px solid var(--border);
                    border-radius: var(--r-lg);
                    overflow: hidden;
                    margin-bottom: 48px;
                }

                .stat-item {
                    background: var(--bg-secondary);
                    padding: 16px;
                    text-align: center;
                }

                .stat-label {
                    font-size: var(--fs-xs);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 1.375rem;
                    font-weight: var(--fw-bold);
                    font-family: var(--font-mono);
                    color: var(--text-primary);
                }

                .stat-accent { color: var(--accent); }
                .stat-warning { color: var(--warning); }

                .section-heading {
                    font-size: 1.375rem;
                    font-weight: var(--fw-bold);
                    margin-bottom: 20px;
                    letter-spacing: -0.01em;
                }

                .roadmap-container {
                    position: relative;
                    padding-left: 24px;
                    border-left: 2px solid var(--border);
                }

                .roadmap-node {
                    position: relative;
                    margin-bottom: 24px;
                    padding-left: 28px;
                }

                .node-marker {
                    position: absolute;
                    left: -33px;
                    top: 16px;
                    width: 20px;
                    height: 20px;
                    background: var(--bg-app);
                    border: 2px solid var(--border);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--text-muted);
                    z-index: 2;
                }

                .node-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--text-muted);
                    border-radius: 50%;
                }

                .roadmap-node.completed .node-marker {
                    border-color: var(--success);
                    background: var(--success);
                    color: white;
                }

                .roadmap-node.active .node-marker {
                    border-color: var(--accent);
                }

                .roadmap-node.active .node-dot {
                    background: var(--accent);
                }

                .roadmap-node.locked { opacity: 0.5; }

                .node-content { transition: border-color var(--dur-fast); }
                .roadmap-node.active .node-content { border-color: var(--accent); }
                .roadmap-node:hover .node-content { border-color: var(--border-hover); }

                .node-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                }

                .node-icon {
                    font-size: 1.125rem;
                    color: var(--text-muted);
                }

                .roadmap-node.active .node-icon { color: var(--accent); }
                .roadmap-node.completed .node-icon { color: var(--success); }

                .node-info { flex: 1; }

                .node-title {
                    font-size: var(--fs-sm);
                    font-weight: var(--fw-semibold);
                    margin: 0;
                }

                .node-meta {
                    font-size: var(--fs-xs);
                    color: var(--text-muted);
                }

                .node-progress { padding: 0 16px 12px; }

                @media (max-width: 768px) {
                    .hero-title { font-size: 2.25rem; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
            </style>
        `;
    }
};
