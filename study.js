// ============================================
// APPRENDEYA - PANTALLA DE ESTUDIO (study.js)
// ============================================

let materialActual = null;
let tarjetaActual = 0;
let estaVolteada = false;
let synth = window.speechSynthesis;
let cronometroInterval = null;
let tiempoRestante = 0;

let juegoActual = '';
let puntosJuego = 0;
let intentosJuego = 0;
let juegoCoincidenciasState = { seleccionados: [], pares: [], emparejados: 0 };
let apiladorState = { altura: 0, fallos: 0, preguntaActual: 0 };

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const btnError = document.getElementById('btnError');
  
  const texto = localStorage.getItem('material');
  
  if (!texto) {
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
    guardarEnHistorial();

    loading.classList.add('hidden');
    document.getElementById('mazoContainer').classList.remove('hidden');
    
    mostrarTarjeta();
    renderizarLista();
    renderizarGuia();
    
  } catch (error) {
    console.error("Error crítico:", error);
    loadingText.textContent = "Hubo un error al generar el material.";
    document.getElementById('loadingSpinner').classList.add('hidden');
    btnError.classList.remove('hidden');
    btnError.onclick = () => window.location.reload();
  }
});

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

// --- MAZO ---
function mostrarTarjeta() {
  if (!materialActual || !materialActual.flashcards) return;
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
  if (!contenedor || !materialActual) return;
  contenedor.innerHTML = materialActual.flashcards.map(t => `
    <div class="p-4 bg-[#F7F5F2] dark:bg-[#2A2A2A] rounded-xl border border-[#E5E1DA] dark:border-[#444]">
      <p class="font-bold text-[#1A1A1A] dark:text-white mb-1">${t.pregunta}</p>
      <p class="text-sm text-[#5A5550] dark:text-gray-300">${t.respuesta}</p>
    </div>
  `).join('');
}

function renderizarGuia() {
  const contenedor = document.getElementById('guiaTexto');
  if (!contenedor || !materialActual) return;
  
  let html = materialActual.guia || "Sin guía generada.";
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  contenedor.innerHTML = html;
}

function guardarEnHistorial() {
  const nombre = localStorage.getItem('nombreMaterial') || 'Kit sin nombre';
  let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
  
  const existe = historial.find(k => k.nombre === nombre);
  if (!existe) {
    historial.push({ id: Date.now(), nombre: nombre, material: materialActual });
    localStorage.setItem('historialKits', JSON.stringify(historial));
  }
}

// --- AUDIO ---
function leerTextoActual() {
  if (!materialActual) return;
  const tarjeta = materialActual.flashcards[tarjetaActual];
  const texto = estaVolteada ? tarjeta.respuesta : tarjeta.pregunta;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-ES';
  synth.speak(utterance);
}

function detenerLectura() { synth.cancel(); }

