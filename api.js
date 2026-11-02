// ============================================
// APRENDEYA - MODO DE PRUEBA (SIN ERRORES)
// ============================================

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.`;

async function generarMaterial(texto) {
  // Simulamos un retraso de 1 s// ============================================
// APRENDEYA - CONEXIÓN REAL CON LA IA (SIN PLAN B)
// ============================================

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del texto, genera material de estudio de ALTA CALIDAD en ESPAÑOL.

Devuelve SOLO un JSON válido, sin markdown, sin texto extra:
{
  "flashcards": [
    { "pregunta": "...", "respuesta": "..." }
  ],
  "quiz": [
    {
      "pregunta": "...",
      "opciones": ["A", "B", "C", "D"],
      "correcta": 0,
      "explicacion": "Por qué la correcta lo es y por qué las otras no."
    }
  ],
  "guia": "Escribe aquí una guía de estudio completa. Usa títulos (con #, ##), viñetas, negritas y párrafos."
}

Reglas:
- 8 flashcards.
- 5 preguntas de quiz.
- En español.

TEXTO:
`;

async function generarMaterial(texto) {
  // Borramos la caché para que siempre pregunte a la IA
  localStorage.removeItem('materialGenerado');
  localStorage.removeItem('textoGenerado');

  if (!MI_CLAVE_SECRETA || MI_CLAVE_SECRETA === 'sk-or-v1-tu_clave_real_aqui') {
    alert('⚠️ Falta tu clave de OpenRouter en config.js');
    throw new Error('Falta la clave');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MI_CLAVE_SECRETA}`
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-001',
      messages: [{ role: 'user', content: PROMPT + texto }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    alert('❌ Error de OpenRouter: ' + err);
    throw new Error(err);
  }
  
  const data = await res.json();
  let jsonLimpio = data.choices[0].message.content.trim();
  const p1 = jsonLimpio.indexOf('{');
  const p2 = jsonLimpio.lastIndexOf('}');
  if (p1 !== -1 && p2 !== -1) jsonLimpio = jsonLimpio.substring(p1, p2 + 1);
  
  return JSON.parse(jsonLimpio);
}

// Funciones de respaldo
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
  return { flashcards: material.flashcards, quiz: material.quiz };
}egundo para que se vea la animación
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
