// Mapa do przechowywania danych komponentów { componentId: { html: '...', css: '...', js: '...' } }
// Służy do przechowywania danych odczytanych z DOM, dostępnych dla funkcji tabs i kopiowania.
const componentDataMap = new Map();

// Funkcja do inicjalizacji tabsów dla jednego elementu komponentu
// Znajduje przyciski, panele i obszar podglądu W OBRĘBIE danego elementu komponentu
// i dodaje listenery zdarzeń oraz zarządza widocznością paneli.
function setupTabs(componentElement) {
    // Szukaj przycisków, selecta i paneli tabsów TYLKO w obrębie danego komponentu
    const tabButtons = componentElement.querySelectorAll('.tab-button[data-component-id]');
    const tabSelect = componentElement.querySelector('.tab-select[data-component-id]'); // Może być null
    const tabPanes = componentElement.querySelectorAll('.tab-pane[data-component-id]');
    // WAŻNE: previewArea musi być znaleziony, żeby wstawić tam HTML/CSS
    const previewArea = componentElement.querySelector('.preview-area[data-component-id]');

    // Pobierz unikalne ID komponentu z jego głównego elementu i pobierz dane z mapy
    const componentId = componentElement.id.replace('code-preview-', '');
    const componentData = componentDataMap.get(componentId);

    // Jeśli dane nie zostały wcześniej odczytane i zapisane w mapie, zakończ inicjalizację tabsów dla tego komponentu
    if (!componentData) {
        console.error(`[${componentId}] setupTabs: Dane dla komponentu o ID ${componentId} nie znaleziono w mapie.`);
        return;
    }
     console.log(
         `[${componentId}] setupTabs: Inicjalizuję tabsy dla komponentu. PreviewArea:`,
         previewArea,
         'Dane (z mapy):',
         componentData
     );

    // Dynamiczne wstawienie CSS i HTML do obszaru podglądu
    // Ta funkcja jest wywoływana tylko wtedy, gdy panel 'preview' jest aktywowany
    function renderPreview() {
        // Upewnij się, że obszar podglądu i dane istnieją, zanim spróbujesz renderować
        if (previewArea && componentData) {
             console.log(`[${componentId}] renderPreview: Wywołano. Wstawiam HTML/CSS.`);
            // Wstawiamy tag <style> z CSS i faktyczny kod HTML do obszaru podglądu.
            // Style w tagu <style> wstawionym tutaj powinny mieć zasięg ograniczony do previewArea (ze względu na strukturę DOM).
            previewArea.innerHTML = `<style class="component-dynamic-style">${componentData.css}</style>${componentData.html}`;
        } else {
             console.warn(`[${componentId}] renderPreview: Nie mogę wyrenderować preview. previewArea:`, previewArea, 'Dane:', componentData);
        }
    }

    // Funkcja do aktywacji konkretnej zakładki w obrębie TEJ instancji komponentu
    // Zarządza klasami 'active' na przyciskach i 'hidden' na panelach
    function activateTab(tabId) {
        console.log(`[${componentId}] activateTab: Aktywuję zakładkę: ${tabId}`);
    
        // Dezaktywuj wszystkie przyciski zakładek dla TEGO komponentu
        tabButtons.forEach(btn => {
            btn.classList.remove('active', 'border-blue-600', 'text-blue-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        });
    
        // Ukryj wszystkie panele tabsów dla TEGO komponentu
        tabPanes.forEach(pane => {
            pane.classList.add('hidden');
            pane.classList.remove('active');
        });
    
        // Znajdź i aktywuj przycisk odpowiadający klikniętemu lub wybranemu tabId
        const activeButton = componentElement.querySelector(
            `.tab-button[data-tab="${tabId}"][data-component-id="${componentId}"]`
        );
        if (activeButton) {
            activeButton.classList.add('active', 'border-blue-600', 'text-blue-600');
            activeButton.classList.remove('text-gray-500', 'border-transparent');
        }
    
        // Znajdź i pokaż panel odpowiadający aktywnemu tabId
        const activePane = componentElement.querySelector(`.tab-pane#${tabId}[data-component-id="${componentId}"]`);
        if (activePane) {
            activePane.classList.remove('hidden');
            activePane.classList.add('active');
        } else {
            console.warn(`[${componentId}] activateTab: Nie znaleziono panelu dla tabId: ${tabId}`);
        }
    
        // Specjalna logika renderowania tylko dla panelu 'preview'
        if (tabId === 'preview') {
            renderPreview(); // Wywołaj renderowanie zawartości podglądu
        }
    }

    // Dodaj listenery zdarzeń 'click' do wszystkich przycisków zakładek dla TEGO komponentu
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab'); // Pobierz cel zakładki z data-tab
            activateTab(tabId); // Aktywuj zakładkę
            // Synchronizuj select (jeśli istnieje) z aktywnym tabId
            if (tabSelect) {
                tabSelect.value = tabId;
            }
        });
    });

    // Dodaj listener zdarzeń 'change' do selecta mobilnego (jeśli istnieje)
    if (tabSelect) {
        tabSelect.addEventListener('change', e => {
            const tabId = e.target.value; // Pobierz cel zakładki z wartości selecta
            activateTab(tabId); // Aktywuj zakładkę
        });
    }

    // --- Logic uruchamiana raz przy inicjalizacji komponentu ---

    // Ustaw początkową aktywną zakładkę i panel na podstawie klasy 'active' w HTML.
    // Jeśli żaden przycisk nie ma 'active', domyślnie aktywuj 'preview'.
    const initialActiveButton = componentElement.querySelector('.tab-button.active[data-component-id]');

    if (initialActiveButton) {
         console.log(`[${componentId}] setupTabs: Znaleziono początkowo aktywny przycisk. Aktywuję tabsy.`);
        const initialTabId = initialActiveButton.getAttribute('data-tab');
        // Używamy activateTab, aby ustawić poprawny stan klas 'active'/'hidden' i wywołać renderPreview jeśli trzeba
        activateTab(initialTabId);
    } else {
         console.log(`[${componentId}] setupTabs: Nie znaleziono początkowo aktywnego przycisku. Domyślnie aktywuję preview.`);
        // Jeśli żaden przycisk nie był domyślnie aktywny, aktywuj zakładkę 'preview'
        activateTab('preview');
    }

    // Usunięto powtórzone renderPreview() poza if/else, bo activateTab to wywołuje gdy tabId === 'preview'
}

