let materialActual = null;
let tarjetaActual = 0;
let estaVolteada = false;
let synth = window.speechSynthesis;
let cronometroInterval = null;
let tiempoRestante = 0;

document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');
  const btnError = document.getElementById('btnError');
  
  const materialGuardado = localStorage.getItem('materialGenerado');
  
  if (materialGuardado && materialGuardado !== 'null') {
    materialActual = JSON.parse(materialGuardado);
    iniciarInterfaz();
    return;
  }

  const texto = localStorage.getItem('material');
  if (!texto) {
    loadingText.textContent = "No hay material. Vuelve a la página de inicio.";
    document.getElementById('loadingSpinner').classList.add('hidden');
    btnError.classList.remove('hidden');
    btnError.onclick = () => window.location.href = 'index.html';
    return;
  }

  try {
    loadingText.textContent = "🧠 La IA está creando tu material de estudio...";
    materialActual = await generarMaterial(texto);
    guardarEnHistorial(localStorage.getItem('nombreMaterial') || 'Mi Kit');
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
  mostrarTarjeta();
  renderizarLista();
  renderizarGuia();
}

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
}

function mostrarTarjeta() {
  if (!materialActual || !materialActual.flashcards) return;
  const mazo = materialActual.flashcards;
  if (tarjetaActual >= mazo.length) tarjetaActual = 0; 
  
  document.getElementById('texto-pregunta').textContent = mazo[tarjetaActual].pregunta;
  document.getElementById('texto-respuesta').textContent = mazo[tarjetaActual].respuesta;
  
  estaVolteada = false;
  document.getElementById('tarjeta').classList.remove('flipped');
  document.getElementById('btnMostrar').textContent = 'Mostrar Respuesta';
  document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
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

function renderizarLista() {
  const contenedor = document.getElementById('listaTarjetas');
  if (!contenedor || !materialActual) return;
  contenedor.innerHTML = materialActual.flashcards.map(t => `
    <div class="p-4 bg-[#F7F5F2] rounded-xl border border-[#E5E1DA]">
      <p class="font-bold text-[#1A1A1A] mb-1">${t.pregunta}</p>
      <p class="text-sm text-[#5A5550]">${t.respuesta}</p>
    </div>
  `).join('');
}

function renderizarGuia() {
  const contenedor = document.getElementById('guiaTexto');
  if (!contenedor || !materialActual) return;
  let html = materialActual.guia || "Sin guía.";
  html = html.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  contenedor.innerHTML = html;
}

function guardarEnHistorial(nombre) {
  let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
  if (!historial.find(k => k.nombre === nombre)) {
    historial.push({ id: Date.now(), nombre: nombre, material: materialActual });
    localStorage.setItem('historialKits', JSON.stringify(historial));
  }
}

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

function iniciarCronometro(minutos) {
  if (cronometroInterval) clearInterval(cronometroInterval);
  tiempoRestante = minutos * 60;
  document.getElementById('btnDetenerCrono').classList.remove('hidden');
  actualizarPantallaCrono();
  cronometroInterval = setInterval(() => {
    tiempoRestante--;
    actualizarPantallaCrono();
    if (tiempoRestante <= 0) { clearInterval(cronometroInterval); alert('¡Tiempo!'); detenerCronometro(); }
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

function iniciarQuiz() {
  const cantidad = parseInt(document.getElementById('selectCantidad').value);
  const contenedor = document.getElementById('preguntasQuiz');
  document.getElementById('quizSetup').classList.add('hidden');
  let preguntas = materialActual.quiz || [];
  contenedor.innerHTML = preguntas.map((p, index) => `
    <div class="bg-white p-6 rounded-2xl border border-[#E5E1DA] shadow-sm mb-4">
      <p class="font-bold mb-4">${index + 1}. ${p.pregunta}</p>
      <div class="space-y-2">
        ${p.opciones.map((op, i) => `
          <button onclick="responderQuiz(this, ${i}, ${p.correcta})" class="w-full text-left p-3 rounded-xl border border-[#E5E1DA] hover:bg-[#F7F5F2] transition">
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
  if (seleccionada === correcta) btn.classList.add('bg-green-100', 'border-green-500');
  else { btn.classList.add('bg-red-100', 'border-red-500'); botones[correcta].classList.add('bg-green-100', 'border-green-500'); }
}

function iniciarJuegoCoincidencias() {
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoActivo').classList.remove('hidden');
  document.getElementById('tableroJuego').innerHTML = '<p class="col-span-full text-center">Juego en construcción...</p>';
}
function iniciarJuegoApilador() {
  document.getElementById('menuJuegos').classList.add('hidden');
  document.getElementById('juegoApilador').classList.remove('hidden');
}
function salirJuego() {
  document.getElementById('juegoActivo').classList.add('hidden');
  document.getElementById('juegoApilador').classList.add('hidden');
  document.getElementById('menuJuegos').classList.remove('hidden');
}
function pedirMasMaterial() { alert('¡Pronto podrás generar más tarjetas!'); }
