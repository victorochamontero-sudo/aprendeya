let material = null;
let mazo = [];
let indiceActual = 0;
let mostrandoRespuesta = false;
let stats = { aprendiendo: 0, revisando: 0, dominado: 0 };
let generacionesExtra = 0; 
let sintetizador = window.speechSynthesis;

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

    if (!material.quiz) material.quiz = []; 
    mazo = [...material.flashcards].sort(() => Math.random() - 0.5);
    stats.aprendiendo = mazo.length;

    loadingDiv.classList.add('hidden');
    cambiarTab('mazo');
  } catch (e) {
    console.error("Error en Init:", e);
    loadingText.textContent = "¡Ups! Hubo un error.";
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
      guiaHTML.innerHTML = '<div class="text-center py-12"><div class="inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[#8A8580]">Generando tu guía de estudio (esto puede tardar unos segundos)...</p></div>';
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
        guiaHTML.innerHTML = '<p class="text-red-500">Hubo un error generando la guía. Por favor, recarga la página.</p>';
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
  contenedor.innerHTML = '<div class="text-center py-8"><div class="inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mb-4"></div><p class
