/**
 * Skrypt inicjalizujący kolorowanie składni po przełączeniu się między zakładkami
 * Plik należy umieścić jako: /public/scripts/prism-initializer.js
 */

document.addEventListener('DOMContentLoaded', function () {
	// Funkcja do inicjalizacji/reinicjalizacji kolorowania składni
	function initSyntaxHighlighting() {
		if (window.Prism) {
			Prism.highlightAll();
		}
	}

	// Wywołanie inicjalizacji podczas ładowania strony
	initSyntaxHighlighting();

	// Nasłuchiwanie na kliknięcia w zakładki
	const tabButtons = document.querySelectorAll('.tab-button');

	tabButtons.forEach(button => {
		button.addEventListener('click', function () {
			// Daj chwilę na zmianę widoczności elementów DOM
			setTimeout(initSyntaxHighlighting, 50);
		});
	});

	// Nasłuchiwanie na zmiany w select (dla urządzeń mobilnych)
	const tabSelects = document.querySelectorAll('.tab-select');

	tabSelects.forEach(select => {
		select.addEventListener('change', function () {
			// Daj chwilę na zmianę widoczności elementów DOM
			setTimeout(initSyntaxHighlighting, 50);
		});
	});

	// Reinicjalizacja kolorowania składni po przejściach View Transitions
	document.addEventListener('astro:after-swap', initSyntaxHighlighting);
});

// Zapewnienie, że Prism będzie odświeżany po załadowaniu dynamicznych treści
document.addEventListener('astro:page-load', function () {
	if (window.Prism) {
		Prism.highlightAll();
	}
});
