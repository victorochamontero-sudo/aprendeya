let material = null;
let mazo = [];
let indiceActual = 0;
let mostrandoRespuesta = false;
let stats = { aprendiendo: 0, revisando: 0, dominado: 0 };
let generacionesExtra = 0; 

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

  try {
    const data = await generarMaterial(texto);
    if (!data || !data.flashcards || data.flashcards.length === 0) throw new Error("La IA no devolvió tarjetas válidas.");
    
    material = data;
    if (!material.quiz) material.quiz = []; 
    mazo = [...material.flashcards].sort(() => Math.random() - 0.5);
    stats.aprendiendo = mazo.length;

    const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
    let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
    historial = historial.filter(k => k.nombre !== nombreKit);
    historial.unshift({ id: Date.now(), nombre: nombreKit, material: material });
    localStorage.setItem('historialKits', JSON.stringify(historial));

    loadingDiv.classList.add('hidden');
    cambiarTab('mazo');
  } catch (e) {
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
  const clasesNav = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition text-[#5A5550] hover:bg-[#F7F5F2]";
  const activoNav = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#E8E6ED] text-[#1A1A1A] transition";
  
  if(document.getElementById('nav-mazo')) {
    document.getElementById('nav-mazo').className = clasesNav;
    document.getElementById('nav-lista').className = clasesNav;
    document.getElementById('nav-guia').className = clasesNav;
    document.getElementById('nav-quiz').className = clasesNav;
    
    if (tab === 'mazo') document.getElementById('nav-mazo').className = activoNav;
    if (tab === 'lista') document.getElementById('nav-lista').className = activoNav;
    if (tab === 'guia') document.getElementById('nav-guia').className = activoNav;
    if (tab === 'quiz') document.getElementById('nav-quiz').className = activoNav;
  }

  const clasesMob = "flex flex-col items-center p-2 text-[#8A8580]";
  const activoMob = "flex flex-col items-center p-2 text-[#1A1A1A]";
  if(document.getElementById('mob-mazo')) {
    document.getElementById('mob-mazo').className = clasesMob;
    document.getElementById('mob-lista').className = clasesMob;
    document.getElementById('mob-guia').className = clasesMob;
    document.getElementById('mob-quiz').className = clasesMob;
    if (tab === 'mazo') document.getElementById('mob-mazo').className = activoMob;
    if (tab === 'lista') document.getElementById('mob-lista').className = activoMob;
    if (tab === 'guia') document.getElementById('mob-guia').className = activoMob;
    if (tab === 'quiz') document.getElementById('mob-quiz').className = activoMob;
  }

  const headerTitle = document.getElementById('headerTitle');
  if(headerTitle) {
    if(tab === 'mazo') headerTitle.textContent = "Mazo";
    if(tab === 'lista') headerTitle.textContent = "Lista";
    if(tab === 'guia') headerTitle.textContent = "Guía de Estudio";
    if(tab === 'quiz') headerTitle.textContent = "Prueba";
  }

  document.getElementById('mazoContainer').classList.add('hidden');
  document.getElementById('mazoContainer').classList.remove('flex');
  document.getElementById('listaContainer').classList.add('hidden');
  document.getElementById('guiaContainer').classList.add('hidden');
  document.getElementById('quizContainer').classList.add('hidden');

  if (tab === 'mazo') {
    document.getElementById('mazoContainer').classList.remove('hidden');
    document.getElementById('mazoContainer').classList.add('flex');
    actualizarUI();
  } else if (tab === 'lista') {
    document.getElementById('listaContainer').classList.remove('hidden');
    const cont = document.getElementById('listaTarjetas');
    if (material && material.flashcards) {
      // DISEÑO ACORDEÓN: Respuesta oculta
      cont.innerHTML = material.flashcards.map((f, i) => `
        <div class="bg-white rounded-xl border border-[#E5E1DA] overflow-hidden transition-all duration-300">
          <button onclick="toggleRespuesta(${i})" class="w-full text-left p-4 flex justify-between items-center hover:bg-[#F7F5F2] transition">
            <span class="font-bold text-[#1A1A1A] text-sm md:text-base pr-4">${f.pregunta}</span>
            <span id="icono-${i}" class="text-[#8A8580] text-xl font-bold transform transition-transform duration-300">+</span>
          </button>
          <div id="respuesta-${i}" class="hidden px-4 pb-4 pt-1 border-t border-[#F7F5F2]">
            <p class="text-sm text-[#5A5550] mb-3">${f.respuesta}</p>
            <button onclick="editarTarjeta(${i})" class="text-xs font-semibold text-blue-500 hover:text-blue-700">✏️ Editar tarjeta</button>
          </div>
        </div>
      `).join('');
    }
  } else
