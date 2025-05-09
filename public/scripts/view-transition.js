document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.view-link');
  
    links.forEach(link => {
      link.addEventListener('click', async e => {
        e.preventDefault();
        const url = link.getAttribute('href');
  
        if (!document.startViewTransition) {
          window.location.href = url;
          return;
        }
  
        document.startViewTransition(async () => {
          const res = await fetch(url);
          const text = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const newContent = doc.querySelector('.view-container');
  
          document.querySelector('.view-container').innerHTML = newContent.innerHTML;
          window.history.pushState({}, '', url);
        });
      });
    });
  });
  