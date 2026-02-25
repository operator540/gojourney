import { curriculum } from '../data/curriculum.js';
import { Renderer } from '../renderer.js';
import { Router } from '../router.js';

export const Search = {
    init() {
        const input = document.getElementById('search-input');
        if (!input) return;

        const dropdown = document.getElementById('search-results');

        const doSearch = Renderer.debounce((query) => {
            if (!query || query.length < 2) {
                dropdown.classList.remove('visible');
                return;
            }

            if (results.length === 0) {
                dropdown.innerHTML = `<div class="list-group-item text-muted small text-center">Ничего не найдено</div>`;
                dropdown.classList.remove('d-none');
                return;
            }

            dropdown.innerHTML = results.slice(0, 8).map(r => `
                <a href="#/lesson/${r.moduleId}/${r.id}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${r.title}</h6>
                        <small class="text-body-secondary"><i class="bi ${r.moduleIcon}"></i></small>
                    </div>
                    <small class="text-body-secondary">${r.moduleTitle}</small>
                </a>
            `).join('');
            dropdown.classList.remove('d-none');
        }, 200);

        input.addEventListener('input', (e) => doSearch(e.target.value));

        input.addEventListener('blur', () => {
            setTimeout(() => dropdown.classList.add('d-none'), 200);
        });

        input.addEventListener('focus', () => {
            if (input.value.length >= 2) doSearch(input.value);
        });

        // Close on navigation
        Router.onNavigate(() => {
            dropdown.classList.add('d-none');
            input.value = '';
        });
    }
};
