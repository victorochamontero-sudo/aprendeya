// ⚠️ CLAVE DE GOOGLE AI STUDIO CONFIGURADA
const GEMINI_KEY = 'AQ.Ab8RN6JMNPRvz8eThyImnU311vUt-EPIVeWvOWA_4g8vHFMjUg';

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
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  // Llamada a Google Gemini (ACTUALIZADO A LA VERSIÓN 3.8)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_KEY}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT + texto }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Error API Gemini: ' + err);
  }

  const data = await res.json();
  const contenido = data.candidates[0].content.parts[0].text;
  const material = JSON.parse(contenido);
  
  localStorage.setItem('materialGenerado', JSON.stringify(material));
  localStorage.setItem('textoGenerado', texto);
  return material;
}

// ---------- MODO DEMO ----------
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
