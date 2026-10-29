let material = null;
let mazo = []; // Aquí guardaremos las tarjetas barajadas
let indiceActual = 0;
let mostrandoRespuesta = false;

// Estadísticas
let stats = { aprendiendo: 0, revisando: 0, dominado: 0 };

(async function init() {
  const texto = localStorage.getItem('material');
  if (!texto) {
    document.getElementById('loading').innerHTML = '<p class="text-sm text-[#8A8580]">No hay material. <a href="index.html" class="underline">Sube un archivo</a>.</p>';
    return;
  }

  try {
    const data = await generarMaterial(texto);
    material = data;
    
    // Mezclamos las flashcards
    mazo = [...material.flashcards].sort(() => Math.random() - 0.5);
    stats.aprendiendo = mazo.length;

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('mazoContainer').classList.remove('hidden');
    actualizarUI();
  } catch (e) {
    document.getElementById('loading').innerHTML = `<p class="text-sm text-red-600">Error: ${e.message}</p>`;
  }
})();

function actualizarStatsUI() {
  document.getElementById('stat-aprendiendo').textContent = stats.aprendiendo;
  document.getElementById('stat-revisando').textContent = stats.revisando;
  document.getElementById('stat-dominado').textContent = stats.dominado;
}

function actualizarUI() {
  if (indiceActual >= mazo.length) {
    // Terminamos el mazo
    document.getElementById('texto-pregunta').textContent = "¡Mazo terminado!";
    document.getElementById('texto-respuesta').textContent = "Has repasado todas las tarjetas.";
    document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
    return;
  }

  const tarjeta = mazo[indiceActual];
  document.getElementById('texto-pregunta').textContent = tarjeta.pregunta;
  document.getElementById('texto-respuesta').textContent = tarjeta.respuesta;
  
  // Reiniciar estado visual
  mostrandoRespuesta = false;
  document.getElementById('tarjeta').classList.remove('flipped');
  document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
  document.getElementById('instruccion').classList.remove('hidden');
  
  actualizarStatsUI();
}

function voltearTarjeta() {
  if (mostrandoRespuesta || indiceActual >= mazo.length) return;
  
  mostrandoRespuesta = true;
  document.getElementById('tarjeta').classList.add('flipped');
  
  // Mostrar botones de calificación
  setTimeout(() => {
    document.getElementById('botones-calificacion').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('instruccion').classList.add('hidden');
  }, 300);
}

function calificar(nivel) {
  // nivel: 0 = Difícil, 1 = Bien, 2 = Fácil
  
  // Actualizar estadísticas
  stats.aprendiendo--;
  if (nivel === 0) {
    stats.aprendiendo++;
    mazo.push(mazo[indiceActual]); // Lo volvemos a meter al final del mazo
  } else if (nivel === 1) {
    stats.revisando++;
  } else if (nivel === 2) {
    stats.dominado++;
  }

  // Pasar a la siguiente tarjeta
  indiceActual++;
  
  // Pequeño delay para que se vea la transición
  setTimeout(() => {
    actualizarUI();
  }, 300);
}
