// ============================================
// APPRENDEYA - LÓGICA DE LA PÁGINA DE INICIO
// ============================================

function procesarEntrada() {
  const textarea = document.getElementById('textInput');
  const texto = textarea ? textarea.value.trim() : '';
  const status = document.getElementById('status');

  if (!texto) {
    if (status) status.textContent = '⚠️ Por favor, escribe algo primero.';
    return;
  }

  const nombreKit = prompt("Ponle un nombre a este kit de estudio (Ej: Finanzas):", "Mi Kit");
  if (!nombreKit) return;

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.setItem('nombreMaterial', nombreKit);
  localStorage.removeItem('materialGenerado');
  localStorage.removeItem('textoGenerado');
  
  if (status) status.textContent = '🚀 Generando material...';

  setTimeout(() => {
    window.location.href = 'study.html';
  }, 500);
}

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('modoOscuro', isDark ? 'true' : 'false');
  
  const icono = document.getElementById('iconoDark');
  const texto = document.getElementById('textoDark');
  if (icono && texto) {
    icono.textContent = isDark ? '☀️' : '🌙';
    texto.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
  }
}

function cargarFraseDelDia() {
  const el = document.getElementById('fraseDiaria');
  if (el) el.textContent = '"El éxito es la suma de pequeños esfuerzos repetidos día tras día."';
}

document.addEventListener('DOMContentLoaded', () => {
  cargarFraseDelDia();
  if (localStorage.getItem('modoOscuro') === 'true') {
    document.documentElement.classList.add('dark');
    const icono = document.getElementById('iconoDark');
    const texto = document.getElementById('textoDark');
    if (icono && texto) {
      icono.textContent = '☀️';
      texto.textContent = 'Modo Claro';
    }
  }
});
