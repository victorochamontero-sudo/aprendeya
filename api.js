// ⚠️ CLAVE DE OPENROUTER CONFIGURADA DIRECTAMENTE
const OPENROUTER_KEY = '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';

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del siguiente texto, genera material de estudio de ALTA CALIDAD.

Devuelve SOLO un JSON válido con esta estructura exacta, sin markdown, sin texto extra:
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
  ]
}

Reglas:
- 8 flashcards y 5 preguntas de quiz.
- Las preguntas deben evaluar comprensión, NO memorización literal.
- Incluye siempre la explicación pedagógica en cada pregunta del quiz.
- En español.

TEXTO:
`;

async function generarMaterial(texto) {
  // Cache: si ya generamos material para este texto, lo reutilizamos
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { /* ignora cache corrupta */ }
  }

  // Si no hay clave -> modo demo
  if (!OPENROUTER_KEY || OPENROUTER_KEY === '') {
    console.warn('Sin API key: usando modo demo.');
    const demo = demoMaterial();
    localStorage.setItem('materialGenerado', JSON.stringify(demo));
    localStorage.setItem('textoGenerado', texto);
    return demo;
  }

  // Llamada a OpenRouter
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: PROMPT + texto }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Error API OpenRouter: ' + err);
  }

  const data = await res.json();
  
  // Extraemos el texto de la respuesta
  const contenido = data.choices[0].message.content;
  const material = JSON.parse(contenido);
  
  localStorage.setItem('materialGenerado', JSON.stringify(material));
  localStorage.setItem('textoGenerado', texto);
  return material;
}

// ---------- MODO DEMO (por si falla la clave) ----------
function demoMaterial() {
  return {
    flashcards: [
      { pregunta: '¿Qué es la repetición espaciada?', respuesta: 'Una técnica que repite la información en intervalos crecientes para mejorar la retención a largo plazo.' }
    ],
    quiz: [
      {
        pregunta: '¿Cuál es el objetivo principal de la repetición espaciada?',
        opciones: ['Memorizar todo en una noche', 'Retener a largo plazo con menos esfuerzo', 'Leer más rápido', 'Evitar el olvido por completo'],
        correcta: 1,
        explicacion: 'La repetición espaciada distribuye el repaso en intervalos crecientes.'
      }
    ]
  };
}