// Funkcja do inicjalizacji logiki kopiowania do schowka dla jednego elementu komponentu
// Dodaje listenery do przycisków kopiowania i obsługuje kopiowanie danych z mapy
function setupClipboard(componentElement) {
    // Szukaj przycisków kopiowania TYLKO w obrębie danego komponentu
    const copyButtons = componentElement.querySelectorAll('.copy-btn[data-component-id]');

    // Pobierz unikalne ID komponentu i pobierz dane z mapy
    const componentId = componentElement.id.replace('code-preview-', '');
    const componentData = componentDataMap.get(componentId);

    // Jeśli dane nie zostały wcześniej odczytane, zakończ inicjalizację kopiowania
    if (!componentData) {
        console.error(`[${componentId}] setupClipboard: Dane dla komponentu o ID ${componentId} nie znaleziono w mapie do kopiowania.`);
        return;
    }
     console.log(`[${componentId}] setupClipboard: Inicjalizuję przyciski kopiowania.`);


    // Dodaj listenery zdarzeń 'click' do każdego przycisku kopiowania
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
             console.log(`[${componentId}] setupClipboard: Kliknięto przycisk kopiowania.`);
            // Pobierz typ danych do skopiowania z atrybutu data-copy-type
            const copyType = button.getAttribute('data-copy-type'); // 'html', 'css', or 'js'
            let textToCopy = '';

            // Pobierz odpowiedni tekst do skopiowania z danych komponentu przechowywanych w mapie
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
                    return; // Zakończ, jeśli typ jest nieznany
            }

            // Sprawdź, czy są dane do skopiowania
            if (!textToCopy) {
                console.warn(`[${componentId}] setupClipboard: Brak zawartości do skopiowania dla typu: ${copyType}`);
                // Opcjonalnie: Dodaj wizualną informację dla użytkownika o braku treści do skopiowania
                return; // Nic do skopiowania
            }

            try {
                 console.log(`[${componentId}] setupClipboard: Kopiuję ${copyType}...`);
                // Użyj Clipboard API do skopiowania tekstu
                await navigator.clipboard.writeText(textToCopy);

                // --- Wizualne potwierdzenie kopiowania (Możliwe źródło błędów SVG) ---
                // Zapisz oryginalną zawartość HTML przycisku (zawiera tekst i ikonę SVG)
                const originalText = button.innerHTML;
                // Zmień klasy przycisku na zielone, aby wskazać sukces
                button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                button.classList.add('bg-green-600', 'hover:bg-green-700');

                // Znajdź ikonę SVG w przycisku i zachowaj jej HTML
                const iconSvg = button.querySelector('svg') ? button.querySelector('svg').outerHTML : '';
                // Ustaw nową zawartość HTML przycisku (ikona + tekst "Skopiowano!")
                button.innerHTML = `${iconSvg} Skopiowano!`;


                // Po 2 sekundach przywróć oryginalny wygląd i tekst przycisku
                setTimeout(() => {
                     console.log(`[${componentId}] setupClipboard: Przywracam tekst przycisku kopiowania.`);
                    button.innerHTML = originalText; // TA LINIA PRZYWRACA ORYGINALNY HTML (MOŻE WPROWADZAĆ BŁĄD SVG)
                    button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    button.classList.remove('bg-green-600', 'hover:bg-green-700');
                }, 2000);

            } catch (err) {
                console.error(`[${componentId}] setupClipboard: Nie udało się skopiować tekstu ${copyType}: `, err);
                // Opcjonalnie: Pokaż użytkownikowi komunikat o błędzie kopiowania
            }
        });
    });
}

