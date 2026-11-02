// ============================================
// APPRENDEYA - CONEXIÓN CON LA IA (OPENROUTER)
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
- 10 flashcards.
- 5 preguntas de quiz.
- En español.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  if (!MI_CLAVE_SECRETA || MI_CLAVE_SECRETA === 'sk-or-v1-TU_NUEVA_CLAVE_AQUI') {
    alert('⚠️ Falta la clave en config.js. Revisa el archivo.');
    return demoMaterial();
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MI_CLAVE_SECRETA}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001', // Modelo rápido y gratuito
        messages: [{ role: 'user', content: PROMPT + texto }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) throw new Error('Error API OpenRouter: ' + await res.text());
    
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
    alert('❌ Error al conectar con OpenRouter. Revisa tu clave en config.js.');
    return demoMaterial();
  }
}

// Material de respaldo por si la IA falla
function demoMaterial() {
  return {
    flashcards: [{ pregunta: 'Error de IA', respuesta: 'No se pudo generar el material. Revisa tu clave.' }],
    quiz: [],
    guia: "## Error de conexión\n\nNo se pudo generar la guía porque la IA rechazó la petición."
  };
}
