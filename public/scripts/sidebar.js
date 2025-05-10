/**
 * Skrypt do obsługi responsywnego sidebaru
 * Zapisz jako: /public/scripts/sidebar.js
 */

document.addEventListener('DOMContentLoaded', function () {
	// Selektory elementów
	const sidebarToggle = document.getElementById('sidebar-toggle');
	const sidebar = document.getElementById('sidebar');
	const sidebarOverlay = document.getElementById('sidebar-overlay');
	const sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
	const body = document.body;

	// Sprawdzenie, czy elementy istnieją
	if (!sidebar || !sidebarToggle) {
		console.warn('Brakuje elementów sidebaru na stronie');
		return;
	}

	// Funkcja przełączająca widoczność sidebaru
	function toggleSidebar() {
		const isVisible = !sidebar.classList.contains('-translate-x-full');

		if (isVisible) {
			// Ukryj sidebar
			sidebar.classList.add('-translate-x-full');
			sidebarToggle.setAttribute('aria-expanded', 'false');
			body.classList.remove('sidebar-open');

			// Ukryj overlay
			if (sidebarOverlay) {
				sidebarOverlay.classList.add('hidden');
			}

			// Odblokuj scrollowanie
			body.style.overflow = '';
		} else {
			// Pokaż sidebar
			sidebar.classList.remove('-translate-x-full');
			sidebarToggle.setAttribute('aria-expanded', 'true');
			body.classList.add('sidebar-open');

			// Pokaż overlay
			if (sidebarOverlay) {
				sidebarOverlay.classList.remove('hidden');
			}

			// Zablokuj scrollowanie na mobilnych urządzeniach
			if (window.innerWidth < 768) {
				body.style.overflow = 'hidden';
			}
		}
	}

	// Event listener dla przycisku toggle
	sidebarToggle.addEventListener('click', toggleSidebar);

	// Event listener dla overlay
	if (sidebarOverlay) {
		sidebarOverlay.addEventListener('click', toggleSidebar);
	}

	// Event listenery dla linków w sidebar - zamykają sidebar po kliknięciu na mobilnych
	sidebarLinks.forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth < 768) {
				toggleSidebar();
			}
		});
	});

	// Zamykanie sidebaru przy naciśnięciu Escape
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
			toggleSidebar();
		}
	});

	// Obsługa zmiany rozmiaru okna
	window.addEventListener('resize', function () {
		// Na większych ekranach sidebar powinien być zawsze widoczny
		if (window.innerWidth >= 1024) {
			sidebar.classList.remove('-translate-x-full');
			body.style.overflow = '';

			if (sidebarOverlay) {
				sidebarOverlay.classList.add('hidden');
			}
		} else if (window.innerWidth < 1024 && !body.classList.contains('sidebar-open')) {
			// Na mniejszych ekranach domyślnie ukrywamy sidebar, chyba że jest otwarty
			sidebar.classList.add('-translate-x-full');
		}
	});

	// Inicjalizacja stanu sidebara przy załadowaniu strony
	if (window.innerWidth < 1024) {
		sidebar.classList.add('-translate-x-full');
	} else {
		sidebar.classList.remove('-translate-x-full');
	}

	// Obsługa View Transitions - upewnij się, że sidebar zachowuje stan po przejściu
	document.addEventListener('astro:after-swap', function () {
		// Pobierz ponownie referencje do elementów (po przejściu mogą być nowe)
		const newSidebar = document.getElementById('sidebar');
		const newOverlay = document.getElementById('sidebar-overlay');

		if (newSidebar && window.innerWidth >= 1024) {
			newSidebar.classList.remove('-translate-x-full');
		} else if (newSidebar && window.innerWidth < 1024 && !body.classList.contains('sidebar-open')) {
			newSidebar.classList.add('-translate-x-full');
		}

		if (newOverlay && !body.classList.contains('sidebar-open')) {
			newOverlay.classList.add('hidden');
		}
	});
});
