let material = null;
let flashIdx = 0;
let mostrandoRespuesta = false;

(async function init() {
  const texto = localStorage.getItem('material');
  if (!texto) {
    document.getElementById('loading').innerHTML =
      '<p class="text-sm text-[#8A8580]">No hay material. <a href="index.html" class="underline">Sube un archivo</a>.</p>';
    return;
  }

  try {
    material = await generarMaterial(texto);
    document.getElementById('loading').classList.add('hidden');
    cambiarTab('flash');
  } catch (e) {
    document.getElementById('loading').innerHTML =
      `<p class="text-sm text-red-600">Error: ${e.message}</p>`;
  }
})();

function cambiarTab(tab) {
  const flash = document.getElementById('flashContainer');
  const quiz = document.getElementById('quizContainer');
  const tabFlash = document.getElementById('tab-flash');
  const tabQuiz = document.getElementById('tab-quiz');

  const activo = 'px-5 py-2.5 rounded-full text-sm font-semibold bg-[#1A1A1A] text-white';
  const inactivo = 'px-5 py-2.5 rounded-full text-sm font-semibold border border-[#D6D1CA]';

  if (tab === 'flash') {
    flash.classList.remove('hidden');
    quiz.classList.add('hidden');
    tabFlash.className = activo;
    tabQuiz.className = inactivo;
    renderFlash();
  } else {
    flash.classList.add('hidden');
    quiz.classList.remove('hidden');
    tabFlash.className = inactivo;
    tabQuiz.className = activo;
    renderQuiz();
  }
}

function renderFlash() {
  if (!material) return;
  const card = material.flashcards[flashIdx];
  document.getElementById('cardText').textContent =
    mostrandoRespuesta ? card.respuesta : card.pregunta;
  document.getElementById('contador').textContent =
    `${flashIdx + 1} / ${material.flashcards.length}`;
}

function voltear() { mostrandoRespuesta = !mostrandoRespuesta; renderFlash(); }

function siguiente() {
  if (flashIdx < material.flashcards.length - 1) {
    flashIdx++; mostrandoRespuesta = false; renderFlash();
  }
}
function anterior() {
  if (flashIdx > 0) { flashIdx--; mostrandoRespuesta = false; renderFlash(); }
}

function renderQuiz() {
  if (!material) return;
  const cont = document.getElementById('quizContainer');
  cont.innerHTML = '';

  material.quiz.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-3xl shadow-sm p-6 mb-4';
    div.innerHTML = `
      <p class="font-semibold mb-4">${i + 1}. ${q.pregunta}</p>
      <div class="space-y-2" id="opciones-${i}">
        ${q.opciones.map((op, j) => `
          <button onclick="responder(${i}, ${j})"
            class="w-full text-left px-4 py-3 rounded-xl border border-[#E5E1DA] text-sm hover:bg-[#F7F5F2] transition">
            ${op}
          </button>
        `).join('')}
      </div>
      <p id="exp-${i}" class="hidden mt-4 text-sm text-[#5A5550] bg-[#F7F5F2] p-4 rounded-xl"></p>
    `;
    cont.appendChild(div);
  });
}

function responder(qIdx, opIdx) {
  const q = material.quiz[qIdx];
  const botones = document.querySelectorAll(`#opciones-${qIdx} button`);
  const exp = document.getElementById(`exp-${qIdx}`);

  botones.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correcta) b.className = 'w-full text-left px-4 py-3 rounded-xl border-2 border-green-500 bg-green-50 text-sm';
    else if (i === opIdx) b.className = 'w-full text-left px-4 py-3 rounded-xl border-2 border-red-400 bg-red-50 text-sm';
    else b.className = 'w-full text-left px-4 py-3 rounded-xl border border-[#E5E1DA] text-sm opacity-60';
  });

  exp.textContent = '💡 ' + q.explicacion;
  exp.classList.remove('hidden');
}