import { State } from '../state.js';
import { curriculum } from '../data/curriculum.js';
import { CodeBlock } from '../components/code-block.js';
import { CodeEditor } from '../components/code-editor.js';
import { QuizEngine } from '../components/quiz-engine.js';
import { Diagram } from '../components/diagram.js';

export default {
    async render(container, params) {
        const { moduleId, lessonId } = params;
        const mod = curriculum.getModule(moduleId);
        if (!mod) {
            container.innerHTML = '<div class="content-inner"><div class="empty-state"><div class="empty-state-icon"><i class="bi bi-search"></i></div><div class="empty-state-title">Модуль не найден</div></div></div>';
            return;
        }

        const lessonMeta = mod.lessons.find(l => l.id === lessonId);
        if (!lessonMeta) {
            container.innerHTML = '<div class="content-inner"><div class="empty-state"><div class="empty-state-icon"><i class="bi bi-search"></i></div><div class="empty-state-title">Урок не найден</div></div></div>';
            return;
        }

        // Dynamic import of lesson content
        let lesson;
        try {
            const module = await import(`../../content/modules/${mod.path}/${lessonMeta.file}.js`);
            lesson = module.default;
        } catch (err) {
            console.error('Lesson load error:', err);
            container.innerHTML = `
                <div class="content-inner">
                    <div class="breadcrumb">
                        <a href="#/">Главная</a>
                        <span class="breadcrumb-sep">›</span>
                        <a href="#/curriculum">Программа</a>
                        <span class="breadcrumb-sep">›</span>
                        <span class="breadcrumb-current">${mod.title}</span>
                    </div>
                    <div class="empty-state" style="margin-top: var(--sp-16)">
                        <div class="empty-state-icon"><i class="bi bi-cone-striped"></i></div>
                        <div class="empty-state-title">${lessonMeta.title}</div>
                        <p style="color: var(--text-muted)">Этот урок ещё в разработке. Скоро будет доступен!</p>
                    </div>
                </div>
            `;
            return;
        }

        const isCompleted = State.isLessonCompleted(lessonId);
        const prevLesson = curriculum.getPrevLesson(lessonId);
        const nextLesson = curriculum.getNextLesson(lessonId);

        // Build HTML
        let html = `<div class="content-inner">`;

        // Breadcrumb
        html += `
                <div class="breadcrumb animate-in" style="--bs-breadcrumb-divider: '›';">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="#/" class="text-decoration-none">Главная</a></li>
                            <li class="breadcrumb-item"><a href="#/curriculum" class="text-decoration-none">Программа</a></li>
                            <li class="breadcrumb-item"><a href="#/lesson/${moduleId}/${mod.lessons[0].id}" class="text-decoration-none"><i class="bi ${mod.icon}"></i> ${mod.title}</a></li>
                            <li class="breadcrumb-item active" aria-current="page">${lessonMeta.title}</li>
                        </ol>
                    </nav>
                </div>
        `;

        // Header
        html += `
            <div class="lesson-header animate-in stagger-1 mb-4">
                <div class="lesson-meta mb-2">
                    <span class="badge text-bg-secondary">${mod.title}</span>
                    <span class="badge text-bg-light border">⏱ ${lessonMeta.time || 15} мин</span>
                    ${lesson.xpReward ? `<span class="badge text-bg-info">+${lesson.xpReward} XP</span>` : ''}
                    ${isCompleted ? '<span class="badge text-bg-success">✓ Пройдено</span>' : ''}
                </div>
                <h1 class="lesson-title">${lesson.title || lessonMeta.title}</h1>
                ${lesson.description ? `<p class="lesson-description">${lesson.description}</p>` : ''}
            </div>
        `;

        // Sections
        if (lesson.sections) {
            let sectionIdx = 0;
            for (const section of lesson.sections) {
                const stagger = Math.min(sectionIdx + 2, 10);
                html += `<div class="lesson-section animate-in stagger-${stagger}">`;

                switch (section.type) {
                    case 'theory':
                        html += `<div class="theory-block mb-4">${section.content}</div>`;
                        break;

                    case 'code-example':
                        html += CodeBlock.toHTML(section);
                        break;

                    case 'image':
                        html += `
                            <figure class="figure animate-in w-100 text-center mb-4">
                                <img src="${section.src}" alt="${section.alt}" class="figure-img img-fluid rounded" loading="lazy">
                                ${section.caption ? `<figcaption class="figure-caption text-center">${section.caption}</figcaption>` : ''}
                            </figure>
                        `;
                        break;

                    case 'info-box':
                        {
                            const variantMap = {
                                'note': 'primary',
                                'tip': 'success',
                                'warning': 'warning',
                                'important': 'danger'
                            };
                            const bsVariant = variantMap[section.variant] || 'info';
                            html += `<div class="alert alert-${bsVariant} mb-4" role="alert">${section.content}</div>`;
                        }
                        break;

                    case 'diagram':
                        html += Diagram.toHTML(section);
                        break;

                    case 'editor':
                        html += CodeEditor.toHTML(section, lessonId);
                        break;

                    case 'quiz':
                        html += QuizEngine.toHTML(section, lessonId);
                        break;

                    default:
                        console.warn('Unknown section type:', section.type);
                }

                html += `</div>`;
                sectionIdx++;
            }
        }

        // Complete button
        html += `
            <div class="lesson-complete-section text-center my-5">
                <button class="btn btn-lg ${isCompleted ? 'btn-success' : 'btn-primary'} w-100"
                        id="complete-lesson-btn"
                        ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? 'Урок пройден' : `Завершить урок (+${lesson.xpReward || 10} XP)`}
                </button>
            </div>
        `;

        // Navigation
        html += `<div class="row g-3 lesson-nav">`;
        if (prevLesson) {
            html += `
                <div class="col-6">
                    <a href="#/lesson/${prevLesson.moduleId}/${prevLesson.id}" class="btn btn-outline-secondary w-100 text-start h-100 py-3">
                        <small class="d-block text-muted">← Предыдущий</small>
                        <span class="fw-semibold">${prevLesson.title}</span>
                    </a>
                </div>
            `;
        } else {
            html += `<div class="col-6"></div>`;
        }
        if (nextLesson) {
            html += `
                <div class="col-6">
                    <a href="#/lesson/${nextLesson.moduleId}/${nextLesson.id}" class="btn btn-outline-primary w-100 text-end h-100 py-3">
                        <small class="d-block text-muted">Следующий →</small>
                        <span class="fw-semibold">${nextLesson.title}</span>
                    </a>
                </div>
            `;
        }
        html += `</div>`;
        html += `</div>`; // content-inner

        container.innerHTML = html;

        // Post-render init
        CodeBlock.initAll(container);
        CodeEditor.initAll(container, lessonId);
        QuizEngine.initAll(container, lessonId);
        await Diagram.initAll(container);

        // Complete button handler
        const completeBtn = container.querySelector('#complete-lesson-btn');
        if (completeBtn && !isCompleted) {
            completeBtn.addEventListener('click', () => {
                State.completeLesson(lessonId, lesson.xpReward || 10);
                completeBtn.classList.add('completed');
                completeBtn.textContent = 'Урок пройден';
                completeBtn.disabled = true;
            });
        }

        // Scroll to top
        container.scrollTop = 0;
    }
};
