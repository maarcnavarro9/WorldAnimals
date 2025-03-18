document.addEventListener("DOMContentLoaded", () => {
  const qualitySelector = document.getElementById("qualitySelector");
  const videoElement = document.getElementById("myVideo");
  const sourceMp4 = document.getElementById("sourceMp4");
  const sourceWebm = document.getElementById("sourceWebm");
  const btnVideo1 = document.getElementById("btnVideo1");
  const btnVideo2 = document.getElementById("btnVideo2");

  // Variable global para almacenar la calidad seleccionada por el usuario
  let userQuality = null;

  // Función para determinar la calidad según el ancho de la pantalla (sólo si el usuario no ha elegido manualmente)
  function getAutoQuality() {
    if (window.matchMedia("(max-width: 799px)").matches) {
      return "720p";
    } else if (window.matchMedia("(min-width: 800px) and (max-width: 1199px)").matches) {
      return "1080p";
    }
    return "4K";
  }

  // Función principal que determina la calidad final a usar
  function updateQuality() {
    // Si el usuario ha seleccionado manualmente una calidad, la usamos
    let finalQuality = userQuality ? userQuality : getAutoQuality();

    // Ajustamos el valor del selector para reflejar la calidad en uso
    qualitySelector.value = finalQuality;
    // Cargamos el video en esa calidad
    updateVideoSources(finalQuality);
  }

  // Función para actualizar las fuentes del video en base a la calidad dada
  function updateVideoSources(quality) {
    const currentVideo = videoElement.getAttribute("data-video") || "WorldAnimalsV1";
    const currentTime = videoElement.currentTime; // Guardamos el tiempo actual de reproducción

    sourceMp4.src = `./assets/videos/${currentVideo}_${quality}.mp4`;
    sourceWebm.src = `./assets/videos/${currentVideo}_${quality}.webm`;

    videoElement.load();

    // Cuando se hayan cargado los datos, volvemos al tiempo de reproducción anterior
    videoElement.onloadeddata = () => {
      videoElement.currentTime = currentTime;
    };
  }

  // Al cambiar de video
  function setVideo(videoName) {
    videoElement.setAttribute("data-video", videoName);
    updateQuality(); // Al cambiar de video, actualizamos la calidad
  }

  // Listener para el cambio de calidad manual (usuario)
  qualitySelector.addEventListener("change", () => {
    // Guardamos la calidad seleccionada en la variable global
    userQuality = qualitySelector.value;
    // Actualizamos el video con esa calidad
    updateQuality();
  });

  // Listeners para cambiar de video
  btnVideo1.addEventListener("click", () => setVideo("WorldAnimalsV1"));
  btnVideo2.addEventListener("click", () => setVideo("WorldAnimalsV2"));

  // Al cargar la página, definimos la calidad de forma automática (si el usuario no ha seleccionado nada)
  updateQuality();
});