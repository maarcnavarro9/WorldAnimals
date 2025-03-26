function abrirCerrarPopup() {
    const botonPopup = document.getElementById("popupButton");
    const divPopup = document.getElementById("popupDiv");

    if (!botonPopup || !divPopup) {
        console.error("No se encontraron los elementos con los IDs proporcionados.");
        return;
    }

    botonPopup.addEventListener("click", () => {
        // Alterna entre mostrar y ocultar el popup
        if (divPopup.style.display === "flex") {
            divPopup.style.display = "none";
        } else {
            divPopup.style.display = "flex";
        }
    });
}

// Ejecuta la función después de que el DOM esté listo
document.addEventListener("DOMContentLoaded", abrirCerrarPopup);
