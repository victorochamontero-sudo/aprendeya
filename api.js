const GROQ_KEY = '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';

// Subimos a 8 flashcards y 5 preguntas para que tengas buen material desde el inicio
const PROMPT_MATERIAL = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del siguiente texto, genera material de estudio.
Devuelve SOLO un JSON válido con esta estructura, sin texto extra:
{
  "flashcards": [ { "pregunta": "...", "respuesta": "..." } ],
  "quiz": [ { "pregunta": "...", "opciones": ["A", "B", "C", "D"], "correcta": 0, "explicacion": "..." } ]
}
Reglas: 8 flashcards y 5 preguntas de quiz. Evalúa comprensión. En español.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');
  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  if (!GROQ_KEY || GROQ_KEY.includes('pon_aqui')) return demoMaterial();

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` };

  try {
    const res1 = await fetch(url, {
      method: 'POST', headers: headers,
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: PROMPT_MATERIAL + texto }],
        temperature: 0.5, response_format: { type: 'json_object' }
      })
    });
    if (!res1.ok) throw new Error('Error en tarjetas: ' + await res1.text());
    const data1 = await res1.json();
    
    let jsonLimpio = data1.choices[0].message.content.trim();
    const p1 = jsonLimpio.indexOf('{'), p2 = jsonLimpio.lastIndexOf('}');
    if (p1 !== -1 && p2 !== -1) jsonLimpio = jsonLimpio.substring(p1, p2 + 1);
    const material = JSON.parse(jsonLimpio);

    material.guia = "Haz clic en el botón para generar tu guía de estudio personalizada.";

    localStorage.setItem('materialGenerado', JSON.stringify(material));
    localStorage.setItem('textoGenerado', texto);
    return material;
  } catch (error) {
    console.error(error);
    return { flashcards: [{ pregunta: "Error", respuesta: "Intenta de nuevo." }], quiz: [], guia: "Error." };
  }
}

async function generarGuia(texto) {
  const PROMPT_GUIA = `Eres un profesor experto. A partir del siguiente texto, crea una Guía de Estudio completa.
Usa títulos (con #, ##), viñetas, negritas y párrafos para estructurar los conceptos clave.
Devuelve SOLO el texto de la guía, sin formato JSON.

TEXTO:
${texto}`;

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` };

  const res = await fetch(url, {
    method: 'POST', headers: headers,
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: PROMPT_GUIA }],
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error('Error en guía');
  const data = await res.json();
  return data.choices[0].message.content;
}

async function generarPreguntasExtra(texto, cantidadFaltante) {
  if (cantidadFaltante <= 0) return [];
  
  const PROMPT_EXTRA = `A partir del siguiente texto, genera ${cantidadFaltante} preguntas de opción múltiple ADICIONALES.
Devuelve SOLO un JSON válido: { "quiz": [ { "pregunta": "...", "opciones": ["A", "B", "C", "D"], "correcta": 0, "explicacion": "..." } ] }
En español. TEXTO: ${texto}`;

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` };

  const res = await fetch(url, {
    method: 'POST', headers: headers,
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: PROMPT_EXTRA }],
      temperature: 0.5, response_format: { type: 'json_object' }
    })
  });
  
  if (!res.ok) throw new Error('Error extra');
  const data = await res.json();
  let jsonLimpio = data.choices[0].message.content.trim();
  const p1 = jsonLimpio.indexOf('{'), p2 = jsonLimpio.lastIndexOf('}');
  if (p1 !== -1 && p2 !== -1) jsonLimpio = jsonLimpio.substring(p1, p2 + 1);
  return JSON.parse(jsonLimpio).quiz || [];
}

function demoMaterial() {
  return {
    flashcards: [{ pregunta: '¿Qué es la repetición espaciada?', respuesta: 'Una técnica.' }],
    quiz: [{ pregunta: '¿Objetivo?', opciones: ['A', 'B', 'C', 'D'], correcta: 1, explicacion: 'Distribuye.' }],
    guia: "## Guía\n\n- **Concepto 1:** Prueba."
  };
}
