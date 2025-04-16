const socket = io();

function sendCommand(action) {
    socket.emit('video-control', { action });
}

function sendVolume(value) {
    socket.emit('video-control', { action: 'volume', value: parseFloat(value) });
}