function leerGuiaCompleta() {
  if (!materialActual) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(materialActual.guia);
  utterance.lang = 'es-ES';
  synth.speak(utterance);
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

// --- PRUEBA (QUIZ) ---
function iniciarQuiz() {
  const cantidad = parseInt(document.getElementById('selectCantidad').value);
  const contenedor = document.getElementById('preguntasQuiz');
  document.getElementById('quizSetup').classList.add('hidden');
  
  let preguntas = materialActual.quiz;
  if (preguntas.length > cantidad) preguntas = preguntas.slice(0, cantidad);

  contenedor.innerHTML = preguntas.map((p, index) => `
    <div class="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#E5E1DA] dark:border-[#333] shadow-sm">
      <p class="font-bold mb-4 dark:text-white">${index + 1}. ${p.pregunta}</p>
      <div class="space-y-2">
        ${p.opciones.map((op, i) => `
          <button onclick="responderQuiz(this, ${i}, ${p.correcta})" class="w-full text-left p-3 rounded-xl border border-[#E5E1DA] dark:border-[#444] hover:bg-[#F7F5F2] dark:hover:bg-[#2A2A2A] transition dark:text-gray-200">
            ${op}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function responderQuiz(btn, seleccionada, correcta) {
  const botones = btn.parentElement.querySelectorAll('button');
  botones.forEach(b => b.disabled = true);
  
  if (seleccionada === correcta) {
    btn.classList.add('bg-green-100', 'border-green-500', 'text-green-800');
  } else {
    btn.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
    botones[correcta].classList.add('bg-green-100', 'border-green-500', 'text-green-800');
  }
}

// --- JUEGOS ---
function iniciarJuegoCoincidencias() {
  if (!materialActual || !materialActual.flashcards) return;
  
  juegoActual = 'coincidencias';
  puntosJuego = 0;
  intentosJuego = 0;
  juegoCoincidenciasState = { seleccionados: [], pares: [], emparejados: 0 };
  
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoActivo').classList.remove('hidden');
  document.getElementById('juegoApilador').classList.add('hidden');
  
  actualizarMarcadorJuego();
  
  const mazo = materialActual.flashcards.slice(0, 4);
  let cartas = [];
  mazo.forEach((t, index) => {
    cartas.push({ id: index, texto: t.pregunta, tipo: 'pregunta' });
    cartas.push({ id: index, texto: t.respuesta, tipo: 'respuesta' });
  });
  
  cartas = cartas.sort(() => Math.random() - 0.5);
  juegoCoincidenciasState.pares = cartas;
  
  renderizarTableroCoincidencias();
}

function renderizarTableroCoincidencias() {
  const tablero = document.getElementById('tableroJuego');
  tablero.innerHTML = juegoCoincidenciasState.pares.map((carta, index) => `
    <button onclick="seleccionarCartaCoincidencia(${index})" id="carta-${index}" 
      class="h-24 sm:h-32 bg-blue-500 text-white p-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center text-center transition transform hover:scale-105 active:scale-95 shadow-md">
      ${carta.texto}
    </button>
  `).join('');
}

function seleccionarCartaCoincidencia(index) {
  const state = juegoCoincidenciasState;
  const btn = document.getElementById(`carta-${index}`);
  
  if (state.seleccionados.includes(index) || btn.disabled) return;
  
  btn.classList.replace('bg-blue-500', 'bg-blue-700');
  state.seleccionados.push(index);
  
  if (state.seleccionados.length === 2) {
    intentosJuego++;
    actualizarMarcadorJuego();
    
    const idx1 = state.seleccionados[0];
    const idx2 = state.seleccionados[1];
    const carta1 = state.pares[idx1];
    const carta2 = state.pares[idx2];
    
    if (carta1.id === carta2.id && carta1.tipo !== carta2.tipo) {
      puntosJuego += 10;
      actualizarMarcadorJuego();
      document.getElementById(`carta-${idx1}`).classList.replace('bg-blue-700', 'bg-green-500');
      document.getElementById(`carta-${idx2}`).classList.replace('bg-blue-700', 'bg-green-500');
      document.getElementById(`carta-${idx1}`).disabled = true;
      document.getElementById(`carta-${idx2}`).disabled = true;
      state.emparejados++;
      
      if (state.emparejados === 4) {
        setTimeout(() => alert('¡Felicidades! Has ganado el juego.'), 500);
      }
    } else {
      setTimeout(() => {
        document.getElementById(`carta-${idx1}`).classList.replace('bg-blue-700', 'bg-blue-500');
        document.getElementById(`carta-${idx2}`).classList.replace('bg-blue-700', 'bg-blue-500');
      }, 800);
    }
    state.seleccionados = [];
  }
}

function iniciarJuegoApilador() {
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoApilador').classList.remove('hidden');
  document.getElementById('instruccionesApilador').classList.remove('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('hidden');
}

function comenzarApilador() {
  if (!materialActual || !materialActual.flashcards) return;
  
  document.getElementById('instruccionesApilador').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('hidden');
  
  apiladorState = { altura: 0, fallos: 0, preguntaActual: 0 };
  actualizarTorre();
  siguientePreguntaApilador();
}

function siguientePreguntaApilador() {
  if (!materialActual || !materialActual.flashcards) return;
  
  if (apiladorState.preguntaActual >= materialActual.flashcards.length) {
    apiladorState.preguntaActual = 0;
  }
  
  const tarjeta = materialActual.flashcards[apiladorState.preguntaActual];
  document.getElementById('textoPreguntaApilador').textContent = tarjeta.pregunta;
  
  let opciones = [tarjeta.respuesta];
  materialActual.flashcards.forEach(t => {
    if (t.respuesta !== tarjeta.respuesta && opciones.length < 4) {
      opciones.push(t.respuesta);
    }
  });
  
  while (opciones.length < 4) {
    opciones.push('Opción incorrecta');
  }
  
  opciones = opciones.sort(() => Math.random() - 0.5);
  
  const contenedor = document.getElementById('opcionesApilador');
  contenedor.innerHTML = opciones.map(op => `
    <button onclick="responderApilador('${op.replace(/'/g, "\\'")}', '${tarjeta.respuesta.replace(/'/g, "\\'")}')" 
      class="w-full text-left bg-white dark:bg-[#2A2A2A] border border-[#E5E1DA] dark:border-[#444] text-[#1A1A1A] dark:text-white p-3 rounded-xl hover:bg-[#F7F5F2] dark:hover:bg-[#333] transition text-sm font-medium">
      ${op}
    </button>
  `).join('');
}

function responderApilador(seleccion, correcta) {
  if (seleccion === correcta) apiladorState.altura++;
  else apiladorState.fallos++;
  
  apiladorState.preguntaActual++;
  actualizarTorre();
  siguientePreguntaApilador();
}

function actualizarTorre() {
  document.getElementById('alturaTorre').textContent = apiladorState.altura;
  document.getElementById('fallosTorre').textContent = apiladorState.fallos;
  
  const torre = document.getElementById('torreContainer');
  torre.innerHTML = '';
  
  for (let i = 0; i < apiladorState.altura; i++) {
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
  juegoActual = '';
}

function actualizarMarcadorJuego() {
  const p = document.getElementById('puntosJuego');
  const i = document.getElementById('intentosJuego');
  if (p) p.textContent = puntosJuego;
  if (i) i.textContent = intentosJuego;
}

function pedirMasMaterial() {
  alert('¡Pronto podrás generar más tarjetas!');
}
