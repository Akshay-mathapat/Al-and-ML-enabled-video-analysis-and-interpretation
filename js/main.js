// Main Javascript for Global interactions (Theme toggling, smooth scrolling)

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // Check saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
      document.body.classList.add('light-mode');
      themeToggle.innerHTML = '<i class="ri-moon-line"></i>';
    }

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      let theme = 'dark';
      if (document.body.classList.contains('light-mode')) {
        theme = 'light';
        themeToggle.innerHTML = '<i class="ri-moon-line"></i>';
      } else {
        themeToggle.innerHTML = '<i class="ri-sun-line"></i>';
      }
      localStorage.setItem('theme', theme);
    });
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Update active nav state
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });
});
