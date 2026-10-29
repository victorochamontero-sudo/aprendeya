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
    mazo = [...material.flashcards].sort(() => Math.random() - 0.5);
    stats.aprendiendo = mazo.length;

    const nombreKit = localStorage.getItem('nombreMaterial') || 'Mi Kit';
    let historial = JSON.parse(localStorage.getItem('historialKits') || '[]');
    historial = historial.filter(k => k.nombre !== nombreKit);
    historial.unshift({ id: Date.now(), nombre: nombreKit, material: material });
    localStorage.setItem('historialKits', JSON.stringify(historial));

    loadingDiv.classList.add('hidden');
    document.getElementById('mazoContainer').classList.remove('hidden');
    actualizarUI();
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
  const activo = 'px-3 py-1.5 rounded-full font-semibold bg-[#1A1A1A] text-white';
  const inactivo = 'px-3 py-1.5 rounded-full font-semibold border border-[#D6D1CA] hover:bg-gray-50';
  
  document.getElementById('tab-mazo').className = tab === 'mazo' ? activo : inactivo;
  document.getElementById('tab-lista').className = tab === 'lista' ? activo : inactivo;
  document.getElementById('tab-guia').className = tab === 'guia' ? activo : inactivo;
  document.getElementById('tab-quiz').className = tab === 'quiz' ? activo : inactivo;

  document.getElementById('mazoContainer').classList.add('hidden');
  document.getElementById('listaContainer').classList.add('hidden');
  document.getElementById('guiaContainer').classList.add('hidden');
  document.getElementById('quizContainer').classList.add('hidden');

  if (tab === 'mazo') {
    document.getElementById('mazoContainer').classList.remove('hidden');
  } else if (tab === 'lista') {
    document.getElementById('listaContainer').classList.remove('hidden');
    const cont = document.getElementById('listaTarjetas');
    cont.innerHTML = material.flashcards.map((f, i) => `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-[#E5E1DA] hover:border-[#1A1A1A] transition group">
        <div class="flex-1 mb-2 sm:mb-0">
          <span class="font-bold text-[#1A1A1A] mr-2">${f.pregunta}</span>
          <span class="text-[#8A8580] hidden sm:inline">|</span>
          <span class="text-sm text-[#5A5550] block sm:inline mt-1 sm:mt-0">${f.respuesta}</span>
        </div>
        <button class="text-[#8A8580] group-hover:text-[#1A1A1A]">✏️</button>
      </div>
    `).join('');
  } else if (tab === 'guia') {
    document.getElementById('guiaContainer').classList.remove('hidden');
    const guiaHTML = document.getElementById('guiaTexto');
    
    // Si la guía no se ha generado, la generamos aquí mismo
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
  contenedor.innerHTML = '<p class="text-center text-[#8A8580]">Preparando tu examen...</p>';

  if (material.quiz.length < cantidad) {
    try {
      const textoOriginal = localStorage.getItem('material');
      const cantidadFaltante = cantidad - material.quiz.length;
      const nuevasPreguntas = await generarPreguntasExtra(textoOriginal, cantidadFaltante);
      material.quiz = [...material.quiz, ...nuevasPreguntas];
      localStorage.setItem('materialGenerado', JSON.stringify(material)); 
    } catch (error) {
      console.error("No se pudieron generar preguntas extra", error);
    }
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
