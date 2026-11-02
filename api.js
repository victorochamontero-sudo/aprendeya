// ============================================
// APRENDEYA - MODO DE PRUEBA (SIN ERRORES)
// ============================================

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.`;

async function generarMaterial(texto) {
  // Simulamos un retraso de 1 segundo para que se vea la animación
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Devolvemos las tarjetas de prueba directamente
  return {
    flashcards: [
      { pregunta: '¿Qué es la fotosíntesis?', respuesta: 'El proceso de convertir luz en energía.' },
      { pregunta: '¿Dónde ocurre?', respuesta: 'En los cloroplastos.' },
      { pregunta: '¿Qué pigmento usa?', respuesta: 'La clorofila.' },
      { pregunta: '¿Qué produce?', respuesta: 'Glucosa y oxígeno.' },
      { pregunta: '¿Quién realiza la fotosíntesis?', respuesta: 'Las plantas y algas.' },
      { pregunta: '¿Qué gas necesitan?', respuesta: 'Dióxido de carbono (CO2).' },
      { pregunta: '¿Qué gas liberan?', respuesta: 'Oxígeno (O2).' },
      { pregunta: '¿Cuál es la fuente de energía?', respuesta: 'La luz solar.' }
    ],
    quiz: [
      { pregunta: '¿Necesita luz la fotosíntesis?', opciones: ['Sí', 'No', 'A veces', 'Depende'], correcta: 0, explicacion: 'Necesita luz solar como fuente de energía.' },
      { pregunta: '¿Dónde ocurre el proceso?', opciones: ['Núcleo', 'Cloroplastos', 'Mitocondria', 'Citoplasma'], correcta: 1, explicacion: 'Ocurre en los cloroplastos de las células vegetales.' },
      { pregunta: '¿Qué libera al ambiente?', opciones: ['CO2', 'Oxígeno', 'Nitrógeno', 'Agua'], correcta: 1, explicacion: 'Libera oxígeno como subproducto.' }
    ],
    guia: "## Fotosíntesis\n\nLa fotosíntesis es el proceso por el cual las plantas convierten la luz solar en energía química.\n\n### ¿Dónde ocurre?\nEn los **cloroplastos**.\n\n### ¿Qué pigmento usa?\nLa **clorofila**."
  };
}

// Funciones de respaldo para que study.js no marque error
async function generarGuia(texto) {
  const material = await generarMaterial(texto);
  return material.guia;
}

async function generarPreguntasExtra(texto, cantidad) {
  const material = await generarMaterial(texto);
  return material.quiz.slice(0, cantidad);
}

async function generarMasMaterial(texto, flashcardsActuales, quizActual) {
  const material = await generarMaterial(texto);
  return {
    flashcards: material.flashcards,
    quiz: material.quiz
  };
}
