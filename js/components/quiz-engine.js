import { State } from '../state.js';

export const QuizEngine = {
    toHTML(section, lessonId) {
        const savedScore = State.getQuizScore(lessonId);
        let html = `<div class="card mb-4 quiz-section" data-lesson-id="${lessonId}">`;
        html += `<div class="card-header h5">Проверьте себя</div>`;
        html += `<div class="card-body">`;

        if (savedScore) {
            html += `<div class="alert alert-info mb-3">
                Предыдущий результат: <strong>${savedScore.score}/${savedScore.total}</strong>
                (попытка ${savedScore.attempts})
            </div>`;
        }

        section.questions.forEach((q, idx) => {
            html += this._renderQuestion(q, idx);
        });

        html += `<button class="btn btn-primary mt-3 quiz-submit" data-lesson-id="${lessonId}" disabled>Проверить ответы</button>`;
        html += `<div class="quiz-results mt-3" id="quiz-results-${lessonId}"></div>`;
        html += `</div></div>`; // End card-body, card
        return html;
    },

    _renderQuestion(q, idx) {
        let html = `<div class="quiz-question" data-qid="${q.id}" data-type="${q.type}" data-correct='${JSON.stringify(q.correct)}'>`;
        html += `<p class="quiz-question-text">${idx + 1}. ${q.question}</p>`;

        switch (q.type) {
            case 'single':
                html += '<div class="quiz-options">';
                q.options.forEach((opt, i) => {
                    html += `
                        <label class="quiz-option" data-index="${i}">
                            <input type="radio" name="q-${q.id}" value="${i}">
                            <span class="quiz-option-text">${opt}</span>
                            <span class="quiz-option-indicator"></span>
                        </label>
                    `;
                });
                html += '</div>';
                break;

            case 'multiple':
                html += '<div class="quiz-options">';
                q.options.forEach((opt, i) => {
                    html += `
                        <label class="quiz-option" data-index="${i}">
                            <input type="checkbox" name="q-${q.id}" value="${i}">
                            <span class="quiz-option-text">${opt}</span>
                            <span class="quiz-option-indicator"></span>
                        </label>
                    `;
                });
                html += '</div>';
                break;

            case 'code-fill': {
                const parts = q.template.split('___');
                html += `
                    <div class="quiz-code-fill">
                        <code>${parts[0]}</code>
                        <input type="text" class="quiz-code-input" data-qid="${q.id}"
                               placeholder="..." autocomplete="off" spellcheck="false">
                        <code>${parts[1] || ''}</code>
                    </div>
                `;
                break;
            }

            case 'order': {
                html += `<div class="quiz-order-list" data-qid="${q.id}">`;
                const shuffled = q.items.map((item, i) => ({ text: item, origIdx: i }));
                this._shuffle(shuffled);
                shuffled.forEach((item, i) => {
                    html += `
                        <div class="quiz-order-item" draggable="true" data-orig-idx="${item.origIdx}">
                            <span class="quiz-order-handle"><i class="bi bi-grip-vertical"></i></span>
                            <span class="quiz-order-num">${i + 1}</span>
                            <code>${item.text}</code>
                        </div>
                    `;
                });
                html += '</div>';
                break;
            }
        }

        html += `<div class="quiz-feedback" data-feedback-for="${q.id}" style="display:none"></div>`;
        html += '</div>';
        return html;
    },

    initAll(container, lessonId) {
        const quizSection = container.querySelector(`.quiz-section[data-lesson-id="${lessonId}"]`);
        if (!quizSection) return;

        const submitBtn = quizSection.querySelector('.quiz-submit');

        // Enable submit when answers are provided
        quizSection.addEventListener('change', () => {
            submitBtn.disabled = false;
        });

        quizSection.addEventListener('input', (e) => {
            if (e.target.classList.contains('quiz-code-input')) {
                submitBtn.disabled = false;
            }
        });

        // Drag & drop for order questions
        this._initDragDrop(quizSection);

        // Submit handler
        submitBtn?.addEventListener('click', () => {
            this._gradeQuiz(quizSection, lessonId);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Проверено';
        });
    },

    _gradeQuiz(quizSection, lessonId) {
        const questions = quizSection.querySelectorAll('.quiz-question');
        let score = 0;
        let total = questions.length;

        questions.forEach(qEl => {
            const type = qEl.dataset.type;
            const correct = JSON.parse(qEl.dataset.correct);
            const qid = qEl.dataset.qid;
            const feedbackEl = qEl.querySelector(`[data-feedback-for="${qid}"]`);
            let isCorrect = false;

            switch (type) {
                case 'single': {
                    const selected = qEl.querySelector('input:checked');
                    const selectedVal = selected ? parseInt(selected.value) : -1;
                    isCorrect = selectedVal === correct;

                    // Visual feedback
                    qEl.querySelectorAll('.quiz-option').forEach(opt => {
                        const idx = parseInt(opt.dataset.index);
                        if (idx === correct) opt.classList.add('correct');
                        else if (idx === selectedVal && !isCorrect) opt.classList.add('incorrect');
                    });
                    break;
                }

                case 'multiple': {
                    const selected = [...qEl.querySelectorAll('input:checked')].map(i => parseInt(i.value));
                    const correctSet = new Set(correct);
                    const selectedSet = new Set(selected);
                    isCorrect = correctSet.size === selectedSet.size && [...correctSet].every(v => selectedSet.has(v));

                    qEl.querySelectorAll('.quiz-option').forEach(opt => {
                        const idx = parseInt(opt.dataset.index);
                        if (correctSet.has(idx)) {
                            opt.classList.add(selectedSet.has(idx) ? 'correct' : 'missed');
                        } else if (selectedSet.has(idx)) {
                            opt.classList.add('incorrect');
                        }
                    });
                    break;
                }

                case 'code-fill': {
                    const input = qEl.querySelector('.quiz-code-input');
                    const answer = input.value.trim();
                    const caseSensitive = qEl.dataset.caseSensitive !== 'false';
                    isCorrect = caseSensitive
                        ? answer === correct
                        : answer.toLowerCase() === correct.toLowerCase();

                    input.classList.add(isCorrect ? 'correct' : 'incorrect');
                    if (!isCorrect) {
                        input.dataset.correctAnswer = correct;
                    }
                    break;
                }

                case 'order': {
                    const items = [...qEl.querySelectorAll('.quiz-order-item')];
                    const currentOrder = items.map(item => parseInt(item.dataset.origIdx));
                    isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correct);

                    items.forEach((item, i) => {
                        if (currentOrder[i] === correct[i]) {
                            item.classList.add('correct');
                        } else {
                            item.classList.add('incorrect');
                        }
                    });
                    break;
                }
            }

            if (isCorrect) score++;

            // Show feedback
            if (feedbackEl) {
                feedbackEl.style.display = 'block';
                feedbackEl.className = `quiz-feedback ${isCorrect ? 'quiz-feedback-correct' : 'quiz-feedback-incorrect'}`;

                // Find explanation from the section data
                const explanation = qEl.closest('.quiz-section')?.querySelector(`[data-qid="${qid}"]`)?.dataset?.explanation || '';

                if (isCorrect) {
                    feedbackEl.textContent = '✓ Правильно!';
                } else {
                    feedbackEl.innerHTML = `✗ Неправильно.${type === 'code-fill' ? ` Правильный ответ: <span class="quiz-correct-answer">${correct}</span>` : ''}`;
                }
            }

            // Disable inputs
            qEl.querySelectorAll('input').forEach(i => i.disabled = true);
            qEl.querySelectorAll('.quiz-order-item').forEach(i => i.setAttribute('draggable', 'false'));
        });

        // Show results
        const resultsEl = quizSection.querySelector(`#quiz-results-${lessonId}`);
        if (resultsEl) {
            const pct = Math.round((score / total) * 100);
            const cls = pct === 100 ? 'quiz-score-perfect' : pct >= 60 ? 'quiz-score-good' : 'quiz-score-needs-work';
            resultsEl.classList.add('visible');
            resultsEl.innerHTML = `
                <div class="quiz-score ${cls}">${score}/${total}</div>
                <div class="quiz-score-label">${pct === 100 ? 'Отлично!' : pct >= 60 ? 'Хороший результат!' : 'Стоит повторить материал'}</div>
                <button class="quiz-retry-btn" onclick="location.reload()">Попробовать снова</button>
            `;
        }

        // Save score
        State.saveQuizScore(lessonId, score, total);
    },

    _initDragDrop(quizSection) {
        const orderLists = quizSection.querySelectorAll('.quiz-order-list');
        orderLists.forEach(list => {
            let dragItem = null;

            list.querySelectorAll('.quiz-order-item').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    dragItem = item;
                    item.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    list.querySelectorAll('.quiz-order-item').forEach(i => i.classList.remove('drag-over'));
                    // Update numbers
                    list.querySelectorAll('.quiz-order-num').forEach((num, i) => num.textContent = i + 1);
                    dragItem = null;
                });

                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    item.classList.add('drag-over');
                });

                item.addEventListener('dragleave', () => {
                    item.classList.remove('drag-over');
                });

                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    item.classList.remove('drag-over');
                    if (dragItem && dragItem !== item) {
                        const allItems = [...list.children];
                        const dragIdx = allItems.indexOf(dragItem);
                        const dropIdx = allItems.indexOf(item);
                        if (dragIdx < dropIdx) {
                            list.insertBefore(dragItem, item.nextSibling);
                        } else {
                            list.insertBefore(dragItem, item);
                        }
                    }
                });
            });
        });
    },

    _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
};
