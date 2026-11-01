const OPENROUTER_KEY = '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';

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del siguiente texto, genera material de estudio de ALTA CALIDAD en ESPAÑOL.

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
      "explicacion": "..."
    }
  ],
  "guia": "Usa títulos (#, ##), viñetas, negritas y párrafos para estructurar los conceptos clave."
}

Reglas:
- Genera 10 flashcards.
- Genera 5 preguntas de quiz.
- En español.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

    if (!res.ok) throw new Error('Error API');
    
    const data = await res.json();
    let jsonLimpio = data.choices[0].message.content.trim();
    const p1 = jsonLimpio.indexOf('{');
    const p2 = jsonLimpio.lastIndexOf('}');
    if (p1 !== -1 && p2 !== -1) jsonLimpio = jsonLimpio.substring(p1, p2 + 1);
    
    const material = JSON.parse(jsonLimpio);
    localStorage.setItem('materialGenerado', JSON.stringify(material));
    localStorage.setItem('textoGenerado', texto);
    return material;
    
  } catch (error) {
    console.error("Error generando material:", error);
    alert('⚠️ La IA está fallando o la clave está bloqueada. Revisa tu clave en api.js.');
    return demoMaterial();
  }
}

function demoMaterial() {
  return {
    flashcards: [{ pregunta: 'Error de IA', respuesta: 'No se pudo generar. Revisa tu clave.' }],
    quiz: [],
    guia: "## Error de conexión\n\nNo se pudo generar la guía porque la IA rechazó la petición."
  };
}
