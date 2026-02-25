export const CodeBlock = {
    toHTML(section) {
        const escaped = this._escape(section.code);
        return `
            <div class="code-example">
                ${section.title ? `
                    <div class="code-title">
                        <span>${section.title}</span>
                        <span class="code-title-lang">${section.language || 'go'}</span>
                    </div>
                ` : ''}
                <div class="code-wrapper">
                    <button class="code-copy-btn" title="Копировать"><i class="bi bi-clipboard"></i></button>
                    <pre><code class="language-${section.language || 'go'}">${escaped}</code></pre>
                </div>
                ${section.explanation ? `<p class="code-explanation">${section.explanation}</p>` : ''}
            </div>
        `;
    },

    initAll(container) {
        // Apply highlight.js
        if (window.hljs) {
            container.querySelectorAll('pre code[class*="language-"]').forEach(block => {
                if (!block.dataset.highlighted) {
                    window.hljs.highlightElement(block);
                    block.dataset.highlighted = 'true';
                }
            });
        }

        // Copy buttons
        container.querySelectorAll('.code-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.closest('.code-wrapper').querySelector('code').textContent;
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="bi bi-clipboard"></i>';
                        btn.classList.remove('copied');
                    }, 1500);
                });
            });
        });
    },

    _escape(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
};
