// Alternar abas
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(btn => btn.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// Alternar visibilidade da senha
function togglePassword(id, el) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    el.innerText = "Esconder";
  } else {
    input.type = "password";
    el.innerText = "Mostrar";
  }
}

// Trocar de aba pelo script
function switchTab(targetId) {
  tabs.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetId);
  });
  contents.forEach(c => {
    c.classList.toggle('active', c.id === targetId);
  });
}
