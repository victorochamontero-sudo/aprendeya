const GROQ_API_KEY = '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';

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
      "explicacion": "..."
    }
  ],
  "guia": "Escribe aquí una guía de estudio completa. Usa títulos (con #, ##), viñetas, negritas y párrafos."
}

Reglas:
- 4 flashcards y 3 preguntas de quiz.
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
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b', 
        messages: [{ role: 'user', content: PROMPT + texto }],
        temperature: 0.7,
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
    alert('❌ Error al conectar con la IA. Revisa tu clave de Groq.');
    return {
      flashcards: [{ pregunta: 'Error de IA', respuesta: 'Revisa tu clave.' }],
      quiz: [],
      guia: "## Error de conexión\n\nNo se pudo generar la guía."
    };
  }
}
