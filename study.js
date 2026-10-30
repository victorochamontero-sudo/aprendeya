function iniciarJuegoApilador() {
  if (!material || !material.flashcards || material.flashcards.length === 0) {
    alert("Necesitas tarjetas para jugar.");
    return;
  }

  document.getElementById('menuJuegos').classList.add('hidden');
  document.querySelector('#juegosContainer h2').classList.add('hidden');
  
  // Mostramos la caja del apilador
  document.getElementById('juegoApilador').classList.remove('hidden');
  document.getElementById('juegoApilador').classList.add('flex');
  
  // Mostramos instrucciones y ocultamos el juego
  document.getElementById('instruccionesApilador').classList.remove('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('flex');
}

function comenzarApilador() {
  document.getElementById('instruccionesApilador').classList.add('hidden');
  document.getElementById('juegoApiladorActivo').classList.remove('hidden');
  document.getElementById('juegoApiladorActivo').classList.add('flex');

  preguntasApilador = [...material.flashcards].sort(() => Math.random() - 0.5);
  indicePreguntaApilador = 0;
  torreAltura = 0;
  torreFallos = 0;

  document.getElementById('alturaTorre').textContent = 0;
  document.getElementById('fallosTorre').textContent = 0;
  document.getElementById('torreContainer').innerHTML = '';

  cargarPreguntaApilador();
}
