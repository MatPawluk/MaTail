const componentDataMap = new Map(); // Mapa do przechowywania danych komponentów

// Inicjalizacja tabsów dla jednego komponentu
function setupTabs(componentElement) {
    const tabButtons = componentElement.querySelectorAll('.tab-button[data-component-id]');
    const tabSelect = componentElement.querySelector('.tab-select[data-component-id]');
    const tabPanes = componentElement.querySelectorAll('.tab-pane[data-component-id]');
    const previewArea = componentElement.querySelector('.preview-area[data-component-id]');
    const componentId = componentElement.id.replace('code-preview-', '');
    const componentData = componentDataMap.get(componentId);

    if (!componentData) {
        console.error(`[${componentId}] setupTabs: Dane dla komponentu nie znaleziono.`);
        return;
    }

    function renderPreview() {
        if (previewArea && componentData) {
            previewArea.innerHTML = `<style class="component-dynamic-style">${componentData.css}</style>${componentData.html}`;
        } else {
            console.warn(`[${componentId}] renderPreview: Nie mogę wyrenderować preview.`);
        }
    }

    function activateTab(tabId) {
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        });

        tabPanes.forEach(pane => {
            pane.classList.add('hidden');
            pane.classList.remove('active');
        });

        const activeButton = componentElement.querySelector(`.tab-button[data-tab="${tabId}"][data-component-id="${componentId}"]`);
        if (activeButton) {
            activeButton.classList.add('active', 'border-blue-600', 'text-blue-600');
            activeButton.classList.remove('text-gray-500', 'border-transparent');
        }

        const activePane = componentElement.querySelector(`.tab-pane#${tabId}[data-component-id="${componentId}"]`);
        if (activePane) {
            activePane.classList.remove('hidden');
            activePane.classList.add('active');
        } else {
            console.warn(`[${componentId}] activateTab: Nie znaleziono panelu dla tabId: ${tabId}`);
        }

        if (tabId === 'preview') {
            renderPreview();
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            activateTab(tabId);
            if (tabSelect) {
                tabSelect.value = tabId;
            }
        });
    });

    if (tabSelect) {
        tabSelect.addEventListener('change', e => {
            const tabId = e.target.value;
            activateTab(tabId);
        });
    }

    const initialActiveButton = componentElement.querySelector('.tab-button.active[data-component-id]');
    if (initialActiveButton) {
        const initialTabId = initialActiveButton.getAttribute('data-tab');
        activateTab(initialTabId);
    } else {
        activateTab('preview');
    }
}

// Inicjalizacja logiki kopiowania dla jednego komponentu
function setupClipboard(componentElement) {
    const copyButtons = componentElement.querySelectorAll('.copy-btn[data-component-id]');
    const componentId = componentElement.id.replace('code-preview-', '');
    const componentData = componentDataMap.get(componentId);

    if (!componentData) {
        console.error(`[${componentId}] setupClipboard: Dane dla komponentu nie znaleziono.`);
        return;
    }

    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const copyType = button.getAttribute('data-copy-type');
            let textToCopy = '';

            switch (copyType) {
                case 'html':
                    textToCopy = componentData.html;
                    break;
                case 'css':
                    textToCopy = componentData.css;
                    break;
                case 'js':
                    textToCopy = componentData.js;
                    break;
                default:
                    console.error(`[${componentId}] setupClipboard: Nieznany typ do skopiowania:`, copyType);
                    return;
            }

            if (!textToCopy) {
                console.warn(`[${componentId}] setupClipboard: Brak zawartości do skopiowania.`);
                return;
            }

            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalText = button.innerHTML;
                button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                button.classList.add('bg-green-600', 'hover:bg-green-700');
                const iconSvg = button.querySelector('svg') ? button.querySelector('svg').outerHTML : '';
                button.innerHTML = `${iconSvg} Skopiowano!`;

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    button.classList.remove('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            } catch (err) {
                console.error(`[${componentId}] setupClipboard: Nie udało się skopiować tekstu: `, err);
            }
        });
    });
}

// Inicjalizacja wszystkich komponentów na stronie
function initializeComponents() {
    const components = document.querySelectorAll('.code-preview');

    components.forEach(component => {
        if (!component.id || !component.id.startsWith('code-preview-')) {
            console.warn('Pomijam element bez poprawnego ID:', component);
            return;
        }

        const componentId = component.id.replace('code-preview-', '');

        if (!componentDataMap.has(componentId)) {
            const dataContainer = component.querySelector(`.component-data-container[data-component-id="${componentId}"]`);
            if (dataContainer) {
                const html = dataContainer.querySelector('.component-data-html')?.innerHTML || '';
                const css = dataContainer.querySelector('.component-data-css')?.textContent || '';
                const js = dataContainer.querySelector('.component-data-js')?.textContent || '';
                componentDataMap.set(componentId, { html, css, js });
            } else {
                console.error(`Nie znaleziono ukrytego kontenera danych dla ${componentId}.`);
                return;
            }
        }

        setupTabs(component);
        setupClipboard(component);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeComponents();
});

document.addEventListener('astro:after-swap', () => {
    initializeComponents();
});
