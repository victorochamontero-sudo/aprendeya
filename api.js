// ⚠️ CLAVE DE GROQ CONFIGURADA
const GROQ_KEY = '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';

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

  if (!GROQ_KEY || GROQ_KEY.includes('pon_aqui')) {
    console.warn('Sin API key: usando modo demo.');
    return demoMaterial();
  }

  // Llamada a Groq (Modelo ACTUALIZADO a llama-3.1-8b-instant)
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', 
      messages: [{ role: 'user', content: PROMPT + texto }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Error API Groq: ' + err);
  }

  const data = await res.json();
  const contenido = data.choices[0].message.content;
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