// Funkcja inicjalizująca WSZYSTKIE komponenty 'code-preview' na stronie
// Jest wywoływana przy pierwszym ładowaniu strony i po każdej nawigacji View Transitions
function initializeComponents() {
    console.log('--- initializeComponents: Szukam komponentów .code-preview do inicjalizacji...');
    // Znajdź wszystkie elementy, które są głównym kontenerem komponentu ComponentCard
    const components = document.querySelectorAll('.code-preview');
    console.log(`--- initializeComponents: Znaleziono ${components.length} komponentów.`);

    // Dla każdego znalezionego komponentu:
    components.forEach(component => {
        // Upewnij się, że element ma ID w oczekiwanym formacie (kod_komponentu-unikalneID)
        // Jest to kluczowe do powiązania elementu DOM z jego danymi
        if (!component.id || !component.id.startsWith('code-preview-')) {
             console.warn('--- initializeComponents: Pomijam element bez poprawnego ID:', component);
             return; // Pomijaj elementy, które nie są głównym kontenerem komponentu ComponentCard
        }
        const componentId = component.id.replace('code-preview-', ''); // Pobierz unikalne ID komponentu

         console.log(`--- initializeComponents: Przetwarzam komponent ID: ${componentId}`);

        // --- Odczyt Danych Komponentu z DOM i zapisanie w mapie ---
        // Sprawdź, czy dane dla tego komponentu nie zostały już odczytane i zapisane w mapie
        // Działa to jako zabezpieczenie przed wielokrotnym odczytywaniem danych z tego samego elementu
        // w przypadku, gdy View Transitions nie zastąpią całkowicie elementu, a skrypt zostanie uruchomiony ponownie.
        if (!componentDataMap.has(componentId)) {
             console.log(`--- initializeComponents: ${componentId}: Dane nie znaleziono w mapie. Odczytuję z ukrytych divów.`);
            // Odczytaj dane z ukrytego kontenera div DLA TEGO konkretnego komponentu.
            // Selektor używa data-component-id, aby znaleźć kontener danych należący do tego komponentu.
            const dataContainer = component.querySelector(`.component-data-container[data-component-id="${componentId}"]`);

            // Jeśli kontener danych został znaleziony:
            if (dataContainer) {
                 // Odczytaj dane z podrzędnych divów.
                 // Używamy innerHTML dla html (może zawierać tagi), textContent dla css i js (czysty tekst).
                 const html = dataContainer.querySelector('.component-data-html')?.innerHTML || '';
                 const css = dataContainer.querySelector('.component-data-css')?.textContent || '';
                 const js = dataContainer.querySelector('.component-data-js')?.textContent || '';

                 // Zaloguj długość odczytanych danych, aby upewnić się, że nie są puste
                 console.log(
                     `--- initializeComponents: ${componentId}: Odczytane dane - HTML dł:${html.length}, CSS dł:${css.length}, JS dł:${js.length}`
                 );

                // Zapisz odczytane dane w mapie componentDataMap, używając unikalnego ID komponentu jako klucza
                componentDataMap.set(componentId, { html, css, js });
                 console.log(`--- initializeComponents: ${componentId}: Dane odczytane i zapisane w mapie.`);

                 // Opcjonalnie: Usuń kontener danych z DOM po odczytaniu, aby nie zaśmiecał drzewa DOM w przeglądarce
                 // dataContainer.remove();

            } else {
                // Zaloguj błąd, jeśli kontener danych nie został znaleziony dla tego komponentu
                console.error(`--- initializeComponents: ${componentId}: Nie znaleziono ukrytego kontenera danych.`);
                // Nie możemy poprawnie zainicjalizować komponentu bez jego danych, więc zakończ przetwarzanie TEGO komponentu
                return;
            }
        } else {
             // Zaloguj, jeśli dane dla tego komponentu były już w mapie (np. po astro:after-swap dla istniejącego elementu)
             console.log(`--- initializeComponents: ${componentId}: Dane już w mapie. Pomijam odczyt z DOM.`);
        }

        // --- Inicjalizacja Logiki Komponentu (Tabs i Kopiowanie) ---
        // Uruchom funkcje setupTabs i setupClipboard dla TEGO konkretnego elementu komponentu.
        // Robimy to ZAWSZE dla znalezionego elementu, ponieważ listenery zdarzeń muszą być dodane do OBECNYCH elementów DOM.
         console.log(`--- initializeComponents: ${componentId}: Uruchamiam setupTabs i setupClipboard.`);
        setupTabs(component); // setupTabs potrzebuje elementu komponentu, aby znaleźć jego wewnętrzne elementy
        setupClipboard(component); // setupClipboard potrzebuje elementu komponentu, aby znaleźć jego przyciski kopiowania
    });
     console.log('--- initializeComponents: Inicjalizacja komponentów zakończona.');
}


