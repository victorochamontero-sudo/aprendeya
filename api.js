// ============================================
// APPRENDEYA - CONEXIÓN CON LA IA (OPENROUTER)
// ============================================

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
  ],
  "guia": "Escribe aquí una guía de estudio completa basada en el texto. Usa títulos (con #, ##), viñetas, negritas y párrafos para estructurar los conceptos clave. Debe ser como un buen apunte de clase."
}

Reglas:
- 4 flashcards y 3 preguntas de quiz.
- Las preguntas deben evaluar comprensión, NO memorización literal.
- La guía debe ser detallada y fácil de leer.
- En español.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  try {
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
    const contenido = data.choices[0].message.content;
    
    let jsonLimpio = contenido.trim();
    const primerLlave = jsonLimpio.indexOf('{');
    const ultimaLlave = jsonLimpio.lastIndexOf('}');
    if (primerLlave !== -1 && ultimaLlave !== -1) {
        jsonLimpio = jsonLimpio.substring(primerLlave, ultimaLlave + 1);
    }
    
    const material = JSON.parse(jsonLimpio);
    
    localStorage.setItem('materialGenerado', JSON.stringify(material));
    localStorage.setItem('textoGenerado', texto);
    return material;
    
  } catch (error) {
    console.error("Error generando material:", error);
    alert('❌ Error al conectar con la IA. Revisa la consola (F12) para más detalles.');
    return demoMaterial();
  }
}

function demoMaterial() {
  return {
    flashcards: [{ pregunta: '¿Qué es la repetición espaciada?', respuesta: 'Una técnica de estudio.' }],
    quiz: [{ pregunta: '¿Objetivo de la repetición espaciada?', opciones: ['A', 'B', 'C', 'D'], correcta: 1, explicacion: 'Distribuye el repaso.' }],
    guia: "## Guía de Estudio de Prueba\n\n- **Concepto 1:** Esto es una prueba."
  };
}
