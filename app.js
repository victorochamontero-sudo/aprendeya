// ============================================
// APPRENDEYA - LÓGICA DE LA PÁGINA DE INICIO (v2.0)
// ============================================

// --- CONFIGURACIÓN INICIAL ---
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// --- LECTURA DE ARCHIVOS ---
async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('status');
  const textarea = document.getElementById('textInput');
  if (status) status.textContent = '⏳ Extrayendo texto del archivo...';

  try {
    let texto = '';
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      texto = await extraerTextoPDF(file);
    } else if (fileName.endsWith('.docx')) {
      texto = await extraerTextoWord(file);
    } else {
      texto = await file.text();
    }

    if (!texto.trim()) {
      if (status) status.textContent = '⚠️ No se encontró texto legible.';
      return;
    }

    textarea.value = texto.slice(0, 8000);
    localStorage.setItem('borradorTexto', textarea.value);
    if (status) status.textContent = '✅ Texto cargado. Puedes editarlo o hacer clic en "Generar con IA".';
  } catch (err) {
    if (status) status.textContent = '❌ Error al leer el archivo: ' + err.message;
    console.error(err);
  }
}

async function extraerTextoPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let texto = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(item => item.str).join(' ') + '\n';
  }
  return texto;
}

async function extraerTextoWord(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

// --- PROCESAR ENTRADA Y GENERAR KIT ---
function procesarEntrada() {
  const textarea = document.getElementById('textInput');
  const youtubeInput = document.getElementById('youtubeInput');
  const status = document.getElementById('status');
  const opcionYoutube = document.getElementById('opcionYoutube');

  let texto = '';
  const esYoutube = opcionYoutube && !opcionYoutube.classList.contains('hidden');

  if (esYoutube) {
    const url = youtubeInput ? youtubeInput.value.trim() : '';
    if (!url) {
      if (status) status.textContent = '⚠️ Por favor, pega un link de YouTube.';
      return;
    }
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      if (status) status.textContent = '⚠️ El link no parece ser de YouTube.';
      return;
    }
    texto = `Video de YouTube: ${url}\n\n[Contenido del video]`;
  } else {
    texto = textarea ? textarea.value.trim() : '';
    if (!texto) {
      if (status) status.textContent = '⚠️ Por favor, sube un archivo o escribe algo primero.';
      return;
    }
  }

  const nombreKit = prompt("Ponle un nombre a este kit de estudio (Ej: Contabilidad Básica):", "Mi Kit");
  if (!nombreKit || !nombreKit.trim()) return;

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.setItem('nombreMaterial', nombreKit.trim());
  localStorage.removeItem('materialGenerado');
  localStorage.removeItem('textoGenerado');

  if (status) status.textContent = '🚀 Generando material...';

  setTimeout(() => {
    window.location.href = 'study.html';
  }, 500);
}

// --- SISTEMA DE USUARIOS (SIMULADO) ---
function actualizarInterfazUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  const btnSidebar = document.getElementById('btnSidebarUser');
  const contador = document.getElementById('contadorUsuarios');

  let contadorBase = 1204;
  if (usuario) contadorBase++;
  if (contador) contador.textContent = contadorBase.toLocaleString();

  if (usuario && btnSidebar) {
    btnSidebar.innerHTML = `<span class="text-lg">👤</span> Hola, ${usuario.nombre.split(' ')[0]}`;
    btnSidebar.onclick = () => window.location.href = 'perfil.html';
    btnSidebar.classList.remove('bg-[#1A1A1A]', 'dark:bg-white', 'text-white', 'dark:text-black');
    btnSidebar.classList.add('bg-blue-600', 'text-white');
  }
}

function cambiarAuthTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegistro = document.getElementById('tab-registro');
  const formLogin = document.getElementById('form-login');
  const formRegistro = document.getElementById('form-registro');
  if (!tabLogin || !tabRegistro) return;

  if (tab === 'login') {
    tabLogin.className = 'flex-1 pb-3 text-sm font-bold text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white transition';
    tabRegistro.className = 'flex-1 pb-3 text-sm font-bold text-[#8A8580] hover:text-[#1A1A1A] dark:hover:text-white transition';
    formLogin.classList.remove('hidden');
    formRegistro.classList.add('hidden');
  } else {
    tabLogin.className = 'flex-1 pb-3 text-sm font-bold text-[#8A8580] hover:text-[#1A1A1A] dark:hover:text-white transition';
    tabRegistro.className = 'flex-1 pb-3 text-sm font-bold text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white transition';
    formLogin.classList.add('hidden');
    formRegistro.classList.remove('hidden');
  }
}

function registrarUsuario() {
  const nombre = document.getElementById('regNombre').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!nombre || !email || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  if (password.length < 4) {
    alert('La contraseña debe tener al menos 4 caracteres.');
    return;
  }

  localStorage.setItem('usuarioAprendeYa', JSON.stringify({ nombre, email, password }));
  alert(`¡Registro exitoso, ${nombre}! Bienvenido a AprendeYa. 🚀`);
  cerrarModalLogin();
  actualizarInterfazUsuario();
}

function iniciarSesion() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');

  if (usuarioGuardado && usuarioGuardado.email === email && usuarioGuardado.password === password) {
    alert(`¡Hola de nuevo, ${usuarioGuardado.nombre}! 👋`);
    cerrarModalLogin();
    actualizarInterfazUsuario();
  } else {
    alert('Correo o contraseña incorrectos. Intenta de nuevo.');
  }
}

