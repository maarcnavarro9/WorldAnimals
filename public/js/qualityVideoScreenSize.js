document.addEventListener("DOMContentLoaded", () => {
    const qualitySelector = document.getElementById("qualitySelector");
    const videoElement = document.getElementById("myVideo");
    const sourceMp4 = document.getElementById("sourceMp4");
    const sourceWebm = document.getElementById("sourceWebm");
    const btnVideo1 = document.getElementById("btnVideo1");
    const btnVideo2 = document.getElementById("btnVideo2");

    function updateQuality() {
        let quality = "4K";

        if (window.matchMedia("(max-width: 799px)").matches) {
            quality = "720p";
        } else if (window.matchMedia("(min-width: 800px) and (max-width: 1199px)").matches) {
            quality = "1080p";
        }

        qualitySelector.value = quality;

        // Obtener el video actual desde el atributo data-video
        const currentVideo = videoElement.getAttribute("data-video") || "WorldAnimalsV1";
        const currentTime = videoElement.currentTime; // Guardar el tiempo actual de reproducción

        // Actualizar las fuentes manteniendo el video actual
        sourceMp4.src = `./assets/videos/${currentVideo}_${quality}.mp4`;
        sourceWebm.src = `./assets/videos/${currentVideo}_${quality}.webm`;

        videoElement.load();

        // Volver al mismo tiempo de reproducción
        videoElement.onloadeddata = () => {
            videoElement.currentTime = currentTime;
        };
    }

    function setVideo(videoName) {
        videoElement.setAttribute("data-video", videoName);
        updateQuality(); // Cambia la calidad sin perder el video actual
    }

    // Listeners para cambiar de video
    btnVideo1.addEventListener("click", () => setVideo("WorldAnimalsV1"));
    btnVideo2.addEventListener("click", () => setVideo("WorldAnimalsV2"));

    updateQuality();

    window.matchMedia("(max-width: 799px)").addEventListener("change", updateQuality);
    window.matchMedia("(min-width: 800px) and (max-width: 1199px)").addEventListener("change", updateQuality);
    window.matchMedia("(min-width: 1200px)").addEventListener("change", updateQuality);
});
