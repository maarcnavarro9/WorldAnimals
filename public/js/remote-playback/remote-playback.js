const socket = io();

const qualitySelector = document.getElementById('qualitySelector');
const muteSVG = document.getElementById('muteSVG');
const unmuteSVG = document.getElementById('unmuteSVG');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');

function sendCommand(action) {
    if (action == "play") {
        playButton.style.display = "none";
        pauseButton.style.display = "flex";
    } else {
        pauseButton.style.display = "none";
        playButton.style.display = "flex";
    }
    socket.emit('video-control', { action });
}

function sendVolume(value) {
    socket.emit('video-control', { action: 'volume', value: parseFloat(value) });
}

function sendVideo(video) {
    socket.emit('video-control', { action: 'selectVideo', video: video })
}

function sendVideoTime(direction) {
    socket.emit('video-control', { action: 'setVideoTime', direction: direction })
}

function sendQuality() {
    const quality = qualitySelector.value;
    socket.emit('video-control', { action: 'updateQuality', quality: quality });
}

function sendMuteValue() {
    if (muteSVG.style.display == "none") {
        unmuteSVG.style.display = "none";
        muteSVG.style.display = "block";
        socket.emit('video-control', { action: 'muteVideo', mute: true });
    } else if (unmuteSVG.style.display == "none") {
        muteSVG.style.display = "none";
        unmuteSVG.style.display = "block";
        socket.emit('video-control', { action: 'muteVideo', mute: false });
    }
}