function recuperarPassword(e) {
  if (e) e.preventDefault();
  const email = prompt("Ingresa el correo con el que te registraste:");
  if (!email) return;
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  if (usuarioGuardado && usuarioGuardado.email === email) {
    alert(`Tu contraseña es: ${usuarioGuardado.password}\n\n(En producción se enviaría un correo de recuperación).`);
  } else {
    alert('No encontramos ninguna cuenta con ese correo.');
  }
}

// --- MODALES ---
function abrirModalLogin() {
  const modal = document.getElementById('modalLogin');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function cerrarModalLogin() {
  const modal = document.getElementById('modalLogin');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function abrirModalInfo(tipo) {
  const modal = document.getElementById('modalInfo');
  const titulo = document.getElementById('infoTitulo');
  const contenido = document.getElementById('infoContenido');
  if (!modal || !titulo || !contenido) return;

  if (tipo === 'sobre') {
    titulo.textContent = 'Sobre AprendeYa 🚀';
    contenido.innerHTML = '<p>Transformamos tus apuntes aburridos en herramientas dinámicas de aprendizaje. Nuestra misión es que apruebes con menos esfuerzo y más resultados.</p><p class="mt-3">Creado con ❤️ para estudiantes que quieren aprender mejor.</p>';
  } else if (tipo === 'recomendaciones') {
    titulo.textContent = 'Consejos de Estudio 💡';
    contenido.innerHTML = '<ul class="list-disc pl-5 space-y-2"><li><strong>Pomodoro:</strong> estudia 25 min y descansa 5 min.</li><li><strong>Repetición espaciada:</strong> repasa las tarjetas a diario.</li><li><strong>Técnica Feynman:</strong> explica lo aprendido con tus propias palabras.</li><li><strong>Descanso:</strong> duerme bien, tu cerebro consolida lo aprendido mientras duermes.</li></ul>';
  } else if (tipo === 'contacto') {
    titulo.textContent = 'Contacto ✉️';
    contenido.innerHTML = '<p>Escríbenos a: <strong>soporte@aprendeya.com</strong></p><p class="mt-2">Síguenos en redes sociales para más tips de estudio.</p>';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModalInfo() {
  const modal = document.getElementById('modalInfo');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// --- COMPARTIR APP ---
function compartirApp() {
  const texto = "¡Estoy estudiando con AprendeYa! 🚀 Sube tus apuntes y deja que la IA te cree tarjetas y pruebas. Pruébalo gratis aquí:";
  const url = "https://victorochamontero-sudo.github.io/aprendeya/";
  if (navigator.share) {
    navigator.share({ title: 'AprendeYa', text: texto, url: url }).catch(console.error);
  } else {
    navigator.clipboard.writeText(`${texto} ${url}`).then(() => {
      alert('¡Enlace copiado al portapapeles!');
    }).catch(() => {
      alert(`Comparte este enlace: ${url}`);
    });
  }
}

// --- CAMBIAR ENTRE TEXTO Y YOUTUBE ---
function mostrarOpcion(tipo) {
  const tabTexto = document.getElementById('tab-texto');
  const tabYoutube = document.getElementById('tab-youtube');
  const opcionTexto = document.getElementById('opcionTexto');
  const opcionYoutube = document.getElementById('opcionYoutube');
  if (!tabTexto || !tabYoutube) return;

  if (tipo === 'texto') {
    tabTexto.className = 'text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white pb-2 px-2 transition';
    tabYoutube.className = 'hover:text-[#1A1A1A] dark:hover:text-white pb-2 px-2 transition';
    opcionTexto.classList.remove('hidden');
    opcionYoutube.classList.add('hidden');
  } else {
    tabTexto.className = 'hover:text-[#1A1A1A] dark:hover:text-white pb-2 px-2 transition';
    tabYoutube.className = 'text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white pb-2 px-2 transition';
    opcionTexto.classList.add('hidden');
    opcionYoutube.classList.remove('hidden');
  }
}

// --- MODO OSCURO ---
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

// --- FRASE DEL DÍA ---
const frases = [
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No te preocupes por los fracasos, preocúpate por las oportunidades que pierdes cuando no lo intentas.",
  "La disciplina es el puente entre las metas y los logros.",
  "Cada experto fue una vez un principiante que no se rindió.",
  "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor momento es ahora.",
  "No tienes que ser grande para empezar, pero tienes que empezar para ser grande.",
  "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
  "Estudia no para saber más, sino para saber mejor."
];

function cargarFraseDelDia() {
  const el = document.getElementById('fraseDiaria');
  if (!el) return;
  const fecha = new Date();
  const diaDelAnio = Math.floor((fecha - new Date(fecha.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const indiceFrase = diaDelAnio % frases.length;
  el.textContent = `"${frases[indiceFrase]}"`;
}

// --- RECUPERAR BORRADOR ---
function recuperarBorrador() {
  const textarea = document.getElementById('textInput');
  const borrador = localStorage.getItem('borradorTexto');
  if (textarea && borrador && !textarea.value.trim()) {
    textarea.value = borrador;
  }
}

// --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  // Modo oscuro
  if (localStorage.getItem('modoOscuro') === 'true') {
    document.documentElement.classList.add('dark');
    const icono = document.getElementById('iconoDark');
    const texto = document.getElementById('textoDark');
    if (icono && texto) {
      icono.textContent = '☀️';
      texto.textContent = 'Modo Claro';
    }
  }

  // Frase del día
  cargarFraseDelDia();

  // Interfaz de usuario
  actualizarInterfazUsuario();

  // Recuperar borrador
  recuperarBorrador();
});
