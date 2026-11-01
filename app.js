// --- SISTEMA DE USUARIOS (SIMULADO) ---
function actualizarInterfazUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  const btnSidebar = document.getElementById('btnSidebarUser');
  const contador = document.getElementById('contadorUsuarios');

  // --- LÓGICA DEL CONTADOR DE VISITAS REAL ---
  let visitas = parseInt(localStorage.getItem('visitasAprendeYa') || '1204');
  
  // Solo sumamos 1 visita por sesión (para que no suba 10 veces si recargas rápido)
  if (!sessionStorage.getItem('visitaContada')) {
    visitas++;
    localStorage.setItem('visitasAprendeYa', visitas.toString());
    sessionStorage.setItem('visitaContada', 'true');
  }

  if (contador) contador.textContent = visitas.toLocaleString();

  // --- LÓGICA DEL USUARIO ---
  if (usuario && btnSidebar) {
    btnSidebar.innerHTML = `<span class="text-lg">👤</span> Hola, ${usuario.nombre.split(' ')[0]}`;
    btnSidebar.onclick = () => window.location.href = 'perfil.html';
    btnSidebar.classList.remove('bg-[#1A1A1A]', 'dark:bg-white', 'text-white', 'dark:text-black');
    btnSidebar.classList.add('bg-blue-600', 'text-white');
  }
}
