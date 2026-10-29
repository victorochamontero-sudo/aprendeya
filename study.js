let material = null;
let mazo = [];
let indiceActual = 0;
let mostrandoRespuesta = false;
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
    document.getElementById('texto-pregunta').textContent = "¡Mazo terminado!";
    document.getElementById('texto-respuesta').textContent = "Has repasado todas las tarjetas.";
    document.getElementById('botones-calificacion').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('instruccion').classList.add('hidden');
    return;
  }

  const tarjeta = mazo[indiceActual];
  document.getElementById('texto-pregunta').textContent = tarjeta.pregunta;
  document.getElementById('texto-respuesta').textContent = tarjeta.respuesta;
  
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
  
  setTimeout(() => {
    document.getElementById('botones-calificacion').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('instruccion').classList.add('hidden');
  }, 300);
}

function calificar(nivel) {
  stats.aprendiendo--;
  if (nivel === 0) {
    stats.aprendiendo++;
    mazo.push(mazo[indiceActual]);
  } else if (nivel === 1) {
    stats.revisando++;
  } else if (nivel === 2) {
    stats.dominado++;
  }

  indiceActual++;
  setTimeout(() => { actualizarUI(); }, 300);
}

function cambiarTab(tab) {
  const activo = 'px-4 py-1.5 rounded-full text-sm font-semibold bg-[#1A1A1A] text-white';
  const inactivo = 'px-4 py-1.5 rounded-full text-sm font-semibold border border-[#D6D1CA] hover:bg-gray-50';
  
  document.getElementById('tab-lista').className = tab === 'lista' ? activo : inactivo;
  document.getElementById('tab-mazo').className = tab === 'mazo' ? activo : inactivo;
  document.getElementById('tab-juegos').className = tab === 'juegos' ? activo : inactivo;

  if (tab === 'mazo') {
    document.getElementById('mazoContainer').classList.remove('hidden');
    document.getElementById('listaContainer').classList.add('hidden');
  } else if (tab === 'lista') {
    document.getElementById('mazoContainer').classList.add('hidden');
    document.getElementById('listaContainer').classList.remove('hidden');
    
    const cont = document.getElementById('listaTarjetas');
    cont.innerHTML = material.flashcards.map(f => `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-[#E5E1DA]">
        <p class="font-bold text-[#1A1A1A] mb-2">${f.pregunta}</p>
        <p class="text-sm text-[#5A5550]">${f.respuesta}</p>
      </div>
    `).join('');
  } else {
    alert("¡Los juegos están en mantenimiento! 🚧 Vuelve pronto.");
  }
}
