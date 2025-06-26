// portfolio.js

// Menu toggle para mobile
const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');

menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('active');
});

// Scroll suave com offset para links internos
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    const targetID = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetID);
    if (!targetElement) return;

    const offset = 70; // Ajuste conforme o tamanho do header sticky

    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });

    // Fechar menu mobile ao clicar em link
    if (navbar.classList.contains('active')) {
      navbar.classList.remove('active');
    }
  });
});

// Função para ativar animação fade-in em seções conforme scroll
function handleScrollAnimation() {
  const fadeElems = document.querySelectorAll('.fade-in');

  fadeElems.forEach(elem => {
    const rect = elem.getBoundingClientRect();
    const elemTop = rect.top;
    const elemBottom = rect.bottom;
    const windowHeight = window.innerHeight;

    // Ativar quando aparecer pelo menos 100px na tela
    if (elemTop < windowHeight - 100 && elemBottom > 100) {
      elem.classList.add('visible');
    } else {
      elem.classList.remove('visible');
    }
  });
}

// Executa ao carregar a página e ao scrollar
window.addEventListener('scroll', handleScrollAnimation);
window.addEventListener('load', handleScrollAnimation);
