function generarBotonesCapitulos(data) {
    const container = document.getElementById('capitulos');
    const video = document.getElementById('myVideo'); // Referencia al video

    if (!container) {
        console.error('No se encontró el contenedor con id="capitulos".');
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        console.warn("No hay datos válidos para generar botones.");
        return;
    }

    container.innerHTML = ''; // Limpiar antes de agregar nuevos botones
    const fragment = document.createDocumentFragment();

    data.forEach((objeto, index) => {
        if (objeto.Nombre) {
            const button = document.createElement('button');
            button.textContent = objeto.Nombre;
            button.classList.add('chaptersButton');

            // Obtener el tiempo de inicio del cue (índice = posición en la lista)
            const cue = document.getElementById('metaTrack').track.cues[index];
            if (cue) {
                const startTime = cue.startTime; // Obtener tiempo en segundos

                // Agregar evento de click para mover el video a ese tiempo
                button.addEventListener('click', () => {
                    video.currentTime = startTime - 0.001;
                    video.play();
                });
            }

            fragment.appendChild(button);
        }
    });

    container.appendChild(fragment);
}
