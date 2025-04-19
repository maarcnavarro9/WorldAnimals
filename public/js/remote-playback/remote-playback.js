const socket = io();

const qualitySelector = document.getElementById('qualitySelector');

function sendCommand(action) {
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