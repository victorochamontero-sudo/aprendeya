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
    status.textContent = '✅ Texto cargado. Haz clic en "Generar con IA".';
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
  const youtubeInput = document.getElementById('youtubeInput');
  const status = document.getElementById('status');
  
  let texto = '';
  let esYoutube = !document.getElementById('opcionYoutube').classList.contains('hidden');

  if (esYoutube) {
    const url = youtubeInput.value.trim();
    if (!url) {
      status.textContent = '⚠️ Por favor, pega un link de YouTube.';
      return;
    }
    // Extraemos el ID del video de la URL
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!videoId) {
      status.textContent = '⚠️ El link de YouTube no es válido.';
      return;
    }
    // Simulamos la transcripción del video (La API de YouTube no permite hacerlo desde el frontend sin un servidor)
    texto = `[Transcripción simulada del video de YouTube ID: ${videoId[1]}]\n\nEl video trata sobre conceptos básicos de estudio y aprendizaje. La IA procesará este texto como si fuera la transcripción real del video.`;
    
    // NOTA: En producción esto debería llamar a un backend para usar la API de YouTube.
    // Aquí usamos un texto de prueba para que la función no falle.
    alert('⚠️ En esta versión de prueba, la transcripción de YouTube es simulada. En la próxima versión, se conectará a un backend para extraer el texto real del video.');
    
  } else {
    texto = textarea.value.trim();
    if (!texto) {
      status.textContent = '⚠️ Por favor, sube un archivo o escribe algo primero.';
      return;
    }
  }

  // LÓGICA FREEMIUM
  const usuarioLogueado = localStorage.getItem('usuarioAprendeYa');
  const yaProbo = localStorage.getItem('pruebaGratisUsada');

  if (!usuarioLogueado && yaProbo) {
    status.textContent = '⛔ Has alcanzado el límite de prueba.';
    alert('¡Has creado tu kit de prueba! Para crear más kits ilimitados, por favor regístrate.');
    abrirModalRegistro();
    return;
  }

  const nombreKit = prompt("Ponle un nombre a este kit de estudio (Ej: Contabilidad Básica):", "Mi Kit de Prueba");
  if (!nombreKit) return;

  if (!usuarioLogueado) {
    localStorage.setItem('pruebaGratisUsada', 'true');
  }

  localStorage.setItem('material', texto.slice(0, 8000));
  localStorage.setItem('nombreMaterial', nombreKit);
  localStorage.removeItem('materialGenerado'); 
  
  status.textContent = '🚀 Generando material...';

  setTimeout(() => {
    window.location.href = 'study.html';
  }, 500);
}
