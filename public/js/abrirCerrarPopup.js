function abrirCerrarPopup() {
    const botonPopup = document.getElementById("popupButton");
    const botonPopupOpenResponsive = document.getElementById("popupOpenResponsiveButton");
    const divPopup = document.getElementById("popupDiv");
    const body = document.body;

    if (!botonPopup || !divPopup) {
        console.error("No se encontraron los elementos con los IDs proporcionados.");
        return;
    }

    function popupAction() {
        if (divPopup.style.display === "flex") {
            divPopup.style.display = "none";
            body.style.overflow = "auto";
        } else {
            divPopup.style.display = "flex";

            body.style.overflow = "hidden";
        }
    }

    botonPopup.addEventListener("click", () => popupAction());
    botonPopupOpenResponsive.addEventListener("click", () => popupAction());
}

// Ejecuta la función después de que el DOM esté listo
document.addEventListener("DOMContentLoaded", abrirCerrarPopup);
