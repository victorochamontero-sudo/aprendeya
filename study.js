// ============================================
// APPRENDEYA - PANTALLA DE ESTUDIO (study.js)
// ============================================

let materialActual = null;
let tarjetaActual = 0;
let estaVolteada = false;
let synth = window.speechSynthesis;
let cronometroInterval = null;
let tiempoRestante = 0;

// Variables para los juegos
let puntosJuego = 0;
let intentosJuego = 0;
let seleccionadosCoincidencias = [];
let cartasCoincidencias = [];
let apiladorAltura = 0;
let apiladorFallos = 0;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const btnError = document.getElementById('btnError');
  
  const materialGuardado = localStorage.getItem('materialGenerado');
  const nombreKit = localStorage.getItem('nombreMaterial');
  
  if (materialGuardado && materialGuardado !== 'null') {
    materialActual = JSON.parse(materialGuardado);
    iniciarInterfaz();
    return;
  }

  const texto = localStorage.getItem('material');
  if (!texto || texto === 'cargado desde historial') {
    loadingText.textContent = "No hay material. Vuelve a la página de inicio.";
    document.getElementById('loadingSpinner').classList.add('hidden');
    btnError.classList.remove('hidden');
    btnError.textContent = "Volver al inicio";
    btnError.onclick = () => window.location.href = 'index.html';
    return;
  }

  try {
    loadingText.textContent = "🧠 La IA está creando tu material de estudio...";
    materialActual = await generarMaterial(texto);
    guardarEnHistorial(nombreKit || 'Mi Kit');
    iniciarInterfaz();
  } catch (error) {
    console.error("Error crítico:", error);
    loadingText.textContent = "Hubo un error al generar el material.";
    document.getElementById('loadingSpinner').classList.add('hidden');
    btnError.classList.remove('hidden');
    btnError.onclick = () => window.location.reload();
  }
});

function iniciarInterfaz() {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('mazoContainer').classList.remove('hidden');
  
  // Asegurarnos de que el material tiene la estructura correcta
  if (!materialActual.flashcards) materialActual.flashcards = [];
  if (!materialActual.quiz) materialActual.quiz = [];
  if (!materialActual.guia) materialActual.guia = "No se generó una guía.";

  mostrarTarjeta();
  renderizarLista();
  renderizarGuia();
}

// --- MAZO ---
function mostrarTarjeta() {
  const mazo = materialActual.flashcards;
  if (mazo.length === 0) return;
  
  if (tarjetaActual >= mazo.length) tarjetaActual = 0; 
  
  const tarjeta = mazo[tarjetaActual];
  document.getElementById('texto-pregunta').textContent = tarjeta.pregunta;
  document.getElementById('texto-respuesta').textContent = tarjeta.respuesta;
  
  estaVolteada = false;
  document.getElementById('tarjeta').classList.remove('flipped');
  document.getElementById('btnMostrar').textContent = 'Mostrar Respuesta';
  document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
  
  document.getElementById('stat-aprendiendo').textContent = mazo.length;
  document.getElementById('stat-revisando').textContent = '0';
  document.getElementById('stat-dominado').textContent = '0';
}

function voltearTarjeta() {
  estaVolteada = !estaVolteada;
  const el = document.getElementById('tarjeta');
  
  if (estaVolteada) {
    el.classList.add('flipped');
    document.getElementById('btnMostrar').textContent = 'Ocultar Respuesta';
    document.getElementById('botones-calificacion').classList.remove('opacity-0', 'pointer-events-none');
  } else {
    el.classList.remove('flipped');
    document.getElementById('btnMostrar').textContent = 'Mostrar Respuesta';
    document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
  }
}

function calificar(nivel) {
  tarjetaActual++;
  mostrarTarjeta();
}

// --- LISTA Y GUÍA ---
function renderizarLista() {
  const contenedor = document.getElementById('listaTarjetas');
  if (!contenedor) return;
  
  if (materialActual.flashcards.length === 0) {
    contenedor.innerHTML = '<p class="dark:text-white">No hay tarjetas generadas.</p>';
    return;
  }

  contenedor.innerHTML = materialActual.flashcards.map(t => `
    <div class="p-4 bg-[#F7F5F2] dark:bg-[#2A2A2A] rounded-xl border border-[#E5E1DA] dark:border-[#444] mb-2">
      <p class="font-bold text-[#1A1A1A] dark:text-white mb-1">${t.pregunta}</p>
      <p class="text-sm text-[#5A5550] dark:text-gray-300">${t.respuesta}</p>
    </div>
  `).join('');
}

