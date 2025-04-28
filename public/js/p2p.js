const iceConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            //exemple TURN server, canviar en cas d'ús real
            urls: 'turn:mi.turn.server:3478',
            username: 'usuarioTURN',
            credential: 'passTURN'
        }
    ]
};

const socketWebRTC = io();
window.sharedSocket = socketWebRTC;
const userList = document.getElementById('user-list');
const chatWith = document.getElementById('chat-with');
const messageContainer = document.getElementById('chatP2P');
const disconnectButton = document.getElementById('disconnect-button');
const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
const inputMessageOriginal = document.querySelector('.escribirMensajesContainer input');
const sendButtonOriginal = document.querySelector('.escribirMensajesContainer button');

let localConnection = null;
let dataChannel = null;
let conversations = {};
let selectedUser = null;
let pendingCandidates = [];
let isBusy = false;

function showConfirm(text) {
    confirmText.textContent = text;
    confirmModal.style.display = 'flex';
    return new Promise(resolve => {
        confirmYes.onclick = () => { confirmModal.style.display = 'none'; resolve(true); };
        confirmNo.onclick = () => { confirmModal.style.display = 'none'; resolve(false); };
    });
}

function handleCandidate(candidate) {
    if (localConnection && localConnection.remoteDescription && localConnection.remoteDescription.type) {
        localConnection.addIceCandidate(candidate).catch(console.error);
    } else {
        pendingCandidates.push(candidate);
    }
}

function flushPendingCandidates() {
    if (!localConnection || !localConnection.remoteDescription || !localConnection.remoteDescription.type) return;
    pendingCandidates.forEach(cand => localConnection.addIceCandidate(cand).catch(console.error));
    pendingCandidates = [];
}

function setupDataChannel(id) {
    dataChannel.onopen = () => {
        isBusy = true;
        disconnectButton.disabled = false;
    };
    dataChannel.onmessage = event => appendMessage(id, `Socket ${id}: ${event.data}`);
    dataChannel.onclose = () => {
        isBusy = false;
        disconnectButton.disabled = true;
    };
}

function createUserElement(id, username) {
    const el = document.createElement('div');
    el.className = 'user'; el.id = id; el.textContent = username;
    if (id === socketWebRTC.id) el.classList.add('me');
    else el.onclick = () => {
        if (isBusy) {
            alert('Ya tienes una conversación activa. Por favor desconéctate primero.');
        } else {
            startConnection(id);
        }
    };
    return el;
}

function renderMessages(id) {
    messageContainer.innerHTML = '';
    (conversations[id] || []).forEach(msg => {
        const el = document.createElement('div'); el.className = 'message'; el.textContent = msg;
        messageContainer.appendChild(el);
    });
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendMessage(id, msg) {
    if (!conversations[id]) conversations[id] = [];
    conversations[id].push(msg);
    if (selectedUser === id) {
        const messageElement = document.createElement('div');

        if (msg.startsWith('You: ')) {
            messageElement.className = 'mensajeEnviadoContainer';
            messageElement.innerHTML = `<p>${msg.slice(5)}</p>`;
        } else {
            messageElement.className = 'mensajeRecibidoContainer';
            const parts = msg.split(': ');
            const mensajeReal = parts.slice(1).join(': ');
            messageElement.innerHTML = `<b>Socket ${id}</b><p>${mensajeReal}</p>`;
        }

        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}

disconnectButton.onclick = () => {
    socketWebRTC.emit('hang-up', { to: selectedUser });
    endConnection();
};

function endConnection() {
    if (dataChannel) dataChannel.close();
    if (localConnection) { localConnection.close(); localConnection = null; }
    dataChannel = null; selectedUser = null; pendingCandidates = []; isBusy = false;
    disconnectButton.disabled = true;
    chatWith.textContent = 'Select a user'; /*sendButtonWebRTC.disabled = true;*/
}

socketWebRTC.emit('init-webrtc');
socketWebRTC.on('update-user-list', ({ users }) => {
    users.forEach(user => {
        if (!document.getElementById(user.id)) {
            userList.appendChild(createUserElement(user.id, user.username));
        }
    });
});

socketWebRTC.on('remove-user', ({ socketId }) => { const el = document.getElementById(socketId); if (el) el.remove(); if (socketId === selectedUser) endConnection(); });

socketWebRTC.on('offer', async ({ from, offer }) => {
    if (isBusy) { socketWebRTC.emit('reject-call', { to: from }); return; }
    const accept = await showConfirm(`Socket ${from} quiere iniciar un chat contigo. ¿Aceptar?`);
    if (!accept) { socketWebRTC.emit('reject-call', { to: from }); return; }
    selectedUser = from;
    chatWith.textContent = `Chatting with: ${from}`;

    // Creamos conexión con STUN/TURN
    localConnection = new RTCPeerConnection(iceConfig);
    localConnection.ondatachannel = ev => { dataChannel = ev.channel; setupDataChannel(from); };
    localConnection.onicecandidate = ev => ev.candidate && socketWebRTC.emit('ice-candidate', { to: from, candidate: ev.candidate });

    await localConnection.setRemoteDescription(offer);
    flushPendingCandidates();
    const answer = await localConnection.createAnswer();
    await localConnection.setLocalDescription(answer);
    socketWebRTC.emit('answer', { to: from, answer });
});

socketWebRTC.on('answer', async ({ answer }) => { await localConnection.setRemoteDescription(answer); flushPendingCandidates(); });
socketWebRTC.on('ice-candidate', ({ candidate }) => handleCandidate(candidate));
socketWebRTC.on('call-rejected', ({ from }) => { alert(`Socket ${from} rechazó tu invitación.`); endConnection(); });
socketWebRTC.on('hang-up', ({ from }) => { alert(`Socket ${from} colgó la llamada.`); endConnection(); });

function sendOriginalInputMessage() {
    const msg = inputMessageOriginal.value.trim();
    if (!msg || !dataChannel || dataChannel.readyState !== 'open') return;
    dataChannel.send(msg);
    appendMessage(selectedUser, `You: ${msg}`);
    inputMessageOriginal.value = '';
}

// Evento para enviar al pulsar Enter en inputMessage
inputMessageOriginal.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (mensajesContainer2.style.display !== "none") {  // SOLO si estamos en chatP2P
            sendOriginalInputMessage();
        }
    }
});

// Evento para enviar al pulsar el botón original
sendButtonOriginal.addEventListener('click', () => {
    if (mensajesContainer2.style.display !== "none") {  // SOLO si estamos en chatP2P
        sendOriginalInputMessage();
    }
});

// Evento para enviar al pulsar el botón original
sendButtonOriginal.addEventListener('click', () => {
    if (mensajesContainer2.style.display !== "none") {  // SOLO si estamos en chatP2P
        sendOriginalInputMessage();
    }
});

async function startConnection(to) {
    selectedUser = to;
    chatWith.textContent = `Chatting with: ${to}`;

    // Creamos conexión con STUN/TURN
    localConnection = new RTCPeerConnection(iceConfig);
    dataChannel = localConnection.createDataChannel('chat'); setupDataChannel(to);
    localConnection.onicecandidate = ev => ev.candidate && socketWebRTC.emit('ice-candidate', { to, candidate: ev.candidate });

    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    socketWebRTC.emit('call-user', { offer, to });
}
