// ============================================
// APPRENDEYA - CONEXIÓN CON LA IA (GROQ)
// ============================================

// ⚠️ PEGA AQUÍ TU CLAVE DE GROQ (Empieza con gsk_)
const GROQ_API_KEY = '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';

const PROMPT = `Eres un experto en ciencias cognitivas del aprendizaje.
A partir del texto, genera material de estudio en ESPAÑOL.
Devuelve SOLO un objeto JSON. No uses markdown, no pongas texto antes ni después. Solo el JSON puro.

El JSON debe tener exactamente esta estructura:
{
  "flashcards": [
    { "pregunta": "Pregunta 1", "respuesta": "Respuesta 1" },
    { "pregunta": "Pregunta 2", "respuesta": "Respuesta 2" },
    { "pregunta": "Pregunta 3", "respuesta": "Respuesta 3" },
    { "pregunta": "Pregunta 4", "respuesta": "Respuesta 4" }
  ],
  "quiz": [
    {
      "pregunta": "Pregunta de quiz 1",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 0,
      "explicacion": "Explicación de por qué es la correcta"
    },
    {
      "pregunta": "Pregunta de quiz 2",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 1,
      "explicacion": "Explicación de por qué es la correcta"
    },
    {
      "pregunta": "Pregunta de quiz 3",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 2,
      "explicacion": "Explicación de por qué es la correcta"
    }
  ],
  "guia": "Escribe una guía de estudio aquí usando saltos de línea (\\n) para separar párrafos y viñetas con -."
}

Recuerda: 4 flashcards, 3 preguntas de quiz. Todo en español. Solo JSON.

TEXTO:
`;

async function generarMaterial(texto) {
  const cache = localStorage.getItem('materialGenerado');
  const textoAnterior = localStorage.getItem('textoGenerado');

  if (cache && textoAnterior === texto) {
    try { return JSON.parse(cache); } catch (e) { }
  }

  if (!GROQ_API_KEY || GROQ_API_KEY === 'AQUI_TU_CLAVE_DE_GROQ') {
    alert('⚠️ Falta la clave de Groq en api.js. Usando material de prueba.');
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
        model: 'openai/gpt-oss-20b', 
        messages: [{ role: 'user', content: PROMPT + texto }],
        temperature: 0.1, // Temperatura baja para que sea más estricto con el JSON
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      throw new Error('Error API Groq: ' + await res.text());
    }

    const data = await res.json();
    const contenido = data.choices[0].message.content;
    
    // Limpiamos el JSON por si la IA pone texto extra (como ```json)
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
    // Si falla, devolvemos material de prueba para que no se vea "Error de IA"
    alert('⚠️ La IA no devolvió el formato correcto, pero hemos cargado un material de prueba para que puedas seguir probando la app.');
    return demoMaterial();
  }
}

// Material de prueba bonito
function demoMaterial() {
  return {
    flashcards: [
      { pregunta: '¿Qué es la inflación?', respuesta: 'El aumento generalizado de los precios en una economía.' },
      { pregunta: '¿Qué es el PIB?', respuesta: 'Producto Interno Bruto, el valor de todos los bienes y servicios de un país.' },
      { pregunta: '¿Qué es un activo?', respuesta: 'Un recurso con valor económico que posee una persona o empresa.' },
      { pregunta: '¿Qué es un pasivo?', respuesta: 'Una deuda u obligación financiera.' }
    ],
    quiz: [
      {
        pregunta: '¿Qué mide la inflación?',
        opciones: ['El aumento de precios', 'El desempleo', 'Las exportaciones', 'La deuda pública'],
        correcta: 0,
        explicacion: 'La inflación mide la subida generalizada de los precios.'
      },
      {
        pregunta: '¿Qué es el PIB?',
        opciones: ['Una deuda', 'El valor de la producción de un país', 'Un impuesto', 'Un banco'],
        correcta: 1,
        explicacion: 'El PIB es el valor de todos los bienes y servicios finales producidos en un país.'
      }
    ],
    guia: "## Guía de Estudio de Finanzas Básicas\n\n- **Inflación:** Es el aumento generalizado de los precios. Hace que el dinero pierda valor con el tiempo.\n\n- **PIB:** Producto Interno Bruto. Es la suma de todo lo que produce un país en un año.\n\n- **Activos y Pasivos:** Un activo es lo que tienes (dinero, casas). Un pasivo es lo que debes (préstamos, tarjetas de crédito)."
  };
}
