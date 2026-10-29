// --- FUNCIONES DEL MODAL DE LOGIN ---
const modal = document.getElementById('modalLogin');
function abrirModal() { if(modal){ modal.classList.remove('hidden'); modal.classList.add('flex'); } }
function cerrarModal() { if(modal){ modal.classList.add('hidden'); modal.classList.remove('flex'); } }
if(modal) { modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); }); }

// --- FUNCIONES DE LOS MODALES DE INFORMACIÓN ---
function abrirModalInfo(tipo) {
  const modalInfo = document.getElementById('modalInfo');
  const titulo = document.getElementById('infoTitulo');
  const contenido = document.getElementById('infoContenido');

  if (!modalInfo) return;

  if (tipo === 'sobre') {
    titulo.textContent = 'Sobre AprendeYa 🚀';
    contenido.innerHTML = '<p>Somos una plataforma diseñada para revolucionar la forma en que estudias. Utilizamos inteligencia artificial para transformar tus apuntes aburridos en herramientas dinámicas de aprendizaje.</p><p>Nuestra misión es que apruebes con menos esfuerzo y más retención.</p>';
  } else if (tipo === 'recomendaciones') {
    titulo.textContent = 'Consejos de Estudio 💡';
    contenido.innerHTML = '<ul class="list-disc pl-5 space-y-2"><li>Estudia en bloques de 25 minutos (Técnica Pomodoro).</li><li>Usa nuestras tarjetas todos los días, la constancia es clave.</li><li>No solo memorices, usa el Quiz para entender los conceptos.</li><li>Explícale a alguien más lo que aprendiste (Técnica Feynman).</li></ul>';
  } else if (tipo === 'contacto') {
    titulo.textContent = 'Contacto ✉️';
    contenido.innerHTML = '<p>¿Tienes dudas, sugerencias o encontraste un error?</p><p>Escríbenos a: <strong>soporte@aprendeya.com</strong></p>';
  }

  modalInfo.classList.remove('hidden');
  modalInfo.classList.add('flex');
}

function cerrarModalInfo() {
  const modalInfo = document.getElementById('modalInfo');
  if (modalInfo) {
    modalInfo.classList.add('hidden');
    modalInfo.classList.remove('flex');
  }
}

// --- LECTURA DE ARCHIVOS ---
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

// --- PROCESAR Y GUARDAR KIT ---
function procesarEntrada() {
  const textarea = document.getElementById('textInput');
  const texto = textarea.value.trim();
  const status = document.getElementById('status');

  if (!texto) {
    status.textContent = '⚠️ Por favor, sube un archivo o escribe algo primero.';
    return;
  }

  // Pedir nombre para el kit
  const nombreKit = prompt("Ponle un nombre a este kit de estudio (Ej: Contabilidad Básica):", "Mi Kit");
  if (!nombreKit) return;

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.setItem('nombreMaterial', nombreKit);
  localStorage.removeItem('materialGenerado'); 
  
  status.textContent = '🚀 Generando material...';

  // 🛠️ EL TRUCO: Esperamos medio segundo para asegurar que el navegador guarde el texto
  setTimeout(() => {
    window.location.href = 'study.html';
  }, 500);
}
