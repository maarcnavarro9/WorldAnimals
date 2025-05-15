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

    // Obtener la pista metadata
    const metadataTrack = Array.from(video.textTracks).find(track => track.kind === 'metadata');
    if (!metadataTrack) {
        console.error('Pista metadata no encontrada');
        return;
    }

    container.innerHTML = ''; // Limpiar antes de agregar nuevos botones
    const fragment = document.createDocumentFragment();

    data.forEach((objeto, index) => {
        if (objeto.Nombre) {
            const button = document.createElement('button');
            button.textContent = objeto.Nombre;
            button.classList.add('chaptersButton');

            // Obtener el cue de la pista metadata en la posición index
            const cue = metadataTrack.cues[index];
            if (cue) {
                const startTime = cue.startTime; // Obtener tiempo en segundos

                // Evento click para saltar al tiempo del capítulo
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
