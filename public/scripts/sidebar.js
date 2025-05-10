document.addEventListener('DOMContentLoaded', function () {
	// Selectors for essential elements
	const sidebarToggle = document.getElementById('sidebar-toggle');
	const sidebar = document.getElementById('sidebar');
	const sidebarOverlay = document.getElementById('sidebar-overlay');
	const sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
	const body = document.body;
	const mainContent = document.getElementById('main-content');

	// Check if elements exist
	if (!sidebar || !sidebarToggle) {
		console.warn('Missing sidebar elements on page');
		return;
	}

	// Force sidebar visibility
	sidebar.style.visibility = 'visible';
	sidebar.style.display = 'block';

	// Function to toggle sidebar visibility
	function toggleSidebar() {
		const isVisible = !sidebar.classList.contains('-translate-x-full');

		if (isVisible) {
			// Hide sidebar
			sidebar.classList.add('-translate-x-full');
			sidebarToggle.setAttribute('aria-expanded', 'false');
			body.classList.remove('sidebar-open');

			// Hide overlay
			if (sidebarOverlay) {
				sidebarOverlay.classList.add('hidden');
			}

			// Unblock scrolling
			body.style.overflow = '';
			if (mainContent) {
				mainContent.style.filter = '';
				mainContent.style.pointerEvents = 'auto';
			}
		} else {
			// Show sidebar
			sidebar.classList.remove('-translate-x-full');
			sidebarToggle.setAttribute('aria-expanded', 'true');
			body.classList.add('sidebar-open');

			// Show overlay
			if (sidebarOverlay) {
				sidebarOverlay.classList.remove('hidden');
			}

			// Block scrolling on mobile devices
			if (window.innerWidth < 768) {
				body.style.overflow = 'hidden';
				if (mainContent) {
					mainContent.style.filter = 'blur(2px)';
					mainContent.style.pointerEvents = 'none';
				}
			}
		}
	}

	// Event listener for toggle button
	sidebarToggle.addEventListener('click', toggleSidebar);

	// Event listener for overlay
	if (sidebarOverlay) {
		sidebarOverlay.addEventListener('click', toggleSidebar);
	}

	// Event listeners for links in sidebar - close sidebar after click on mobile
	sidebarLinks.forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth < 768) {
				toggleSidebar();
			}
		});
	});

	// Close sidebar when pressing Escape
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
			toggleSidebar();
		}
	});

	// Handle window resize
	window.addEventListener('resize', function () {
		// On larger screens, sidebar should always be visible
		if (window.innerWidth >= 1024) {
			sidebar.classList.remove('-translate-x-full');
			sidebar.style.transform = '';
			body.style.overflow = '';
			mainContent.style.filter = '';
			mainContent.style.pointerEvents = 'auto';

			if (sidebarOverlay) {
				sidebarOverlay.classList.add('hidden');
			}
		} else if (window.innerWidth < 1024 && !body.classList.contains('sidebar-open')) {
			// On smaller screens, default to hiding sidebar unless it's open
			sidebar.classList.add('-translate-x-full');
		}

		// Fix sidebar element visibility
		fixSidebarVisibility();
	});

	// Initialize sidebar state on page load
	if (window.innerWidth < 1024) {
		sidebar.classList.add('-translate-x-full');
	} else {
		sidebar.classList.remove('-translate-x-full');
	}

	// Handle View Transitions - ensure sidebar maintains state after transition
	document.addEventListener('astro:after-swap', function () {
		// Get references to elements again (they may be new after transition)
		const newSidebar = document.getElementById('sidebar');
		const newOverlay = document.getElementById('sidebar-overlay');
		const newMainContent = document.getElementById('main-content');

		if (newSidebar) {
			if (window.innerWidth >= 1024) {
				newSidebar.classList.remove('-translate-x-full');
				newSidebar.style.transform = '';
			} else if (window.innerWidth < 1024 && !body.classList.contains('sidebar-open')) {
				newSidebar.classList.add('-translate-x-full');
			}
		}

		if (newOverlay && !body.classList.contains('sidebar-open')) {
			newOverlay.classList.add('hidden');
		}

		// Fix visibility of elements
		fixSidebarVisibility();

		// Adjust main content
		if (newMainContent && window.innerWidth >= 1024) {
			newMainContent.classList.add('md:ml-64');
		} else if (newMainContent) {
			newMainContent.classList.remove('md:ml-64');
		}
	});

	// Function to fix sidebar visibility issues
	function fixSidebarVisibility() {
		if (!sidebar) return;

		// Make sure sidebar and all its children are visible
		sidebar.style.visibility = 'visible';
		sidebar.style.display = 'block';

		const allElements = sidebar.querySelectorAll('*');
		allElements.forEach(el => {
			if (el.tagName === 'A') {
				el.style.display = 'flex';
			} else if (el.tagName === 'SVG') {
				el.style.display = 'inline-block';
			} else if (el.tagName === 'SPAN' && el.classList.contains('flex-1')) {
				el.style.display = 'block';
			} else {
				el.style.visibility = 'visible';
			}
		});
	}

	// Run the fix on load
	fixSidebarVisibility();
});
