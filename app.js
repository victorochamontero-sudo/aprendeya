// ---------- MODAL ----------
const modal = document.getElementById('modal');

function abrirModal() {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) cerrarModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal();
});

// ---------- SUBIDA DE ARCHIVOS ----------
async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  await procesarArchivo(file);
}

async function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('border-[#1A1A1A]');
  const file = e.dataTransfer.files[0];
  if (file) await procesarArchivo(file);
}

async function procesarArchivo(file) {
  const status = document.getElementById('status');
  status.textContent = '⏳ Extrayendo texto...';

  let texto = '';
  try {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      texto = await extraerTextoPDF(file);
    } else {
      texto = await file.text();
    }
  } catch (err) {
    status.textContent = '❌ Error al leer el archivo: ' + err.message;
    return;
  }

  if (!texto.trim()) {
    status.textContent = '⚠️ El archivo no contiene texto legible.';
    return;
  }

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.removeItem('materialGenerado'); // limpia cache anterior
  status.textContent = '✅ Texto listo. Generando material...';
  window.location.href = 'study.html';
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