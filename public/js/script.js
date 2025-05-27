let dashPlayer = null;
let hlsPlayer = null;
let currentVideo = "1";

document.getElementById("playerSelector")
    .addEventListener("change", () => initPlayer());
document.getElementById("btnVideo1")
    .addEventListener("click", () => { currentVideo = "1"; initPlayer(true); });
document.getElementById("btnVideo2")
    .addEventListener("click", () => { currentVideo = "2"; initPlayer(true); });

function clearTracks(video) {
    video.querySelectorAll("track").forEach(t => t.remove());
}

function addTracks(video, videoNum) {
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

function initPlayer(forceRestart = false) {
    const type = document.getElementById("playerSelector").value;
    const video = document.getElementById("myVideo");
    // Si se fuerza reinicio, empieza desde 0; si no, conserva el tiempo
    const lastTime = forceRestart ? 0 : (video.currentTime || 0);

    clearTracks(video);

    if (dashPlayer) { dashPlayer.reset(); dashPlayer = null; }
    if (hlsPlayer) { hlsPlayer.destroy(); hlsPlayer = null; }

    const blockchainURL = currentVideo === "1"
        ? "https://media.thetavideoapi.com/org_0dw11am36pv5x68scfkm93r7i4tf/srvacc_0dbmv8c5m1k237dgvq6ijpvp1/video_pgwzbj7iiw72e9jg8mpvsgs49x/master.m3u8"
        : "https://media.thetavideoapi.com/org_0dw11am36pv5x68scfkm93r7i4tf/srvacc_0dbmv8c5m1k237dgvq6ijpvp1/video_dxdd6prg3274ip9uwtpv0t2umh/master.m3u8";

    const url = type === "DASH"
        ? `./assets/videos/${currentVideo}/manifest.mpd`
        : type === "HLS" ? `./assets/videos/${currentVideo}/manifest.m3u8`
            : blockchainURL;

    function restoreTime() {
        // Solo si el vídeo está cargado y el tiempo es válido
        if (lastTime > 0 && !isNaN(lastTime)) {
            video.currentTime = lastTime;
        }
    }

    if (type === "DASH") {
        dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(video, url, true);

        dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            setupTracksAndChapters(video, currentVideo);
            restoreTime();
        });

        dashPlayer.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, () => {
            setTimeout(() => {
                populateDashQualities();
                populateDashAudioQualities();
            }, 300);
        });
    } else if (type === "HLS") {
        if (Hls.isSupported()) {
            hlsPlayer = new Hls();
            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                setupTracksAndChapters(video, currentVideo);
                populateHlsQualities();
                restoreTime();
            });
            hlsPlayer.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                populateHlsAudioQualities();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                setupTracksAndChapters(video, currentVideo);
                populateHlsQualities();
                populateHlsAudioQualities();
                restoreTime();
                video.play();
            });
        }
    } else {
        // Blockchain case - siempre usar hls.js si está soportado
        if (Hls.isSupported()) {
            hlsPlayer = new Hls();
            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                setupTracksAndChapters(video, currentVideo);
                populateAudioForBlockchain();
                restoreTime();
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // fallback Safari / iOS
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                setupTracksAndChapters(video, currentVideo);
                populateAudioForBlockchain();
                restoreTime();
                video.play();
            });
        } else {
            // no soporte HLS
            console.error('HLS no soportado en este navegador');
        }
    }
}

function setupTracksAndChapters(video, videoNum) {
    addTracks(video, videoNum);
    console.log('➤ Tracks añadidos para vídeo', videoNum);

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        console.log(`  Track[${i}]: kind=${t.kind} label=${t.label} mode=${t.mode}`);
        if (t.kind === 'subtitles') {
            t.mode = 'disabled';
        }
        if (t.kind === 'metadata') {
            t.mode = 'hidden';
            console.log('    → Metadata track encontrada, cues totales:', t.cues.length);

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

// Video quality functions
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

// Audio quality functions
function populateDashAudioQualities() {
    const sel = document.getElementById('audioSelector');
    sel.querySelectorAll('option:not([value="-1"])').forEach(o => o.remove());
    dashPlayer.getRepresentationsByType('audio').forEach((b, i) => {
        const o = document.createElement('option');
        o.value = i;
        // Solo mostrar Hz si está definido
        o.text = b.audioSamplingRate
            ? `${b.audioSamplingRate} Hz — ${(b.bandwidth / 1000).toFixed(0)} kbps`
            : `${(b.bandwidth / 1000).toFixed(0)} kbps`;
        sel.appendChild(o);
    });
}

function populateHlsAudioQualities() {
    const sel = document.getElementById('audioSelector');
    sel.querySelectorAll('option:not([value="-1"])').forEach(o => o.remove());
    hlsPlayer.audioTracks.forEach((track, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.text = track.name || `Audio Track ${i + 1}`;
        sel.appendChild(o);
    });
}

function populateAudioForBlockchain() {
    const sel = document.getElementById('audioSelector');
    sel.querySelectorAll('option:not([value="-1"])').forEach(o => o.remove());
    const o = document.createElement('option');
    o.value = -2; // valor especial para OFF
    o.text = 'OFF';
    sel.appendChild(o);
    sel.value = -2;
}

// Change quality handlers
function changeQuality() {
    const idx = parseInt(document.getElementById('qualitySelector').value, 10);
    if (dashPlayer) {
        dashPlayer.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: idx === -1 } } } });
        if (idx !== -1) {
            dashPlayer.setRepresentationForTypeByIndex('video', idx);
        }
    }
    if (hlsPlayer) {
        hlsPlayer.currentLevel = idx;
    }
}

function changeAudioQuality() {
    const idx = parseInt(document.getElementById('audioSelector').value, 10);
    if (dashPlayer) {
        dashPlayer.updateSettings({ streaming: { abr: { autoSwitchBitrate: { audio: idx === -1 } } } });
        if (idx !== -1) {
            dashPlayer.setRepresentationForTypeByIndex('audio', idx);
        }
        // Mostrar info de la pista seleccionada
        const reps = dashPlayer.getRepresentationsByType('audio');
        console.log('DASH audio seleccionado:', idx, reps[idx]);
    }
    if (hlsPlayer) {
        hlsPlayer.audioTrack = idx;
        // Mostrar info de la pista seleccionada
        const tracks = hlsPlayer.audioTracks;
        console.log('HLS audio seleccionado:', idx, tracks && tracks[idx]);
    }
}

document.getElementById('qualitySelector')
    .addEventListener('change', changeQuality);
document.getElementById('audioSelector')
    .addEventListener('change', changeAudioQuality);

document.addEventListener('DOMContentLoaded', () => initPlayer());
