let material = null;
let mazo = [];
let indiceActual = 0;
let mostrandoRespuesta = false;
let stats = { aprendiendo: 0, revisando: 0, dominado: 0 };

(async function init() {
  const texto = localStorage.getItem('material');
  const loadingDiv = document.getElementById('loading');
  
  if (!texto) {
    loadingDiv.innerHTML = '<p class="text-sm text-[#8A8580]">No hay material. <a href="index.html" class="underline">Sube un archivo</a>.</p>';
    return;
  }

  try {
    const data = await generarMaterial(texto);
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
    loadingDiv.innerHTML = `<p class="text-sm text-red-600">Error: ${e.message}</p>`;
  }
})();

function actualizarStatsUI() {
  document.getElementById('stat-aprendiendo').textContent = stats.aprendiendo;
  document.getElementById('stat-revisando').textContent = stats.revisando;
  document.getElementById('stat-dominado').textContent = stats.dominado;
}

function actualizarUI() {
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
  // --- ESTILOS BARRA LATERAL (PC) ---
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

  // --- ESTILOS BARRA INFERIOR (MÓVIL) ---
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

  // Actualizar título del header móvil
  const headerTitle = document.getElementById('headerTitle');
  if(headerTitle) {
    if(tab === 'mazo') headerTitle.textContent = "Mazo";
    if(tab === 'lista') headerTitle.textContent = "Lista";
    if(tab === 'guia') headerTitle.textContent = "Guía de Estudio";
    if(tab === 'quiz') headerTitle.textContent = "Prueba";
  }

  // Ocultar todo
  document.getElementById('mazoContainer').classList.add('hidden');
  document.getElementById('mazoContainer').classList.remove('flex');
  document.getElementById('listaContainer').classList.add('hidden');
  document.getElementById('guiaContainer').classList.add('hidden');
  document.getElementById('quizContainer').classList.add('hidden');

  // Mostrar el seleccionado
  if (tab === 'mazo') {
    document.getElementById('mazoContainer').classList.remove('hidden');
    document.getElementById('mazoContainer').classList.add('flex');
    actualizarUI();
  } else if (tab === 'lista') {
    document.getElementById('listaContainer').classList.remove('hidden');
    const cont = document.getElementById('listaTarjetas');
    cont.innerHTML = material.flashcards.map((f, i) => `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-[#E5E1DA] hover:border-[#1A1A1A] transition group">
        <div class="flex-1 mb-2 sm:mb-0">
          <span class="font-bold text-[#1A1A1A] mr-2 text-sm md:text-base">${f.pregunta}</span>
          <span class="text-[#8A8580] hidden sm:inline">|</span>
          <span class="text-xs md:text-sm text-[#5A5550] block sm:inline mt-1 sm:mt-0">${f.respuesta}</span>
        </div>
        <button onclick="editarTarjeta(${i})" class="text-[#8A8580] hover:text-blue-500 transition p-2" title="Editar tarjeta">✏️</button>
      </div>
    `).join('');
  } else if (tab === 'guia') {
    document.getElementById('guiaContainer').classList.remove('hidden');
    const guiaHTML = document.getElementById('guiaTexto');
    
    if (!material.guia || material.guia.includes("Haz clic")) {
      guiaHTML.innerHTML = '<div class="text-center py-12"><div class="inline-block w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[#8A8580]">Generando tu guía de estudio...</p></div>';
      try {
        const textoOriginal = localStorage.getItem('material');
        const nuevaGuia = await generarGuia(textoOriginal);
        material.guia = nuevaGuia;
        localStorage.setItem('materialGenerado', JSON.stringify(material));
      } catch (e) {
        guiaHTML.innerHTML = '<p class="text-red-500">Hubo un error generando la guía. Intenta de nuevo.</p>';
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
  }
}

async function iniciarQuiz() {
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
    contenedor.innerHTML = '<p class="text-center text-red-500">No se pudieron generar preguntas. Intenta generando un texto más largo.</p>';
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
