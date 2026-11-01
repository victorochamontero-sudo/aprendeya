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
