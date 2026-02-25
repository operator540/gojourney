import { State } from '../state.js';
import { Renderer } from '../renderer.js';

export const CodeEditor = {
    editors: new Map(),

    toHTML(section, lessonId) {
        // Generate a safe ID: alphanumeric only
        const safeTitle = section.title ? section.title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 20) : 'main';
        const editorId = `editor-${lessonId.replace(/[^a-zA-Z0-9]/g, '-')}-${safeTitle}`;
        const savedCode = State.getEditorCode(lessonId);
        const starter = section.starterCode || section.initialCode || '';
        const code = savedCode || starter;

        return `
            <div class="card mb-4 editor-section" data-lesson-id="${lessonId}" data-editor-id="${editorId}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span class="fw-bold">${section.title || 'Редактор кода'}</span>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" data-action="reset" title="Сбросить код"><i class="bi bi-arrow-counterclockwise"></i></button>
                        <button class="btn btn-sm btn-outline-secondary" data-action="copy" title="Копировать"><i class="bi bi-clipboard"></i></button>
                        <button class="btn btn-sm btn-primary" data-action="run"><i class="bi bi-play-fill"></i> Запустить</button>
                    </div>
                </div>
                ${section.instructions ? `<div class="card-body pb-0"><p class="card-text">${section.instructions}</p></div>` : ''}
                <div class="card-body p-0">
                    <div class="editor-container" id="${editorId}"
                        style="height: 300px; width: 100%;"
                        data-starter-code="${Renderer.escapeAttr(starter)}"
                        data-initial-code="${Renderer.escapeAttr(code)}">
                    </div>
                </div>
                <div class="card-footer bg-body-tertiary">
                    <div class="editor-output p-3 bg-dark text-light rounded font-monospace" id="${editorId}-output" style="min-height: 60px;">
                        <div class="text-secondary small">Нажмите "Запустить" для выполнения кода</div>
                    </div>

                    ${section.hints && section.hints.length > 0 ? `
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-info" type="button" data-bs-toggle="collapse" data-bs-target="#hints-${editorId}">
                                <i class="bi bi-lightbulb"></i> Подсказки (${section.hints.length})
                            </button>
                            <div class="collapse mt-2" id="hints-${editorId}">
                                <ul class="list-group">
                                    ${section.hints.map(h => `<li class="list-group-item list-group-item-info">${h}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}

                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-secondary">Go 1.21</span>
                        <span class="badge bg-success opacity-0 transition-opacity" id="${editorId}-saved">Сохранено</span>
                    </div>
                </div>
            </div>
        `;
    },

    initAll(container, lessonId) {
        container.querySelectorAll('.editor-section').forEach(section => {
            const editorId = section.dataset.editorId;
            // Escape colons and other special characters in ID for selector
            const safeEditorId = CSS.escape(editorId);

            const editorContainer = section.querySelector(`#${safeEditorId}`);
            if (!editorContainer || !window.ace) return;

            const code = editorContainer.dataset.initialCode;
            const starterCode = editorContainer.dataset.starterCode;

            const editor = ace.edit(editorContainer, {
                mode: 'ace/mode/golang',
                theme: 'ace/theme/one_dark',
                fontSize: State.data.settings.fontSize || 14,
                tabSize: 4,
                useSoftTabs: false,
                showPrintMargin: false,
                highlightActiveLine: true,
                showGutter: true,
                wrap: true,
                minLines: 8,
                maxLines: 30,
            });

            editor.setValue(code, -1);
            this.editors.set(editorId, { editor, starterCode });

            // Auto-save (debounced)
            let saveTimer;
            const savedEl = section.querySelector(`#${editorId}-saved`);
            editor.on('change', () => {
                clearTimeout(saveTimer);
                saveTimer = setTimeout(() => {
                    State.saveEditorCode(lessonId, editor.getValue());
                    if (savedEl) {
                        savedEl.classList.add('visible');
                        setTimeout(() => savedEl.classList.remove('visible'), 1500);
                    }
                }, 800);
            });

            // Listen for font size changes
            State.on('settings-changed', ({ key, value }) => {
                if (key === 'fontSize') editor.setFontSize(value);
            });

            // Buttons
            section.querySelector('[data-action="run"]')?.addEventListener('click', () => {
                this._simulateRun(editorId, editor.getValue(), section);
            });

            section.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
                editor.setValue(starterCode, -1);
            });

            section.querySelector('[data-action="copy"]')?.addEventListener('click', () => {
                navigator.clipboard.writeText(editor.getValue());
                const btn = section.querySelector('[data-action="copy"]');
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                setTimeout(() => btn.innerHTML = '<i class="bi bi-clipboard"></i>', 1500);
            });

            // Hints toggle
            // Hints are handled by Bootstrap data-bs-toggle
        });
    },

    _simulateRun(editorId, code, section) {
        const outputEl = section.querySelector(`#${editorId}-output`);
        if (!outputEl) return;

        // Show "compiling" state
        outputEl.innerHTML = '<div class="output-info"><i class="bi bi-hourglass-split"></i> Компиляция...</div>';

        setTimeout(() => {
            const lines = [];
            let hasError = false;

            // Check for basic syntax issues
            const openBraces = (code.match(/{/g) || []).length;
            const closeBraces = (code.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                outputEl.innerHTML = `<div class="output-error">./main.go: syntax error: unexpected end of file, expecting }</div>`;
                return;
            }

            if (!code.includes('package ')) {
                outputEl.innerHTML = `<div class="output-error">./main.go:1:1: expected 'package', found 'EOF'</div>`;
                return;
            }

            // Resolve variable assignments
            const vars = this._resolveVars(code);

            // Extract print statements in order of appearance
            const printRegex = /fmt\.(Println|Printf|Print)\(([^)]*)\)/g;
            let match;
            while ((match = printRegex.exec(code)) !== null) {
                const fn = match[1];
                const args = match[2].trim();
                const extracted = this._extractPrint(fn, args, vars);
                lines.push(...extracted);
            }

            if (lines.length > 0) {
                outputEl.innerHTML = `<pre class="output-text">${Renderer.escape(lines.join('\n'))}</pre>`;
            } else if (code.includes('func main()')) {
                outputEl.innerHTML = '<div class="output-info">Программа выполнена успешно (нет вывода).</div>';
            } else {
                outputEl.innerHTML = '<div class="output-error">./main.go: runtime error: missing func main()</div>';
            }
        }, 300 + Math.random() * 200);
    },

    _resolveVars(code) {
        const vars = {};
        // Match := and = assignments
        const assignRegex = /(\w+)\s*:?=\s*("(?:[^"\\]|\\.)*"|\d+(?:\.\d+)?|true|false)/g;
        let m;
        while ((m = assignRegex.exec(code)) !== null) {
            const name = m[1];
            const raw = m[2];
            if (raw.startsWith('"')) {
                vars[name] = raw.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            } else if (raw.includes('.')) {
                vars[name] = parseFloat(raw);
            } else if (raw === 'true' || raw === 'false') {
                vars[name] = raw;
            } else {
                vars[name] = parseInt(raw, 10);
            }
        }
        return vars;
    },

    _resolveArg(arg, vars) {
        arg = arg.trim();
        const strMatch = arg.match(/^"((?:[^"\\]|\\.)*)"$/);
        if (strMatch) return strMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
        if (/^\d+\.\d+$/.test(arg)) return parseFloat(arg);
        if (/^\d+$/.test(arg)) return parseInt(arg, 10);
        if (arg === 'true' || arg === 'false') return arg;
        if (vars.hasOwnProperty(arg)) return vars[arg];
        return `[${arg}]`;
    },

    _splitArgs(argsStr) {
        const args = [];
        let depth = 0, current = '', inStr = false;
        for (let i = 0; i < argsStr.length; i++) {
            const ch = argsStr[i];
            if (ch === '"' && (i === 0 || argsStr[i - 1] !== '\\')) inStr = !inStr;
            if (!inStr && ch === '(') depth++;
            if (!inStr && ch === ')') depth--;
            if (!inStr && depth === 0 && ch === ',') {
                args.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim()) args.push(current.trim());
        return args;
    },

    _extractPrint(fn, argsStr, vars) {
        if (!argsStr) return fn === 'Println' ? [''] : [];
        const parts = this._splitArgs(argsStr);

        if (fn === 'Printf') {
            // First arg is format string
            const fmtArg = this._resolveArg(parts[0], vars);
            const fmtStr = String(fmtArg);
            const values = parts.slice(1).map(a => this._resolveArg(a, vars));
            let vi = 0;
            const result = fmtStr.replace(/%[sdvfbtqxXoce%]/g, (spec) => {
                if (spec === '%%') return '%';
                if (vi < values.length) {
                    const val = values[vi++];
                    if (spec === '%f' && typeof val === 'number') return val.toFixed(6);
                    return String(val);
                }
                return spec;
            });
            return [result];
        }

        // Println / Print
        const resolved = parts.map(p => String(this._resolveArg(p, vars)));
        return [resolved.join(' ')];
    },

    destroy() {
        for (const [id, { editor }] of this.editors) {
            editor.destroy();
        }
        this.editors.clear();
    }
};
