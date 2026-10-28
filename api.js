// Esta clave será reemplazada automáticamente por GitHub Actions antes de publicar
const OPENROUTER_KEY = 'MI_CLAVE_SECRETA';

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
  if (cache) {
    try { return JSON.parse(cache); } catch (e) { /* ignora cache corrupta */ }
  }

  // Si no hay clave -> modo demo
  if (!OPENROUTER_KEY || OPENROUTER_KEY === 'MI_CLAVE_SECRETA') {
    console.warn('Sin API key: usando modo demo.');
    const demo = demoMaterial();
    localStorage.setItem('materialGenerado', JSON.stringify(demo));
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
  return material;
}

// ---------- MODO DEMO (por si algo falla) ----------
function demoMaterial() {
  return {
    flashcards: [
      { pregunta: '¿Qué es la repetición espaciada?', respuesta: 'Una técnica que repite la información en intervalos crecientes para mejorar la retención a largo plazo.' },
      { pregunta: '¿Por qué el feedback explicativo mejora el aprendizaje?', respuesta: 'Porque corrige el modelo mental del estudiante, no solo indica si acertó.' },
      { pregunta: '¿Qué diferencia hay entre memorizar y comprender?', respuesta: 'Memorizar es retener datos; comprender es conectarlos y aplicarlos en contextos nuevos.' },
      { pregunta: '¿Qué es la carga cognitiva?', respuesta: 'La cantidad de esfuerzo mental que exige una tarea; si es excesiva, el aprendizaje se bloquea.' },
      { pregunta: '¿Qué hace efectiva una flashcard?', respuesta: 'Una sola idea por tarjeta, pregunta clara y respuesta breve.' },
      { pregunta: '¿Qué es el aprendizaje activo?', respuesta: 'Aprender haciendo (recuperar, aplicar, explicar) en lugar de solo leer o escuchar.' },
      { pregunta: '¿Por qué es útil el "testing effect"?', respuesta: 'Porque recuperar información de la memoria refuerza la huella mnémica más que releer.' },
      { pregunta: '¿Qué es el olvido?', respuesta: 'La pérdida progresiva de acceso a la información si no se recupera periódicamente.' }
    ],
    quiz: [
      {
        pregunta: '¿Cuál es el objetivo principal de la repetición espaciada?',
        opciones: ['Memorizar todo en una noche', 'Retener a largo plazo con menos esfuerzo', 'Leer más rápido', 'Evitar el olvido por completo'],
        correcta: 1,
        explicacion: 'La repetición espaciada distribuye el repaso en intervalos crecientes. No evita el olvido del todo (opción D), pero lo combate eficientemente.'
      },
      {
        pregunta: 'El "testing effect" se refiere a...',
        opciones: ['Hacer exámenes solo para aprobar', 'Que recuperar información refuerza la memoria', 'Que los tests son aburridos', 'Que solo importa la nota'],
        correcta: 1,
        explicacion: 'Recuperar activamente (no solo releer) refuerza la memoria. Un examen no es solo evaluación: es una herramienta de aprendizaje.'
      },
      {
        pregunta: 'Una buena flashcard debe...',
        opciones: ['Contener un párrafo completo', 'Tener una sola idea por tarjeta', 'Incluir toda la unidad', 'Ser copiada literal del libro'],
        correcta: 1,
        explicacion: 'Una idea por tarjeta reduce la carga cognitiva y facilita la recuperación. Los párrafos completos generan interferencia.'
      },
      {
        pregunta: 'El feedback explicativo es valioso porque...',
        opciones: ['Solo dice "bien" o "mal"', 'Corrige el modelo mental del estudiante', 'Asusta al alumno', 'Ahorra tiempo'],
        correcta: 1,
        explicacion: 'Saber por qué algo está mal (y por qué las otras opciones no sirven) reestructura el conocimiento, no solo la respuesta.'
      },
      {
        pregunta: 'Si la carga cognitiva es excesiva...',
        opciones: ['Se aprende más rápido', 'El aprendizaje se bloquea', 'No pasa nada', 'El alumno se motiva'],
        correcta: 1,
        explicacion: 'La memoria de trabajo es limitada. Si la tarea exige más de lo que puede procesar, la información no se consolida.'
      }
    ]
  };
}