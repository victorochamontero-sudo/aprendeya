let material = null;
let mazo = [];
let indiceActual = 0;
let mostrandoRespuesta = false;
let stats = { aprendiendo: 0, revisando: 0, dominado: 0 };
let generacionesExtra = 0; 
let sintetizador = window.speechSynthesis;

// Variables del Juego Coincidencias
let cartasJuego = [];
let primeraCarta = null;
let segundaCarta = null;
let bloqueoTablero = false;
let puntosJuego = 0;
let intentosJuego = 0;

// Variables del Juego Apilador
let torreAltura = 0;
let torreFallos = 0;
let preguntasApilador = [];
let indicePreguntaApilador = 0;

document.body.addEventListener('click', function() {
  if (sintetizador.speaking) return;
  const utterance = new SpeechSynthesisUtterance('');
  sintetizador.speak(utterance);
}, { once: true });

(async function init() {
  const texto = localStorage.getItem('material');
  const loadingDiv = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const btnError = document.getElementById('btnError');
  const spinner = document.getElementById('loadingSpinner');
  
  if (!texto) {
    loadingDiv.innerHTML = '<p class="text-sm text-[#8A8580]">No hay material. <a href="index.html" class="underline">Sube un archivo</a>.</p>';
    return;
  }

  const timeout = setTimeout(() => {
    loadingText.textContent = "La IA está tardando más de lo normal...";
    loadingText.classList.add('text-red-500');
    if(spinner) spinner.classList.add('hidden');
    if(btnError) btnError.classList.remove('hidden');
  }, 15000);

  try {
    const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
    let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
    const kitGuardado = historial.find(k => k.nombre === nombreKit);

    if (kitGuardado && kitGuardado.material && kitGuardado.material.flashcards && kitGuardado.material.flashcards.length > 0) {
      material = kitGuardado.material;
    } else {
      const data = await generarMaterial(texto);
      if (!data || !data.flashcards || data.flashcards.length === 0) throw new Error("La IA no devolvió tarjetas válidas.");
      material = data;
      
      historial = historial.filter(k => k.nombre !== nombreKit);
      historial.unshift({ id: Date.now(), nombre: nombreKit, material: material });
      localStorage.setItem('historialKits', JSON.stringify(historial));
    }

    clearTimeout(timeout);

    if (!material.quiz) material.quiz = []; 
    mazo = [...material.flashcards].sort(() => Math.random() - 0.5);
    stats.aprendiendo = mazo.length;

    loadingDiv.classList.add('hidden');
    cambiarTab('mazo');
  } catch (e) {
    clearTimeout(timeout);
    loadingText.textContent = "¡Ups! Hubo un error de conexión con la IA.";
    loadingText.classList.add('text-red-500');
    if(spinner) spinner.classList.add('hidden');
    if(btnError) btnError.classList.remove('hidden');
  }
})();

function actualizarStatsUI() {
  document.getElementById('stat-aprendiendo').textContent = stats.aprendiendo;
  document.getElementById('stat-revisando').textContent = stats.revisando;
  document.getElementById('stat-dominado').textContent = stats.dominado;
}

function actualizarUI() {
  if (!material || !mazo || mazo.length === 0) return;
  if (indiceActual >= mazo.length) {
    document.getElementById('texto-pregunta').textContent = "¡Mazo terminado!";
    document.getElementById('texto-respuesta').textContent = "Has repasado todas las tarjetas.";
    document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('btnMostrar').classList.add('hidden');
    return;
  }
  const tarjeta = mazo[indiceActual];
  document.getElementById('texto-pregunta').textContent = tarjeta.pregunta;
  document.getElementById('texto-respuesta').textContent = tarjeta.respuesta;
  mostrandoRespuesta = false;
  document.getElementById('tarjeta').classList.remove('flipped');
  document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
  document.getElementById('btnMostrar').classList.remove('hidden');
  actualizarStatsUI();
}

function voltearTarjeta() {
  if (mostrandoRespuesta || indiceActual >= mazo.length) return;
  mostrandoRespuesta = true;
  document.getElementById('tarjeta').classList.add('flipped');
  document.getElementById('btnMostrar').classList.add('hidden');
  setTimeout(() => {
    document.getElementById('botones-calificacion').classList.remove('opacity-0', 'pointer-events-none');
  }, 300);
}

