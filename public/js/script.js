let dashPlayer = null;
let hlsPlayer = null;
let currentVideo = "1";

document.getElementById("playerSelector")
    .addEventListener("change", () => initPlayer());
document.getElementById("btnVideo1")
    .addEventListener("click", () => { currentVideo = "1"; initPlayer(); });
document.getElementById("btnVideo2")
    .addEventListener("click", () => { currentVideo = "2"; initPlayer(); });

function clearTracks(video) {
    video.querySelectorAll("track").forEach(t => t.remove());
}

function addTracks(video, videoNum) {
    // igual que antes: crea tres pistas de subtítulos y una de metadata
    const langs = [
        { code: 'En', label: 'English', srclang: 'en' },
        { code: 'Es', label: 'Spanish', srclang: 'es' },
        { code: 'Ca', label: 'Catalan', srclang: 'ca' }
    ];
    langs.forEach((lang, i) => {
        const tr = document.createElement("track");
        tr.kind = "subtitles";
        tr.label = lang.label;
        tr.srclang = lang.srclang;
        tr.src = `./media/descriptionsV${videoNum}_${lang.code}.vtt`;
        if (i === 0) tr.default = true;
        video.appendChild(tr);
    });
    const meta = document.createElement("track");
    meta.kind = "metadata";
    meta.label = "Metadata";
    meta.src = `./media/metadataV${videoNum}.vtt`;
    video.appendChild(meta);
}

function initPlayer() {
    const type = document.getElementById("playerSelector").value; // DASH o HLS
    const video = document.getElementById("myVideo");
    clearTracks(video);

    // destruye instancias previas
    if (dashPlayer) { dashPlayer.reset(); dashPlayer = null; }
    if (hlsPlayer) { hlsPlayer.destroy(); hlsPlayer = null; }

    const blockchainURL = currentVideo == 1 ? "https://media.thetavideoapi.com/org_0dw11am36pv5x68scfkm93r7i4tf/srvacc_0dbmv8c5m1k237dgvq6ijpvp1/video_pgwzbj7iiw72e9jg8mpvsgs49x/master.m3u8"
        : "https://media.thetavideoapi.com/org_0dw11am36pv5x68scfkm93r7i4tf/srvacc_0dbmv8c5m1k237dgvq6ijpvp1/video_dxdd6prg3274ip9uwtpv0t2umh/master.m3u8";

    const url = type === "DASH"
        ? `./assets/videos/${currentVideo}/manifest.mpd`
        : type === "HLS" ? `./assets/videos/${currentVideo}/manifest.m3u8`
            : blockchainURL;

    // const url = "";

    // if (type === "DASH") {
    //     url = `./assets/videos/${currentVideo}/manifest.mpd`;
    // } else if (type = "HLS") {
    //     url = `./assets/videos/${currentVideo}/manifest.m3u8`;
    // } else {
    //     url = "https://media.thetavideoapi.com/org_0dw11am36pv5x68scfkm93r7i4tf/srvacc_0dbmv8c5m1k237dgvq6ijpvp1/video_dxdd6prg3274ip9uwtpv0t2umh/master.m3u8";
    // }

    if (type === "DASH") {
        dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(video, url, true);

        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            setupTracksAndChapters(video, currentVideo);
        });

        dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, () => {
            setTimeout(() => {
                populateDashQualities();
            }, 300);
        });
    } else {
        if (Hls.isSupported()) {
            hlsPlayer = new Hls();
            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                setupTracksAndChapters(video, currentVideo);
                populateHlsQualities();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                setupTracksAndChapters(video, currentVideo);
                populateHlsQualities();
                video.play();
            });
        }
    }
}

