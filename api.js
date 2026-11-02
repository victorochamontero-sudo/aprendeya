const PROMPT = "Eres un experto en ciencias cognitivas del aprendizaje. A partir del texto, genera material de estudio en ESPAÑOL. Devuelve SOLO un JSON válido con esta estructura: { \"flashcards\": [{\"pregunta\": \"...\", \"respuesta\": \"...\"}], \"quiz\": [{\"pregunta\": \"...\", \"opciones\": [\"A\", \"B\", \"C\", \"D\"], \"correcta\": 0, \"explicacion\": \"...\"}], \"guia\": \"Guía de estudio completa\" }. Reglas: 8 flashcards y 5 preguntas de quiz. TEXTO: ";

async function generarMaterial(texto) {
  let MI_CLAVE_SECRETA = localStorage.getItem('MI_CLAVE_SECRETA') || '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';
  if (typeof MI_CLAVE_SECRETA === 'undefined' || !MI_CLAVE_SECRETA) {
    alert('⚠️ Error: No se encontró tu clave. Revisa config.js');
    throw new Error('Falta la clave');
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + MI_CLAVE_SECRETA
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [{ role: 'user', content: PROMPT + texto }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      const errorTexto = await res.text();
      alert('❌ Error de OpenRouter: ' + errorTexto);
      throw new Error(errorTexto);
    }
    
    const data = await res.json();
    let contenido = data.choices[0].message.content.trim();
    
    const primerLlave = contenido.indexOf('{');
    const ultimaLlave = contenido.lastIndexOf('}');
    if (primerLlave !== -1 && ultimaLlave !== -1) {
      contenido = contenido.substring(primerLlave, ultimaLlave + 1);
    }
    
    return JSON.parse(contenido);
    
  } catch (error) {
    console.error("Error generando material:", error);
    throw error; 
  }
}

async function generarGuia(texto) {
  const material = await generarMaterial(texto);
  return material.guia;
}

async function generarPreguntasExtra(texto, cantidad) {
  const material = await generarMaterial(texto);
  return material.quiz.slice(0, cantidad);
}

async function generarMasMaterial(texto, flashcardsActuales, quizActual) {
  const material = await generarMaterial(texto);
  return { flashcards: material.flashcards, quiz: material.quiz };
}