function calificar(nivel) {
  stats.aprendiendo--;
  if (nivel === 0) { stats.aprendiendo++; mazo.push(mazo[indiceActual]); }
  else if (nivel === 1) { stats.revisando++; }
  else if (nivel === 2) { stats.dominado++; }
  indiceActual++;
  setTimeout(() => { actualizarUI(); }, 300);
}
async function cambiarTab(tab) {
  if (!material) return;
  
  detenerLectura(); 

  const clasesNav = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-[#5A5550] hover:bg-[#F7F5F2]";
  const activoNav = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#E8E6ED] text-[#1A1A1A] transition";
  
  if(document.getElementById('nav-mazo')) {
    document.getElementById('nav-mazo').className = clasesNav;
    document.getElementById('nav-lista').className = clasesNav;
    document.getElementById('nav-guia').className = clasesNav;
    document.getElementById('nav-quiz').className = clasesNav;
    document.getElementById('nav-juegos').className = clasesNav;
    
    if (tab === 'mazo') document.getElementById('nav-mazo').className = activoNav;
    if (tab === 'lista') document.getElementById('nav-lista').className = activoNav;
    if (tab === 'guia') document.getElementById('nav-guia').className = activoNav;
    if (tab === 'quiz') document.getElementById('nav-quiz').className = activoNav;
    if (tab === 'juegos') document.getElementById('nav-juegos').className = activoNav;
  }

  const clasesMob = "flex flex-col items-center p-2 text-[#8A8580]";
  const activoMob = "flex flex-col items-center p-2 text-[#1A1A1A]";
  if(document.getElementById('mob-mazo')) {
    document.getElementById('mob-mazo').className = clasesMob;
    document.getElementById('mob-lista').className = clasesMob;
    document.getElementById('mob-guia').className = clasesMob;
    document.getElementById('mob-quiz').className = clasesMob;
    document.getElementById('mob-juegos').className = clasesMob;
    if (tab === 'mazo') document.getElementById('mob-mazo').className = activoMob;
    if (tab === 'lista') document.getElementById('mob-lista').className = activoMob;
    if (tab === 'guia') document.getElementById('mob-guia').className = activoMob;
    if (tab === 'quiz') document.getElementById('mob-quiz').className = activoMob;
    if (tab === 'juegos') document.getElementById('mob-juegos').className = activoMob;
  }

  const headerTitle = document.getElementById('headerTitle');
  if(headerTitle) {
    if(tab === 'mazo') headerTitle.textContent = "Mazo";
    if(tab === 'lista') headerTitle.textContent = "Lista";
    if(tab === 'guia') headerTitle.textContent = "Guía de Estudio";
    if(tab === 'quiz') headerTitle.textContent = "Prueba";
    if(tab === 'juegos') headerTitle.textContent = "Juegos";
  }

  document.getElementById('mazoContainer').classList.add('hidden');
  document.getElementById('mazoContainer').classList.remove('flex');
  document.getElementById('listaContainer').classList.add('hidden');
  document.getElementById('guiaContainer').classList.add('hidden');
  document.getElementById('quizContainer').classList.add('hidden');
  document.getElementById('juegosContainer').classList.add('hidden');

  if (tab === 'mazo') {
    document.getElementById('mazoContainer').classList.remove('hidden');
    document.getElementById('mazoContainer').classList.add('flex');
    actualizarUI();
  } else if (tab === 'lista') {
    document.getElementById('listaContainer').classList.remove('hidden');
    const cont = document.getElementById('listaTarjetas');
    if (material && material.flashcards) {
      cont.innerHTML = material.flashcards.map((f, i) => `
        <div class="bg-white rounded-xl border border-[#E5E1DA] overflow-hidden transition-all duration-300 mb-3">
          <button onclick="toggleRespuesta(${i})" class="w-full text-left p-4 flex justify-between items-center hover:bg-[#F7F5F2] transition">
            <span class="font-bold text-[#1A1A1A] text-sm md:text-base pr-4">${f.pregunta}</span>
            <span id="icono-${i}" class="text-[#8A8580] text-xl font-bold transform transition-transform duration-300">+</span>
          </button>
          <div id="respuesta-${i}" class="hidden px-4 pb-4 pt-1 border-t border-[#F7F5F2]">
            <p class="text-sm text-[#5A5550] mb-3">${f.respuesta}</p>
            <div class="flex gap-2">
              <button onclick="editarTarjeta(${i})" class="text-xs font-semibold text-blue-500 hover:text-blue-700">✏️ Editar</button>
              <button onclick="leerTarjetaLista(${i})" class="text-xs font-semibold text-[#1A1A1A] bg-[#E8E6ED] px-2 py-1 rounded">🔊 Escuchar</button>
              <button onclick="detenerLectura()" class="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">⏹️ Detener</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  } else if (tab === 'guia') {
    document.getElementById('guiaContainer').classList.remove('hidden');
    const guiaHTML = document.getElementById('guiaTexto');
    
    if (!material.guia || material.guia.includes("Haz clic") || material.guia.length < 50) {
      guiaHTML.innerHTML = '<div class="text-center py-12"><div class="inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[#8A8580]">Generando tu guía de estudio...</p></div>';
      try {
        const textoOriginal = localStorage.getItem('material');
        const nuevaGuia = await generarGuia(textoOriginal);
        
        material.guia = nuevaGuia;
        localStorage.setItem('materialGenerado', JSON.stringify(material));
        
        const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
        let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
        const kitIndex = historial.findIndex(k => k.nombre === nombreKit);
        
        if (kitIndex !== -1) {
          historial[kitIndex].material = material;
          localStorage.setItem('historialKits', JSON.stringify(historial));
        } else {
          historial.unshift({ id: Date.now(), nombre: nombreKit, material: material });
          localStorage.setItem('historialKits', JSON.stringify(historial));
        }

      } catch (e) {
        console.error("Error generando guía:", e);
        guiaHTML.innerHTML = '<p class="text-red-500">Hubo un error generando la guía.</p>';
        return;
      }
    }
    
    guiaHTML.innerHTML = material.guia
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/\n/g, '<br>');
  } else if (tab === 'quiz') {
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizSetup').classList.remove('hidden');
    document.getElementById('preguntasQuiz').innerHTML = '';
  } else if (tab === 'juegos') {
    document.getElementById('juegosContainer').classList.remove('hidden');
    document.getElementById('menuJuegos').classList.remove('hidden');
    document.getElementById('juegoActivo').classList.add('hidden');
    document.getElementById('juegoApilador').classList.add('hidden');
    document.getElementById('juegoApiladorActivo').classList.add('hidden');
    document.querySelector('#juegosContainer h2').classList.remove('hidden');
  }
}

function toggleRespuesta(index) {
  const respuesta = document.getElementById(`respuesta-${index}`);
  const icono = document.getElementById(`icono-${index}`);
  if (respuesta.classList.contains('hidden')) {
    respuesta.classList.remove('hidden');
    icono.textContent = '−';
    icono.classList.add('rotate-180');
  } else {
    respuesta.classList.add('hidden');
    icono.textContent = '+';
    icono.classList.remove('rotate-180');
  }
}
async function iniciarQuiz() {
  if (!material) return;
  const cantidad = parseInt(document.getElementById('selectCantidad').value);
  const contenedor = document.getElementById('preguntasQuiz');
  const setup = document.getElementById('quizSetup');

  setup.classList.add('hidden'); 
  contenedor.innerHTML = '<div class="text-center py-8"><div class="inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-center text-[#8A8580]">Preparando tu examen...</p></div>';

  if (!material.quiz) material.quiz = [];

  if (material.quiz.length < cantidad) {
    try {
      const textoOriginal = localStorage.getItem('material');
      const cantidadFaltante = cantidad - material.quiz.length;
      const nuevasPreguntas = await generarPreguntasExtra(textoOriginal, cantidadFaltante);
      if (nuevasPreguntas && nuevasPreguntas.length > 0) {
        material.quiz = [...material.quiz, ...nuevasPreguntas];
        localStorage.setItem('materialGenerado', JSON.stringify(material)); 
      }
    } catch (error) {
      console.error("No se pudieron generar preguntas extra", error);
    }
  }

  if (material.quiz.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-red-500">No se pudieron generar preguntas. Intenta con un texto más largo.</p>';
    return;
  }

  const preguntasFinales = material.quiz.slice(0, cantidad);
  contenedor.innerHTML = '';

  preguntasFinales.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] mb-4';
    div.innerHTML = `
      <p class="font-bold mb-4 text-lg">${i + 1}. ${q.pregunta}</p>
      <div class="space-y-2" id="opciones-${i}">
        ${q.opciones.map((op, j) => `
          <button onclick="responderQuiz(${i}, ${j})"
            class="w-full text-left px-5 py-3 rounded-xl border border-[#E5E1DA] text-sm hover:bg-[#F7F5F2] transition">
            ${op}
          </button>
        `).join('')}
      </div>
      <p id="exp-${i}" class="hidden mt-4 text-sm text-[#5A5550] bg-[#F7F5F2] p-4 rounded-xl"></p>
    `;
    contenedor.appendChild(div);
  });

  material.quiz = preguntasFinales; 
}

function responderQuiz(qIdx, opIdx) {
  const q = material.quiz[qIdx];
  const botones = document.querySelectorAll(`#opciones-${qIdx} button`);
  const exp = document.getElementById(`exp-${qIdx}`);

  botones.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correcta) b.className = 'w-full text-left px-5 py-3 rounded-xl border-2 border-green-500 bg-green-50 text-sm font-medium';
    else if (i === opIdx) b.className = 'w-full text-left px-5 py-3 rounded-xl border-2 border-red-400 bg-red-50 text-sm';
    else b.className = 'w-full text-left px-5 py-3 rounded-xl border border-[#E5E1DA] text-sm opacity-50';
  });

  exp.textContent = '💡 ' + q.explicacion;
  exp.classList.remove('hidden');
}

function editarTarjeta(index) {
  if (!material || !material.flashcards) return;
  const tarjeta = material.flashcards[index];
  const nuevaPregunta = prompt("Edita la pregunta:", tarjeta.pregunta);
  if (nuevaPregunta === null) return;
  
  const nuevaRespuesta = prompt("Edita la respuesta:", tarjeta.respuesta);
  if (nuevaRespuesta === null) return;

  material.flashcards[index].pregunta = nuevaPregunta;
  material.flashcards[index].respuesta = nuevaRespuesta;
  
  localStorage.setItem('materialGenerado', JSON.stringify(material));
  
  const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
  let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
  const kitIndex = historial.findIndex(k => k.nombre === nombreKit);
  if (kitIndex !== -1) {
    historial[kitIndex].material = material;
    localStorage.setItem('historialKits', JSON.stringify(historial));
  }

  cambiarTab('lista');
}

async function pedirMasMaterial() {
  const btnMas = document.getElementById('btnMas');
  const textoOriginal = localStorage.getItem('material');
  
  if (!textoOriginal || !material) return;

  if (generacionesExtra >= 2) {
    alert('Límite alcanzado: solo puedes generar material extra 2 veces por kit.');
    if(btnMas) btnMas.style.display = 'none';
    return;
  }

  if(btnMas) {
    btnMas.innerHTML = '<div class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generando...';
    btnMas.disabled = true;
  }

  try {
    const extra = await generarMasMaterial(textoOriginal, material.flashcards, material.quiz);
    
    if (extra.flashcards) {
      material.flashcards = [...material.flashcards, ...extra.flashcards];
      mazo = [...mazo, ...extra.flashcards].sort(() => Math.random() - 0.5);
      stats.aprendiendo += extra.flashcards.length;
    }
    
    if (extra.quiz) {
      material.quiz = [...(material.quiz || []), ...extra.quiz];
    }

    localStorage.setItem('materialGenerado', JSON.stringify(material));
    const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
    let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
    const kitIndex = historial.findIndex(k => k.nombre === nombreKit);
    if (kitIndex !== -1) {
      historial[kitIndex].material = material;
      localStorage.setItem('historialKits', JSON.stringify(historial));
    }

    generacionesExtra++;
    
    if (generacionesExtra >= 2) {
      if(btnMas) {
        btnMas.innerHTML = '✨ Límite de generación alcanzado';
        btnMas.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        btnMas.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
      }
    } else {
      if(btnMas) {
        btnMas.innerHTML = '✨ Generar 8 tarjetas más con IA';
        btnMas.disabled = false;
      }
    }

    indiceActual = 0; 
    actualizarUI();
    
    if (document.getElementById('listaContainer').classList.contains('hidden')) {
      alert('¡Se han añadido 8 tarjetas y 4 preguntas nuevas a tu kit!');
    } else {
      cambiarTab('lista');
    }

  } catch (error) {
    console.error(error);
    alert('Hubo un error al generar más material. Por favor, recarga la página.');
    if(btnMas) {
      btnMas.innerHTML = '✨ Generar 8 tarjetas más con IA';
      btnMas.disabled = false;
    }
  }
}

// --- FUNCIÓN DE IMPRESIÓN Y DESCARGA ---
function imprimirGuia(tipo) {
  if (!material || !material.guia) {
    alert("Primero debes generar la guía de estudio.");
    return;
  }
  
  const ventana = window.open('', '_blank');
  
  const guiaHTML = material.guia
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
    .replace(/\n/g, '<br>');

  const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Guía';
  const tituloDocumento = tipo === 'Word' ? 'Guia_AprendeYa_Word' : 'Guia_AprendeYa_PDF';

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${tituloDocumento}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1a1a1a; font-size: 28px; border-bottom: 2px solid #ccc; padding-bottom: 10px; }
        h2 { color: #1a1a1a; font-size: 22px; margin-top: 30px; }
        li { margin-bottom: 10px; }
        strong { color: #000; }
        .header { text-align: center; margin-bottom: 40px; color: #888; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h3>Guía de Estudio generada por AprendeYa</h3>
        <p>Kit: ${nombreKit}</p>
      </div>
      ${guiaHTML}
    </body>
    </html>
  `);

  ventana.document.close();
  ventana.focus();
  
  setTimeout(() => {
    ventana.print();
  }, 500);
}

// --- LECTURA POR VOZ (TEXT TO SPEECH) ---

function leerTextoActual() {
  if (!mazo || indiceActual >= mazo.length) return;
  detenerLectura(); 
  
  const tarjeta = mazo[indiceActual];
  const textoALeer = mostrandoRespuesta ? tarjeta.respuesta : tarjeta.pregunta;
  
  const utterance = new SpeechSynthesisUtterance(textoALeer);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  
  const btnDetener = document.getElementById('btnDetenerMazo');
  if (btnDetener) btnDetener.classList.remove('hidden');
  
  utterance.onend = () => {
    if (btnDetener) btnDetener.classList.add('hidden');
  };
  
  sintetizador.speak(utterance);
}

function leerTarjetaLista(index) {
  if (!material || !material.flashcards || !material.flashcards[index]) return;
  detenerLectura();
  
  const tarjeta = material.flashcards[index];
  const textoALeer = `Pregunta: ${tarjeta.pregunta}. Respuesta: ${tarjeta.respuesta}`;
  
  const utterance = new SpeechSynthesisUtterance(textoALeer);
  utterance.lang = 'es-ES';
  utterance.rate = 0.9;
  
  sintetizador.speak(utterance);
}

function leerGuiaCompleta() {
  if (!material || !material.guia) return;
  detenerLectura();
  
  const textoLimpio = material.guia
    .replace(/[#*]/g, '')
    .replace(/\n/g, ' ');
  
  const frases = textoLimpio.match(/[^.!?]+[.!?]+/g) || [textoLimpio];
  
  const btnDetener = document.getElementById('btnDetenerAudio');
  if (btnDetener) btnDetener.classList.remove('hidden');

  let i = 0;
  function leerSiguienteFrase() {
    if (i < frases.length) {
      const utterance = new SpeechSynthesisUtterance(frases[i]);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.onend = leerSiguienteFrase;
      sintetizador.speak(utterance);
      i++;
    } else {
      if (btnDetener) btnDetener.classList.add('hidden');
    }
  }

  leerSiguienteFrase();
}

function detenerLectura() {
  if (sintetizador.speaking) {
    sintetizador.cancel();
  }
  const btnDetenerMazo = document.getElementById('btnDetenerMazo');
  if (btnDetenerMazo) btnDetenerMazo.classList.add('hidden');
  
  const btnDetenerAudio = document.getElementById('btnDetenerAudio');
  if (btnDetenerAudio) btnDetenerAudio.classList.add('hidden');
}

// --- LÓGICA DEL JUEGO DE COINCIDENCIAS ---
function iniciarJuegoCoincidencias() {
  if (!material || !material.flashcards || material.flashcards.length < 3) {
    alert("Necesitas al menos 3 tarjetas para jugar. Genera más material.");
    return;
  }

  document.getElementById('menuJuegos').classList.add('hidden');
  document.querySelector('#juegosContainer h2').classList.add('hidden');
  document.getElementById('juegoActivo').classList.remove('hidden');

  const cantidadPares = Math.min(6, Math.floor(material.flashcards.length / 2) * 2);
  const cantidadFinal = Math.max(3, Math.min(cantidadPares, material.flashcards.length));
  
  let preguntasSeleccionadas = material.flashcards.slice(0, cantidadFinal);
  
  cartasJuego = [];
  preguntasSeleccionadas.forEach((f, index) => {
    cartasJuego.push({ id: index, texto: f.pregunta, tipo: 'pregunta' });
    cartasJuego.push({ id: index, texto: f.respuesta, tipo: 'respuesta' });
  });

  cartasJuego.sort(() => Math.random() - 0.5);

  primeraCarta = null;
  segundaCarta = null;
  bloqueoTablero = false;
  puntosJuego = 0;
  intentosJuego = 0;
  document.getElementById('puntosJuego').textContent = 0;
  document.getElementById('intentosJuego').textContent = 0;

  const tablero = document.getElementById('tableroJuego');
  tablero.innerHTML = cartasJuego.map((carta, index) => `
    <div onclick="voltearCartaJuego(${index})" id="carta-${index}" 
         class="h-32 md:h-40 bg-white border-2 border-[#E5E1DA] rounded-xl flex items-center justify-center p-2 text-center text-xs md:text-sm cursor-pointer transition transform hover:-translate-y-1 shadow-sm overflow-hidden select-none">
      <span class="font-bold text-[#1A1A1A]">${carta.texto}</span>
    </div>
  `).join('');
}

function voltearCartaJuego(index) {
  if (bloqueoTablero) return;
  
  const cartaDiv = document.getElementById(`carta-${index}`);
  
  if (cartaDiv.classList.contains('volteada')) return;
  if (primeraCarta === index) return;

  const carta = cartasJuego[index];
  
  cartaDiv.classList.add('volteada', 'bg-blue-100', 'border-blue-500');

  if (!primeraCarta) {
    primeraCarta = index;
  } else {
    segundaCarta = index;
    intentosJuego++;
    document.getElementById('intentosJuego').textContent = intentosJuego;

    if (cartasJuego[primeraCarta].id === cartasJuego[segundaCarta].id) {
      puntosJuego += 10;
      document.getElementById('puntosJuego').textContent = puntosJuego;
      
      document.getElementById(`carta-${primeraCarta}`).classList.remove('bg-blue-100', 'border-blue-500');
      document.getElementById(`carta-${primeraCarta}`).classList.add('bg-green-100', 'border-green-500');
      
      document.getElementById(`carta-${segundaCarta}`).classList.remove('bg-blue-100', 'border-blue-500');
      document.getElementById(`carta-${segundaCarta}`).classList.add('bg-green-100', 'border-green-500');
      
      resetearSeleccion();

      if (puntosJuego === (cartasJuego.length / 2) * 10) {
        setTimeout(() => alert('¡Felicidades! Has completado el juego. 🎉'), 500);
      }

    } else {
      bloqueoTablero = true;
      setTimeout(() => {
        document.getElementById(`carta-${primeraCarta}`).classList.remove('volteada', 'bg-blue-100', 'border-blue-500');
        document.getElementById(`carta-${segundaCarta}`).classList.remove('volteada', 'bg-blue-100', 'border-blue-500');
        
        bloqueoTablero = false;
        resetearSeleccion();
      }, 1000);
    }
  }
}

function resetearSeleccion() {
  primeraCarta = null;
  segundaCarta = null;
}

// --- LÓGICA DEL JUEGO APILADOR ---
function iniciarJuegoApilador() {
  if (!material || !material.flashcards || material.flashcards.length === 0) {
    alert("Necesitas tarjetas para jugar.");
    return;
  }

  document.getElementById('menuJuegos').classList.add('hidden');
  document.querySelector('#juegosContainer h2').classList.add('hidden');
  document.getElementById('juegoApilador').classList.remove('hidden');
}

function comenzarApilador() {
  document.getElementById('juegoApilador').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('flex');

  preguntasApilador = [...material.flashcards].sort(() => Math.random() - 0.5);
  indicePreguntaApilador = 0;
  torreAltura = 0;
  torreFallos = 0;

  document.getElementById('alturaTorre').textContent = 0;
  document.getElementById('fallosTorre').textContent = 0;
  document.getElementById('torreContainer').innerHTML = '';

  cargarPreguntaApilador();
}

function cargarPreguntaApilador() {
  if (indicePreguntaApilador >= preguntasApilador.length) {
    alert('¡Increíble! Has respondido todas las tarjetas. 🏆');
    salirJuego();
    return;
  }

  const pregunta = preguntasApilador[indicePreguntaApilador];
  document.getElementById('textoPreguntaApilador').textContent = pregunta.pregunta;

  let opciones = [pregunta.respuesta];
  while (opciones.length < 4 && material.flashcards.length > 1) {
    const random = material.flashcards[Math.floor(Math.random() * material.flashcards.length)].respuesta;
    if (!opciones.includes(random)) opciones.push(random);
  }

  opciones.sort(() => Math.random() - 0.5);

  const contOpciones = document.getElementById('opcionesApilador');
  contOpciones.innerHTML = opciones.map(op => `
    <button onclick="responderApilador('${op.replace(/'/g, "\\'")}', '${pregunta.respuesta.replace(/'/g, "\\'")}')" 
            class="w-full text-left px-4 py-3 rounded-xl border border-[#E5E1DA] bg-white hover:bg-[#F7F5F2] text-sm font-medium transition">
      ${op}
    </button>
  `).join('');
}

function responderApilador(opcionElegida, respuestaCorrecta) {
  const contOpciones = document.getElementById('opcionesApilador');
  contOpciones.innerHTML = ''; 

  if (opcionElegida === respuestaCorrecta) {
    torreAltura++;
    document.getElementById('alturaTorre').textContent = torreAltura;
    
    const bloque = document.createElement('div');
    bloque.className = 'function responderApilador(opcionElegida, respuestaCorrecta) {
  const contOpciones = document.getElementById('opcionesApilador');
  contOpciones.innerHTML = ''; 

  if (opcionElegida === respuestaCorrecta) {
    torreAltura++;
    document.getElementById('alturaTorre').textContent = torreAltura;
    
    const bloque = document.createElement('div');
    bloque.className = 'bloque-torre bloque-pregunta';
    if (torreAltura % 2 === 0) bloque.style.width = '90%';
    document.getElementById('torreContainer').appendChild(bloque);

    document.getElementById('textoPreguntaApilador').textContent = "¡Correcto! 🎉";
    setTimeout(() => {
      indicePreguntaApilador++;
      cargarPreguntaApilador();
    }, 1000);

  } else {
    torreFallos++;
    document.getElementById('fallosTorre').textContent = torreFallos;
    
    document.getElementById('textoPreguntaApilador').textContent = "¡Incorrecto! 😞";
    setTimeout(() => {
      indicePreguntaApilador++;
      cargarPreguntaApilador();
    }, 1500);
  }
}

function salirJuego() {
  document.getElementById('juegoActivo').classList.add('hidden');
  document.getElementById('juegoApilador').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('flex');
  document.getElementById('menuJuegos').classList.remove('hidden');
  document.querySelector('#juegosContainer h2').classList.remove('hidden');
}