function setupTracksAndChapters(video, videoNum) {
    // 1) Añadimos pistas
    addTracks(video, videoNum);
    console.log('➤ Tracks añadidos para vídeo', videoNum);

    // 2) Recorremos textTracks para verlos por consola y configurar modos
    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        console.log(`  Track[${i}]: kind=${t.kind} label=${t.label} mode=${t.mode}`);
        if (t.kind === 'subtitles') {
            t.mode = 'disabled';
        }
        if (t.kind === 'metadata') {
            // obligatorio ponerlo a hidden antes de que empiecen a saltar cues
            t.mode = 'hidden';
            console.log('    → Metadata track encontrada, cues totales:', t.cues.length);

            // 3) Listener cuechange
            t.addEventListener('cuechange', () => {
                console.log('    ✶ cuechange disparado, activeCues=', t.activeCues.length);
                if (t.activeCues.length > 0) {
                    const text = t.activeCues[0].text;
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error('      ¡JSON inválido en cue!', text);
                        return;
                    }
                    // Actualiza tu UI
                    console.log('      → Metadata:', data);
                    document.getElementById('fotoAnimal').src = data.link_imagen;
                    document.getElementById('nombre').textContent = data.Nombre;
                    document.getElementById('especie').textContent = data.Especie;
                    document.getElementById('descripcion').textContent = data.Descripcion;
                    if (data.coordenadas_geográficas) {
                        const lat = +data.coordenadas_geográficas.latitud;
                        const lng = +data.coordenadas_geográficas.longitud;
                        console.log(`      → Centrar mapa en ${lat},${lng}`);
                        mapa.setCenter({ lat, lng });
                        marcador.setPosition({ lat, lng });
                    }
                    // Generar capítulos
                    const allMetadata = Array.from(t.cues).map(c => {
                        try { return JSON.parse(c.text); }
                        catch { return null; }
                    }).filter(x => x);
                    console.log('      → Generando botones para', allMetadata.length, 'capítulos');
                    generarBotonesCapitulos(allMetadata);
                }
            });
        }
    }
}

function generarBotonesCapitulos(data) {
    const container = document.getElementById('capitulos');
    container.innerHTML = '';
    data.forEach((item, i) => {
        const b = document.createElement('button');
        b.textContent = item.Nombre;
        b.onclick = () => {
            const video = document.getElementById('myVideo');
            const metadataTrack = Array.from(video.textTracks).find(track => track.kind === 'metadata');
            if (!metadataTrack) {
                console.error('Pista metadata no encontrada');
                return;
            }
            const cue = metadataTrack.cues[i];
            if (cue) {
                video.currentTime = cue.startTime - 0.001;
                video.play();
            }
        };
        container.appendChild(b);
    });
}


// 1) Funciones para rellenar calidades
function populateDashQualities() {
    const sel = document.getElementById('qualitySelector');
    sel.querySelectorAll('option:not([value="-1"])').forEach(o => o.remove());
    dashPlayer.getRepresentationsByType('video').forEach((b, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.text = `${b.height}p — ${(b.bandwidth / 1000).toFixed(0)} kbps`;
        sel.appendChild(o);
    });
}

function populateHlsQualities() {
    const sel = document.getElementById('qualitySelector');
    sel.querySelectorAll('option:not([value="-1"])').forEach(o => o.remove());
    hlsPlayer.levels.forEach((lvl, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.text = `${lvl.height}p — ${(lvl.bitrate / 1000).toFixed(0)} kbps`;
        sel.appendChild(o);
    });
}

// 2) Función para cambiar calidad
function changeQuality() {
    const idx = parseInt(document.getElementById('qualitySelector').value, 10);
    if (dashPlayer) {
        dashPlayer.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: idx === -1 } } } });
        if (idx !== -1) dashPlayer.setQualityFor('video', idx);
    }
    if (hlsPlayer) {
        hlsPlayer.currentLevel = idx;
    }
}

// 3) Listener en el selector
document.getElementById('qualitySelector')
    .addEventListener('change', changeQuality);

// arranca la primera vez
document.addEventListener('DOMContentLoaded', () => initPlayer());
