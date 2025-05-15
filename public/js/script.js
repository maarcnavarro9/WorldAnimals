document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('myVideo');
  const qualitySelector = document.getElementById('qualitySelector');
  const playerSelector = document.getElementById('playerSelector');
  const btnVideo1 = document.getElementById('btnVideo1');
  const btnVideo2 = document.getElementById('btnVideo2');

  const descTrackEn = document.getElementById('descTrackEn');
  const descTrackEs = document.getElementById('descTrackEs');
  const descTrackCa = document.getElementById('descTrackCa');
  const metaTrackElement = document.getElementById('metaTrack');

  let dashPlayer = null;
  let hlsPlayer = null;
  let currentPlayer = 'DASH';
  let currentVideo = 'video1';

  const videoSources = {
    video1: {
      '4K': {
        dash: { manifest: './assets/videos/1/manifest.mpd' },
        hls: { manifest: './assets/videos/1/manifest.m3u8' },
        subtitles: {
          en: './media/descriptionsV1_En.vtt',
          es: './media/descriptionsV1_Es.vtt',
          ca: './media/descriptionsV1_Ca.vtt',
        },
        metadata: './media/metadataV1.vtt',
      },
      '1080p': {
        dash: { manifest: './assets/videos/1/manifest.mpd' },
        hls: { manifest: './assets/videos/1/manifest.m3u8' },
        subtitles: {
          en: './media/descriptionsV1_En.vtt',
          es: './media/descriptionsV1_Es.vtt',
          ca: './media/descriptionsV1_Ca.vtt',
        },
        metadata: './media/metadataV1.vtt',
      },
      // Añade más calidades aquí
    },
    video2: {
      '4K': {
        dash: { manifest: './assets/videos/2/manifest.mpd' },
        hls: { manifest: './assets/videos/2/manifest.m3u8' },
        subtitles: {
          en: './media/descriptionsV2_En.vtt',
          es: './media/descriptionsV2_Es.vtt',
          ca: './media/descriptionsV2_Ca.vtt',
        },
        metadata: './media/metadataV2.vtt',
      },
      '1080p': {
        dash: { manifest: './assets/videos/2/manifest_1080p.mpd' },
        hls: { manifest: './assets/videos/2/manifest.m3u8' },
        subtitles: {
          en: './media/descriptionsV2_En.vtt',
          es: './media/descriptionsV2_Es.vtt',
          ca: './media/descriptionsV2_Ca.vtt',
        },
        metadata: './media/metadataV2.vtt',
      },
      // Añade más calidades aquí
    },
  };

  // Desactiva todas las pistas
  function clearTracks() {
    [descTrackEn, descTrackEs, descTrackCa, metaTrackElement].forEach(track => {
      if (track.track) track.track.mode = 'disabled';
    });
  }

  // Actualiza las pistas de subtítulos y metadatos
  function updateTracks(subtitles, metadataUrl) {
    descTrackEn.src = subtitles.en;
    descTrackEs.src = subtitles.es;
    descTrackCa.src = subtitles.ca;
    metaTrackElement.src = metadataUrl;

    // Activa sólo el track inglés y metadatos ocultos
    descTrackEn.track.mode = 'disabled';
    descTrackEs.track.mode = 'disabled';
    descTrackCa.track.mode = 'disabled';
    metaTrackElement.track.mode = 'hidden';
  }

  // Inicializa reproductor DASH
  function initDash(manifestUrl) {
    if (hlsPlayer) {
      hlsPlayer.destroy();
      hlsPlayer = null;
    }
    if (dashPlayer) {
      dashPlayer.reset();
    } else {
      dashPlayer = dashjs.MediaPlayer().create();
    }
    dashPlayer.initialize(video, manifestUrl, true);
    currentPlayer = 'DASH';
    video.muted = true;
  }

  // Inicializa reproductor HLS
  function initHls(manifestUrl) {
    if (dashPlayer) {
      dashPlayer.reset();
      dashPlayer = null;
    }
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
    if (Hls.isSupported()) {
      hlsPlayer = new Hls();
      hlsPlayer.loadSource(manifestUrl);
      hlsPlayer.attachMedia(video);
      currentPlayer = 'HLS';
      video.muted = true;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
    } else {
      alert('HLS no soportado en este navegador');
    }
  }

  // Obtiene todas las cues del track de metadatos
  function obtenerTodasLasCues() {
    const cues = [];
    const metaTrack = metaTrackElement.track;
    if (metaTrack && metaTrack.cues) {
      for (let i = 0; i < metaTrack.cues.length; i++) {
        try {
          const metadata = JSON.parse(metaTrack.cues[i].text);
          cues.push(metadata);
        } catch (e) {
          console.error('Error parseando cue metadata', e);
        }
      }
    }
    return cues;
  }

  // Función para cargar video según configuración actual
  function loadVideo() {
    const quality = qualitySelector.value;
    const sources = videoSources[currentVideo][quality];
    if (!sources) {
      console.error('No se encontraron fuentes para', currentVideo, quality);
      return;
    }

    clearTracks();
    updateTracks(sources.subtitles, sources.metadata);

    // Listener para generar capítulos tras carga metadatos, se elimina al ejecutarse
    function onMetaTrackLoad() {
      generarBotonesCapitulos(obtenerTodasLasCues());
      metaTrackElement.removeEventListener('load', onMetaTrackLoad);
    }
    metaTrackElement.addEventListener('load', onMetaTrackLoad);

    if (currentPlayer === 'DASH') {
      initDash(sources.dash.manifest);
    } else {
      initHls(sources.hls.manifest);
    }
  }

  // Listeners para UI
  qualitySelector.addEventListener('change', loadVideo);
  playerSelector.addEventListener('change', () => {
    currentPlayer = playerSelector.value;
    loadVideo();
  });
  btnVideo1.addEventListener('click', () => {
    currentVideo = 'video1';
    loadVideo();
  });
  btnVideo2.addEventListener('click', () => {
    currentVideo = 'video2';
    loadVideo();
  });

  // Inicializar reproductor y video al cargar
  loadVideo();

  // Listener para actualizar UI con metadatos activos
  metaTrackElement.track.mode = 'hidden';
  metaTrackElement.addEventListener('load', () => {
    generarBotonesCapitulos(obtenerTodasLasCues());
  });

  metaTrackElement.track.addEventListener('cuechange', () => {
    const activeCues = metaTrackElement.track.activeCues;
    if (activeCues.length > 0) {
      try {
        const metadata = JSON.parse(activeCues[0].text);
        fotoAnimal.src = metadata.link_imagen || './assets/img/portfolio/safe.png';
        document.getElementById('nombre').textContent = metadata.Nombre || 'Nombre';
        document.getElementById('especie').textContent = metadata.Especie || 'Especie';
        document.getElementById('descripcion').textContent = metadata.Descripcion || 'Descripción no disponible...';
        if (metadata.coordenadas_geográficas) {
          const lat = parseFloat(metadata.coordenadas_geográficas.latitud);
          const lng = parseFloat(metadata.coordenadas_geográficas.longitud);
          if (!isNaN(lat) && !isNaN(lng)) {
            mapa.setCenter({ lat, lng });
            marcador.setPosition({ lat, lng });
          }
        }
      } catch (e) {
        console.error('Error parseando metadata activo:', e);
      }
    }
  });
});
