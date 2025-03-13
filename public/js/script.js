document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('myVideo');
    const qualitySelector = document.getElementById('qualitySelector');
    const btnVideo1 = document.getElementById('btnVideo1');
    const btnVideo2 = document.getElementById('btnVideo2');
    const sourceMp4 = document.getElementById('sourceMp4');
    const sourceWebm = document.getElementById('sourceWebm');
    const descTrackEn = document.getElementById('descTrackEn');
    const descTrackEs = document.getElementById('descTrackEs');
    const descTrackCa = document.getElementById('descTrackCa');
    const metaTrackElement = document.getElementById('metaTrack');

    // Se define un objeto que contiene las rutas de ambos videos en cada calidad.
    const videoSources = {
        "video1": {
            "4K": {
                mp4: "./assets/videos/WorldAnimalsV1_4k.mp4",
                webm: "./assets/videos/WorldAnimalsV1_4K.webm",
                subtitles: {
                    en: "./media/descriptionsV1_En.vtt",
                    es: "./media/descriptionsV1_Es.vtt",
                    ca: "./media/descriptionsV1_Ca.vtt",
                },
                metadata: "./media/metadataV1.vtt"
            },
            "FullHD": {
                mp4: "./assets/videos/WorldAnimalsV1_1080p.mp4",
                webm: "./assets/videos/WorldAnimalsV1_1080p.webm",
                subtitles: {
                    en: "./media/descriptionsV1_En.vtt",
                    es: "./media/descriptionsV1_Es.vtt",
                    ca: "./media/descriptionsV1_Ca.vtt",
                },
                metadata: "./media/metadataV1.vtt"
            },
            "720p": {
                mp4: "./assets/videos/WorldAnimalsV1_720p.mp4",
                webm: "./assets/videos/WorldAnimalsV1_720p.webm",
                subtitles: {
                    en: "./media/descriptionsV1_En.vtt",
                    es: "./media/descriptionsV1_Es.vtt",
                    ca: "./media/descriptionsV1_Ca.vtt",
                },
                metadata: "./media/metadataV1.vtt"
            }
        },
        "video2": {
            "4K": {
                mp4: "./assets/videos/WorldAnimalsV2_4K.mp4",
                webm: "./assets/videos/WorldAnimalsV2_4K.webm",
                subtitles: {
                    en: "./media/descriptionsV2_En.vtt",
                    es: "./media/descriptionsV2_Es.vtt",
                    ca: "./media/descriptionsV2_Ca.vtt",
                },
                metadata: "./media/metadataV2.vtt"
            },
            "FullHD": {
                mp4: "./assets/videos/WorldAnimalsV2_1080p.mp4",
                webm: "./assets/videos/WorldAnimalsV2_1080p.webm",
                subtitles: {
                    en: "./media/descriptionsV2_En.vtt",
                    es: "./media/descriptionsV2_Es.vtt",
                    ca: "./media/descriptionsV2_Ca.vtt",
                },
                metadata: "./media/metadataV2.vtt"
            },
            "720p": {
                mp4: "./assets/videos/WorldAnimalsV2_720p.mp4",
                webm: "./assets/videos/WorldAnimalsV2_720p.webm",
                subtitles: {
                    en: "./media/descriptionsV2_En.vtt",
                    es: "./media/descriptionsV2_Es.vtt",
                    ca: "./media/descriptionsV2_Ca.vtt",
                },
                metadata: "./media/metadataV2.vtt"
            }
        }
    };

    // Variable que almacena cuál video está activo. Por defecto, video1.
    let currentVideo = "video1";

    // Función para actualizar el video según el video actual y la calidad seleccionada.
    function updateVideo() {
        const quality = qualitySelector.value;
        const sources = videoSources[currentVideo][quality];
        if (sources) {
            sourceMp4.src = sources.mp4;
            sourceWebm.src = sources.webm;
            descTrackEn.src = sources.subtitles.en;
            descTrackEs.src = sources.subtitles.es;
            descTrackCa.src = sources.subtitles.ca;
            metaTrackElement.src = sources.metadata;
            video.load();
            video.play();
        }
    }

    // Cambia la calidad del video al seleccionar una opción
    qualitySelector.addEventListener('change', updateVideo);

    // Botón para seleccionar Video 1
    btnVideo1.addEventListener('click', () => {
        currentVideo = "video1";
        updateVideo();
    });

    // Botón para seleccionar Video 2
    btnVideo2.addEventListener('click', () => {
        currentVideo = "video2";
        updateVideo();
    });

    // Aseguramos que se muestren los subtítulos y se active el track de metadatos
    descTrackEn.track.mode = "disabled";
    descTrackEs.track.mode = "disabled";
    descTrackCa.track.mode = "disabled";

    const metaTrack = metaTrackElement.track;
    metaTrack.mode = "hidden";

    function obtenerTodasLasCues() {
        const cues = [];
        if (metaTrack && metaTrack.cues) {
            // Accedemos a todas las cues de la pista
            for (let i = 0; i < metaTrack.cues.length; i++) {
                const cue = metaTrack.cues[i];
                try {
                    // Almacenamos la cue en el array de cues
                    const metadata = JSON.parse(cue.text); // Asumimos que el contenido de la cue es JSON
                    cues.push(metadata); // Guardamos la metadata de cada cue
                } catch (e) {
                    console.error('Error al parsear la metadata de la cue', e);
                }
            }
        }
        return cues;
    }

    metaTrackElement.addEventListener('load', () => {
        const todasLasCues = obtenerTodasLasCues();
        console.log(todasLasCues); // Muestra todas las cues en la consola
        // Puedes hacer algo con todas las cues, como generar botones
        generarBotonesCapitulos(todasLasCues);
    });

    // Evento para procesar metadatos y actualizar información en pantalla
    metaTrack.addEventListener('cuechange', () => {
        const activeCues = metaTrack.activeCues;
        if (activeCues.length > 0) {
            try {
                const metadata = JSON.parse(activeCues[0].text);

                fotoAnimal.src = metadata.link_imagen || "./assets/img/portfolio/safe.png";

                // Actualizamos texto
                document.getElementById('nombre').textContent = metadata.Nombre || "Nombre";
                document.getElementById('especie').textContent = metadata.Especie || "Especie";
                document.getElementById('descripcion').textContent = metadata.Descripcion || "Descripción no disponible...";

                // CAMBIO IMPORTANTE AQUÍ:
                // Si en el metadata vienen coordenadas, las usamos para actualizar el mapa y el marcador
                if (metadata.coordenadas_geográficas) {
                    const lat = parseFloat(metadata.coordenadas_geográficas.latitud);
                    const lng = parseFloat(metadata.coordenadas_geográficas.longitud);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        mapa.setCenter({ lat, lng });
                        marcador.setPosition({ lat, lng });
                    }
                }
            } catch (e) {
                console.error("Error al parsear metadata:", e);
            }
        }
    });
});