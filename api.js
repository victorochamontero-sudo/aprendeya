// ============================================
// APPRENDEYA - CONEXIÓN CON LA IA (GROQ)
// ============================================

// ⚠️ PEGA AQUÍ TU CLAVE DE GROQ (Empieza con gsk_)
const GROQ_API_KEY = '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';

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del texto, genera material de estudio en ESPAÑOL.
Devuelve SOLO un objeto JSON. No uses markdown, no pongas texto antes ni después.

Estructura exacta:
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
  "guia": "Escribe una guía de estudio usando saltos de línea (\\n) y viñetas."
}
Genera 5 flashcards y 3 preguntas de quiz. Todo en español.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'AQUI_TU_CLAVE_DE_GROQ') {
    alert('⚠️ Falta la clave de Groq en api.js.');
    return demoMaterial();
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', 
        messages: [{ role: 'user', content: PROMPT + texto }],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) throw new Error('Error API Groq: ' + await res.text());

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
    alert('❌ Error al conectar con Groq. Revisa que tu clave sea correcta.');
    return demoMaterial();
  }
}

function demoMaterial() {
  return {
    flashcards: [{ pregunta: 'Error de IA', respuesta: 'Revisa tu clave.' }],
    quiz: [],
    guia: "## Error de conexión\n\nNo se pudo generar la guía porque la IA rechazó la petición."
  };
}
