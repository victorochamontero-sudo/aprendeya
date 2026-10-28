// ---------- MODAL ----------
const modal = document.getElementById('modal');
function abrirModal() { modal.classList.remove('hidden'); modal.classList.add('flex'); }
function cerrarModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

// ---------- LECTURA DE ARCHIVOS ----------
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
      texto = await file.text(); // .txt
    }

    if (!texto.trim()) {
      status.textContent = '⚠️ No se encontró texto legible en el archivo.';
      return;
    }

    textarea.value = texto.slice(0, 8000); // Límite para la IA
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

// ---------- PROCESAR E IR A ESTUDIAR ----------
function procesarEntrada() {
  const textarea = document.getElementById('textInput');
  const texto = textarea.value.trim();
  const status = document.getElementById('status');

  if (!texto) {
    status.textContent = '⚠️ Por favor, sube un archivo o escribe algo primero.';
    return;
  }

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.removeItem('materialGenerado'); // Limpia la caché anterior
  
  status.textContent = '🚀 Generando material...';
  window.location.href = 'study.html';
}