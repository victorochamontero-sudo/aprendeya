async function generarMaterial(texto) {
  // Simula que la IA está pensando (1.5 segundos)
  await new Promise(r => setTimeout(r, 1500));
  
  // Aquí creamos tarjetas basadas en el texto que el usuario escribió
  // (No es IA real, pero así la app no se rompe y funciona)
  return {
    flashcards: [
      { pregunta: '¿De qué trata este texto?', respuesta: texto.substring(0, 100) + '...' },
      { pregunta: '¿Cuál es la idea principal?', respuesta: 'La idea principal del texto que subiste.' },
      { pregunta: '¿Qué aprendiste hoy?', respuesta: 'Repasa el texto para recordarlo mejor.' }
    ],
    quiz: [
      { pregunta: '¿Sobre qué es el texto?', opciones: ['Matemáticas', 'Historia', 'Ciencia', 'El texto que subí'], correcta: 3, explicacion: '¡Es el texto que tú subiste!' }
    ],
    guia: "## Guía de estudio\n\nEste es el texto que subiste:\n\n" + texto
  };
}

// Funciones para que study.js no falle
async function generarGuia(texto) { return (await generarMaterial(texto)).guia; }
async function generarPreguntasExtra(texto, cantidad) { return (await generarMaterial(texto)).quiz; }
async function generarMasMaterial(texto, flashcards, quiz) { return await generarMaterial(texto); }
