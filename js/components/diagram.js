export const Diagram = {
    _initialized: false,

    toHTML(section) {
        return `
            <div class="diagram-section">
                <div class="mermaid">${section.code}</div>
                ${section.caption ? `<p class="diagram-caption">${section.caption}</p>` : ''}
            </div>
        `;
    },

    async initAll(container) {
        const diagrams = container.querySelectorAll('.mermaid');
        if (diagrams.length === 0) return;

        if (!this._initialized && window.mermaid) {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                themeVariables: {
                    primaryColor: '#d97706',
                    primaryTextColor: '#f4f4f5',
                    primaryBorderColor: '#52525b',
                    lineColor: '#a1a1aa',
                    secondaryColor: '#1a1a1f',
                    tertiaryColor: '#222228',
                    fontFamily: 'Inter, sans-serif',
                },
                flowchart: {
                    curve: 'basis',
                    padding: 15,
                },
                sequence: {
                    actorMargin: 50,
                    boxMargin: 10,
                },
            });
            this._initialized = true;
        }

        if (window.mermaid) {
            try {
                await window.mermaid.run({ nodes: diagrams });
            } catch (err) {
                console.warn('Mermaid render error:', err);
            }
        }
    }
};