function renderizarGuia() {
  const contenedor = document.getElementById('guiaTexto');
  if (!contenedor) return;
  
  let html = materialActual.guia;
  
  // Formatear texto plano a HTML con estilo
  html = html.replace(/\n/g, '<br>');
  // Poner en negrita lo que esté entre ** **
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Formatear viñetas
  html = html.replace(/- (.*?)(<br>|$)/g, '<li class="ml-4 list-disc">$1</li>');
  
  contenedor.innerHTML = html;
}

function guardarEnHistorial(nombre) {
  let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
  const existe = historial.find(k => k.nombre === nombre);
  if (!existe) {
    historial.push({ id: Date.now(), nombre: nombre, material: materialActual });
    localStorage.setItem('historialKits', JSON.stringify(historial));
  }
}

// --- AUDIO ---
function leerTextoActual() {
  const tarjeta = materialActual.flashcards[tarjetaActual];
  const texto = estaVolteada ? tarjeta.respuesta : tarjeta.pregunta;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-ES';
  synth.speak(utterance);
}

function detenerLectura() { synth.cancel(); }

function leerGuiaCompleta() {
  synth.cancel();
  // Quitar asteriscos para que no los lea en voz alta
  let textoLimpio = materialActual.guia.replace(/\*\*/g, '').replace(/#/g, '').replace(/-/g, '');
  const utterance = new SpeechSynthesisUtterance(textoLimpio);
  utterance.lang = 'es-ES';
  synth.speak(utterance);
}

// --- PRUEBA (QUIZ) ---
function iniciarQuiz() {
  const cantidad = parseInt(document.getElementById('selectCantidad').value);
  const contenedor = document.getElementById('preguntasQuiz');
  document.getElementById('quizSetup').classList.add('hidden');
  
  let preguntas = materialActual.quiz || [];
  if (preguntas.length > cantidad) preguntas = preguntas.slice(0, cantidad);

  if (preguntas.length === 0) {
    contenedor.innerHTML = '<p class="text-center dark:text-white">No hay preguntas disponibles.</p>';
    return;
  }

  contenedor.innerHTML = preguntas.map((p, index) => `
    <div class="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E5E1DA] dark:border-[#333] shadow-sm mb-4">
      <p class="font-bold mb-4 dark:text-white">${index + 1}. ${p.pregunta}</p>
      <div class="space-y-2" id="opciones-${index}">
        ${p.opciones.map((op, i) => `
          <button onclick="responderQuiz(${index}, ${i}, ${p.correcta})" class="w-full text-left p-3 rounded-xl border border-[#E5E1DA] dark:border-[#444] hover:bg-[#F7F5F2] dark:hover:bg-[#2A2A2A] transition dark:text-gray-200">
            ${op}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function responderQuiz(preguntaIdx, seleccionada, correcta) {
  const contenedorOpciones = document.getElementById(`opciones-${preguntaIdx}`);
  const botones = contenedorOpciones.querySelectorAll('button');
  
  if (botones[0].disabled) return;
  botones.forEach(b => b.disabled = true);
  
  if (seleccionada === correcta) {
    botones[seleccionada].classList.add('bg-green-100', 'border-green-500', 'text-green-800');
    let puntos = parseInt(localStorage.getItem('puntosAprendeYa') || '0');
    localStorage.setItem('puntosAprendeYa', puntos + 1);
  } else {
    botones[seleccionada].classList.add('bg-red-100', 'border-red-500', 'text-red-800');
    botones[correcta].classList.add('bg-green-100', 'border-green-500', 'text-green-800');
  }
}

// --- JUEGOS ---
function iniciarJuegoCoincidencias() {
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoActivo').classList.remove('hidden');
  document.getElementById('juegoApilador').classList.add('hidden');
  
  puntosJuego = 0;
  intentosJuego = 0;
  seleccionadosCoincidencias = [];
  actualizarMarcadorJuego();
  
  const mazo = materialActual.flashcards.slice(0, 4);
  if (mazo.length < 4) {
    document.getElementById('tableroJuego').innerHTML = '<p class="dark:text-white col-span-full text-center">Necesitas al menos 4 tarjetas para jugar.</p>';
    return;
  }

  cartasCoincidencias = [];
  mazo.forEach((t, index) => {
    cartasCoincidencias.push({ id: index, texto: t.pregunta });
    cartasCoincidencias.push({ id: index, texto: t.respuesta });
  });
  cartasCoincidencias = cartasCoincidencias.sort(() => Math.random() - 0.5);
  
  const tablero = document.getElementById('tableroJuego');
  tablero.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4';
  tablero.innerHTML = cartasCoincidencias.map((c, i) => `
    <button onclick="seleccionarCoincidencia(${i})" id="carta-${i}" 
      class="h-24 sm:h-32 bg-blue-500 text-white p-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center text-center transition transform hover:scale-105 shadow-md overflow-hidden break-words">
      ${c.texto}
    </button>
  `).join('');
}

function seleccionarCoincidencia(index) {
  if (seleccionadosCoincidencias.includes(index) || document.getElementById(`carta-${index}`).disabled) return;
  
  const btn = document.getElementById(`carta-${index}`);
  btn.classList.replace('bg-blue-500', 'bg-blue-700');
  seleccionadosCoincidencias.push(index);
  
  if (seleccionadosCoincidencias.length === 2) {
    intentosJuego++;
    actualizarMarcadorJuego();
    
    const [i1, i2] = seleccionadosCoincidencias;
    const c1 = cartasCoincidencias[i1];
    const c2 = cartasCoincidencias[i2];
    
    if (c1.id === c2.id && c1.texto !== c2.texto) {
      puntosJuego += 10;
      actualizarMarcadorJuego();
      document.getElementById(`carta-${i1}`).classList.replace('bg-blue-700', 'bg-green-500');
      document.getElementById(`carta-${i2}`).classList.replace('bg-blue-700', 'bg-green-500');
      document.getElementById(`carta-${i1}`).disabled = true;
      document.getElementById(`carta-${i2}`).disabled = true;
      
      if (puntosJuego === 40) setTimeout(() => alert('¡Felicidades! Has completado el juego.'), 300);
    } else {
      setTimeout(() => {
        document.getElementById(`carta-${i1}`).classList.replace('bg-blue-700', 'bg-blue-500');
        document.getElementById(`carta-${i2}`).classList.replace('bg-blue-700', 'bg-blue-500');
      }, 800);
    }
    seleccionadosCoincidencias = [];
  }
}

function iniciarJuegoApilador() {
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoApilador').classList.remove('hidden');
  document.getElementById('instruccionesApilador').classList.remove('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('hidden');
}

function comenzarApilador() {
  document.getElementById('instruccionesApilador').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('hidden');
  apiladorAltura = 0;
  apiladorFallos = 0;
  actualizarTorre();
  siguientePreguntaApilador();
}

function siguientePreguntaApilador() {
  const tarjetas = materialActual.flashcards;
  if (tarjetas.length === 0) return;

  const tarjeta = tarjetas[Math.floor(Math.random() * tarjetas.length)];
  document.getElementById('textoPreguntaApilador').textContent = tarjeta.pregunta;
  
  let opciones = [tarjeta.respuesta];
  tarjetas.forEach(t => {
    if (t.respuesta !== tarjeta.respuesta && opciones.length < 4) opciones.push(t.respuesta);
  });
  while(opciones.length < 4) opciones.push('Otra respuesta');
  opciones = opciones.sort(() => Math.random() - 0.5);
  
  const contenedor = document.getElementById('opcionesApilador');
  contenedor.innerHTML = opciones.map(op => `
    <button onclick="responderApilador('${op.replace(/'/g, "\\'")}', '${tarjeta.respuesta.replace(/'/g, "\\'")}')" 
      class="w-full text-left bg-white dark:bg-[#2A2A2A] border border-[#E5E1DA] dark:border-[#444] text-[#1A1A1A] dark:text-white p-3 rounded-xl hover:bg-[#F7F5F2] dark:hover:bg-[#333] transition text-sm font-medium mb-2">
      ${op}
    </button>
  `).join('');
}

function responderApilador(seleccion, correcta) {
  if (seleccion === correcta) apiladorAltura++;
  else apiladorFallos++;
  actualizarTorre();
  siguientePreguntaApilador();
}

function actualizarTorre() {
  document.getElementById('alturaTorre').textContent = apiladorAltura;
  document.getElementById('fallosTorre').textContent = apiladorFallos;
  
  const torre = document.getElementById('torreContainer');
  torre.innerHTML = '';
  for (let i = 0; i < apiladorAltura; i++) {
    const bloque = document.createElement('div');
    bloque.className = 'bloque-torre';
    if (i % 3 === 0) bloque.style.backgroundColor = '#3B82F6';
    else if (i % 3 === 1) bloque.style.backgroundColor = '#10B981';
    else bloque.style.backgroundColor = '#F59E0B';
    torre.appendChild(bloque);
  }
}

function salirJuego() {
  document.getElementById('juegoActivo').classList.add('hidden');
  document.getElementById('juegoApilador').classList.add('hidden');
  document.getElementById('menuJuegos').classList.remove('hidden');
}

function actualizarMarcadorJuego() {
  const p = document.getElementById('puntosJuego');
  const i = document.getElementById('intentosJuego');
  if (p) p.textContent = puntosJuego;
  if (i) i.textContent = intentosJuego;
}

// --- CRONÓMETRO ---
function iniciarCronometro(minutos) {
  if (cronometroInterval) clearInterval(cronometroInterval);
  tiempoRestante = minutos * 60;
  document.getElementById('btnDetenerCrono').classList.remove('hidden');
  actualizarPantallaCrono();

  cronometroInterval = setInterval(() => {
    tiempoRestante--;
    actualizarPantallaCrono();
    if (tiempoRestante <= 0) {
      clearInterval(cronometroInterval);
      alert('¡Tiempo completado! Tómate un descanso.');
      detenerCronometro();
    }
  }, 1000);
}

function actualizarPantallaCrono() {
  const min = Math.floor(tiempoRestante / 60);
  const seg = tiempoRestante % 60;
  document.getElementById('tiempoPantalla').textContent = `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

function detenerCronometro() {
  clearInterval(cronometroInterval);
  tiempoRestante = 0;
  actualizarPantallaCrono();
  document.getElementById('btnDetenerCrono').classList.add('hidden');
}

// --- NAVEGACIÓN ---
function cambiarTab(tab) {
  document.querySelectorAll('[id$="Container"]').forEach(el => {
    if(el.id !== 'loading') el.classList.add('hidden');
  });
  
  if (tab === 'mazo') document.getElementById('mazoContainer').classList.remove('hidden');
  if (tab === 'lista') document.getElementById('listaContainer').classList.remove('hidden');
  if (tab === 'guia') document.getElementById('guiaContainer').classList.remove('hidden');
  if (tab === 'quiz') document.getElementById('quizContainer').classList.remove('hidden');
  if (tab === 'juegos') document.getElementById('juegosContainer').classList.remove('hidden');
  if (tab === 'cronometro') document.getElementById('cronometroContainer').classList.remove('hidden');
  
  const botones = ['mazo', 'lista', 'guia', 'quiz', 'juegos', 'cronometro'];
  botones.forEach(b => {
    const btnPc = document.getElementById('nav-' + b);
    const btnMob = document.getElementById('mob-' + b);
    
    if (btnPc) {
      if (b === tab) btnPc.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#E8E6ED] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white transition';
      else btnPc.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[#5A5550] dark:text-gray-300 hover:bg-[#F7F5F2] dark:hover:bg-[#2A2A2A] transition';
    }
    
    if (btnMob) {
      if (b === tab) btnMob.className = 'flex flex-col items-center p-2 text-[#1A1A1A] dark:text-white';
      else btnMob.className = 'flex flex-col items-center p-2 text-[#8A8580] dark:text-gray-400';
    }
  });
}

function pedirMasMaterial() {
  alert('¡Pronto podrás generar más tarjetas!');
}
