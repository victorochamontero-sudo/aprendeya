// --- LÓGICA DEL QUIZ ACTUALIZADA ---
async function iniciarQuiz() {
  const cantidad = parseInt(document.getElementById('selectCantidad').value);
  const contenedor = document.getElementById('preguntasQuiz');
  const setup = document.getElementById('quizSetup');

  setup.classList.add('hidden'); 
  contenedor.innerHTML = '<p class="text-center text-[#8A8580]">Preparando tu examen... (esto puede tardar unos segundos)</p>';

  // 1. Verificamos si nos faltan preguntas
  if (material.quiz.length < cantidad) {
    try {
      const textoOriginal = localStorage.getItem('material');
      const cantidadFaltante = cantidad - material.quiz.length;
      
      // AQUÍ ESTÁ EL TRUCO: "await" obliga al sistema a esperar a que la IA responda
      const nuevasPreguntas = await generarPreguntasExtra(textoOriginal, cantidadFaltante);
      
      // Unimos las preguntas viejas con las nuevas
      material.quiz = [...material.quiz, ...nuevasPreguntas];
      localStorage.setItem('materialGenerado', JSON.stringify(material)); // Guardamos para no volver a pedirlas
    } catch (error) {
      console.error("No se pudieron generar preguntas extra", error);
    }
  }

  // 2. Cortamos el array para que tenga exactamente la cantidad pedida
  const preguntasFinales = material.quiz.slice(0, cantidad);
  contenedor.innerHTML = '';

  // 3. Pintamos las preguntas en pantalla
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

  // 4. Actualizamos el material temporal para que responderQuiz funcione
  material.quiz = preguntasFinales; 
}
