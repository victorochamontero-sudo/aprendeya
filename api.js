// ⚠️ PEGA AQUÍ TU NUEVA CLAVE DE OPENROUTER
const OPENROUTER_KEY = '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';

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
    return demoMaterial();
  }
}

function demoMaterial() {
  return {
    flashcards: [
      { pregunta: '¿Qué es la inflación?', respuesta: 'El aumento generalizado de los precios.' },
      { pregunta: '¿Qué es el PIB?', respuesta: 'Producto Interno Bruto.' },
      { pregunta: '¿Qué es un activo?', respuesta: 'Un recurso con valor.' },
      { pregunta: '¿Qué es un pasivo?', respuesta: 'Una deuda.' },
      { pregunta: '¿Qué es el interés?', respuesta: 'El costo del dinero.' }
    ],
    quiz: [
      { pregunta: '¿Qué mide la inflación?', opciones: ['El aumento de precios', 'El desempleo', 'Las exportaciones', 'La deuda'], correcta: 0, explicacion: 'La inflación mide la subida de precios.' }
    ],
    guia: "# Guía de Finanzas\n\n## Conceptos Básicos\n\n- **Inflación:** Aumento generalizado de precios.\n- **PIB:** Valor de producción de un país.\n- **Activos:** Lo que posees.\n- **Pasivos:** Lo que debes."
  };
}