// --- Listenery Zdarzeń Globalnych ---

// Uruchom proces inicjalizacji komponentów, gdy cały DOM zostanie załadowany.
document.addEventListener('DOMContentLoaded', () => {
    console.log('--- Global Event: DOMContentLoaded fired, uruchamiam initializeComponents().');
    initializeComponents();
});

// Uruchom proces inicjalizacji komponentów ponownie po zakończeniu nawigacji View Transitions
// (czyli po podmianie treści DOM przez Astro).
document.addEventListener('astro:after-swap', () => {
    console.log('--- Global Event: astro:after-swap fired, uruchamiam initializeComponents().');
    // initializeComponents znajdzie nowe elementy dodane do DOM przez View Transitions
    // i zainicjalizuje je (odczyta dane, jeśli nie są w mapie, doda listenery).
    initializeComponents();
});

// Uwaga: Upewnij się, że ten plik clipboard.js jest dołączony tylko raz w Twoim layoutcie
// (np. w tagu <script src="/scripts/clipboard.js" defer></script> w <head>).
// Podwójne dołączenie spowoduje podwójne dodanie globalnych listenerów zdarzeń.

// Uwaga: Pamiętaj o podstawowych stylach CSS dla <pre> i <code> w stylach komponentu lub globalnych,
// oraz o stylach dla podświetlania składni, jeśli go używasz.