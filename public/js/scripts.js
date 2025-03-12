function generarBotonesDesdeJSON(data) {
    const container = document.getElementById('capitulos');

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

    data.forEach(objeto => {
        if (objeto.Nombre) {
            const button = document.createElement('button');
            button.textContent = objeto.Nombre;
            button.classList.add('chaptersButton');
            fragment.appendChild(button);
        }
    });

    container.appendChild(fragment);
}
