const GROQ_KEY = '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';

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

const PROMPT_GUIA = `Eres un profesor experto. A partir del siguiente texto, crea una Guía de Estudio completa.
Usa títulos (con #, ##), viñetas, negritas y párrafos para estructurar los conceptos clave.
Devuelve SOLO el texto de la guía, sin formato JSON.

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

    const res2 = await fetch(url, {
      method: 'POST', headers: headers,
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: PROMPT_GUIA + texto }],
        temperature: 0.7
      })
    });
    if (res2.ok) {
      const data2 = await res2.json();
      material.guia = data2.choices[0].message.content;
    } else {
      material.guia = "No se pudo generar la guía.";
    }

    localStorage.setItem('materialGenerado', JSON.stringify(material));
    localStorage.setItem('textoGenerado', texto);
    return material;
  } catch (error) {
    console.error(error);
    return { flashcards: [{ pregunta: "Error", respuesta: "Intenta de nuevo." }], quiz: [], guia: "Error." };
  }
}

function demoMaterial() {
  return {
    flashcards: [{ pregunta: '¿Qué es la repetición espaciada?', respuesta: 'Una técnica.' }],
    quiz: [{ pregunta: '¿Objetivo?', opciones: ['A', 'B', 'C', 'D'], correcta: 1, explicacion: 'Distribuye.' }],
    guia: "## Guía\n\n- **Concepto 1:** Prueba."
  };
}
