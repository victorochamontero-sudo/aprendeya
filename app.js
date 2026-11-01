async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('status');
  const textarea = document.getElementById('textInput');
  status.textContent = '⏳ Extrayendo texto del archivo...';

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
      status.textContent = '⚠️ No se encontró texto legible.';
      return;
    }

    textarea.value = texto.slice(0, 8000);
    localStorage.setItem('borradorTexto', textarea.value);
    status.textContent = '✅ Texto cargado. Puedes editarlo o hacer clic en "Generar con IA".';
  } catch (err) {
    status.textContent = '❌ Error al leer el archivo: ' + err.message;
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

function procesarEntrada() {
  const textarea = document.getElementById('textInput');
  const texto = textarea.value.trim();
  const status = document.getElementById('status');

  if (!texto) {
    status.textContent = '⚠️ Por favor, sube un archivo o escribe algo primero.';
    return;
  }

  const nombreKit = prompt("Ponle un nombre a este kit de estudio (Ej: Contabilidad Básica):", "Mi Kit");
  if (!nombreKit) return;

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.setItem('nombreMaterial', nombreKit);
  localStorage.removeItem('materialGenerado'); 
  
  status.textContent = '🚀 Generando material...';

  setTimeout(() => {
    window.location.href = 'study.html';
  }, 500);
}

// --- SISTEMA DE USUARIOS ---
function actualizarInterfazUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  const btnSidebar = document.getElementById('btnSidebarUser');
  const contador = document.getElementById('contadorUsuarios');
  
  // Contador de visitas
  let visitas = parseInt(localStorage.getItem('visitasAprendeYa') || '1204');
  if (!sessionStorage.getItem('visitaContada')) {
    visitas++;
    localStorage.setItem('visitasAprendeYa', visitas.toString());
    sessionStorage.setItem('visitaContada', 'true');
  }
  if (contador) contador.textContent = visitas.toLocaleString();

  if (usuario && btnSidebar) {
    btnSidebar.innerHTML = `Hola, ${usuario.nombre.split(' ')[0]}`;
    btnSidebar.onclick = () => window.location.href = 'perfil.html';
  }
}

function cambiarAuthTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegistro = document.getElementById('tab-registro');
  const formLogin = document.getElementById('form-login');
  const formRegistro = document.getElementById('form-registro');
  if (tab === 'login') {
    tabLogin.className = 'flex-1 pb-3 text-sm font-bold text-[#1A1A1A] border-b-2 border-[#1A1A1A] transition';
    tabRegistro.className = 'flex-1 pb-3 text-sm font-bold text-[#8A8580] hover:text-[#1A1A1A] transition';
    formLogin.classList.remove('hidden');
    formRegistro.classList.add('hidden');
  } else {
    tabLogin.className = 'flex-1 pb-3 text-sm font-bold text-[#8A8580] hover:text-[#1A1A1A] transition';
    tabRegistro.className = 'flex-1 pb-3 text-sm font-bold text-[#1A1A1A] border-b-2 border-[#1A1A1A] transition';
    formLogin.classList.add('hidden');
    formRegistro.classList.remove('hidden');
  }
}

function registrarUsuario() {
  const nombre = document.getElementById('regNombre').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  localStorage.setItem('usuarioAprendeYa', JSON.stringify({ nombre, email, password }));
  alert('¡Registro exitoso! Bienvenido a AprendeYa.');
  cerrarModalLogin();
  actualizarInterfazUsuario();
}

function iniciarSesion() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  if (usuarioGuardado && usuarioGuardado.email === email && usuarioGuardado.password === password) {
    alert(`¡Hola de nuevo, ${usuarioGuardado.nombre}!`);
    cerrarModalLogin();
    actualizarInterfazUsuario();
  } else {
    alert('Correo o contraseña incorrectos. Intenta de nuevo.');
  }
}

function recuperarPassword(e) {
  e.preventDefault();
  const email = prompt("Ingresa el correo con el que te registraste:");
  const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioAprendeYa') || 'null');
  if (usuarioGuardado && usuarioGuardado.email === email) {
    alert(`Tu contraseña es: ${usuarioGuardado.password}.`);
  } else {
    alert('No encontramos ninguna cuenta con ese correo.');
  }
}

function abrirModalLogin() { document.getElementById('modalLogin').classList.remove('hidden'); document.getElementById('modalLogin').classList.add('flex'); }
function cerrarModalLogin() { document.getElementById('modalLogin').classList.add('hidden'); document.getElementById('modalLogin').classList.remove('flex'); }

function abrirModalInfo(tipo) {
  const modal = document.getElementById('modalInfo');
  const titulo = document.getElementById('infoTitulo');
  const contenido = document.getElementById('infoContenido');
  if (tipo === 'sobre') { titulo.textContent = 'Sobre AprendeYa 🚀'; contenido.innerHTML = '<p>Transformamos tus apuntes aburridos en herramientas dinámicas de aprendizaje.</p>'; }
  else if (tipo === 'recomendaciones') { titulo.textContent = 'Consejos de Estudio 💡'; contenido.innerHTML = '<ul class="list-disc pl-5 space-y-2"><li>Estudia en bloques de 25 minutos (Técnica Pomodoro).</li><li>Usa nuestras tarjetas a diario.</li><li>Explícale a alguien más lo que aprendiste.</li></ul>'; }
  else if (tipo === 'contacto') { titulo.textContent = 'Contacto ✉️'; contenido.innerHTML = '<p>Escríbenos a: <strong>soporte@aprendeya.com</strong></p>'; }
  modal.classList.remove('hidden'); modal.classList.add('flex');
}
function cerrarModalInfo() { document.getElementById('modalInfo').classList.add('hidden'); document.getElementById('modalInfo').classList.remove('flex'); }

function compartirApp() {
  const texto = "¡Estoy estudiando con AprendeYa! 🚀 Sube tus apuntes y deja que la IA te cree tarjetas y pruebas. Pruébalo gratis aquí:";
  const url = "https://victorochamontero-sudo.github.io/aprendeya/";
  if (navigator.share) { navigator.share({ title: 'AprendeYa', text: texto, url: url }).catch(console.error); } 
  else { navigator.clipboard.writeText(`${texto} ${url}`); alert('¡Enlace copiado al portapapeles!'); }
}

function mostrarOpcion(tipo) {
  const tabTexto = document.getElementById('tab-texto');
  const tabYoutube = document.getElementById('tab-youtube');
  const opcionTexto = document.getElementById('opcionTexto');
  const opcionYoutube = document.getElementById('opcionYoutube');
  if (tipo === 'texto') {
    tabTexto.className = 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-2 px-2 transition';
    tabYoutube.className = 'hover:text-[#1A1A1A] pb-2 px-2 transition';
    opcionTexto.classList.remove('hidden'); opcionYoutube.classList.add('hidden');
  } else {
    tabTexto.className = 'hover:text-[#1A1A1A] pb-2 px-2 transition';
    tabYoutube.className = 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-2 px-2 transition';
    opcionTexto.classList.add('hidden'); opcionYoutube.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarInterfazUsuario();
  const el = document.getElementById('fraseDiaria');
  if (el) el.textContent = '"El éxito es la suma de pequeños esfuerzos repetidos día tras día."';
});
