const socket = io();

// Asignamos un identificador único a cada usuario
let userId = socket.id;  // Esto es único por usuario
let username = '';  // Para almacenar el nombre de usuario

// Elementos DOM para manejar la interacción del chat
const popupButton = document.getElementById('popupButton');
const popupDiv = document.getElementById('popupDiv');
const inputMessage = document.querySelector('.escribirMensajesContainer input');
const sendButton = document.querySelector('.escribirMensajesContainer button');
const mensajesContainer = document.getElementById('chatGlobal');
const mensajesContainer2 = document.getElementById('chatP2P');
const mensajesContainer3 = document.getElementById('chatIA');
const overlay = document.getElementById('overlay');
const submitUsernameButton = document.getElementById('submitUsernameButton');
const usernameInput = document.getElementById('usernameInput');
const chatContainer = document.getElementById('chatContainer');

function sendWithEnter(e) {
    if (e.key === 'Enter' && inputMessage.value.trim()) {
        e.preventDefault();  // Evita el salto de línea en el input
        socket.emit('chat message', {
            type: 'global',
            content: inputMessage.value.trim(),
            sender: username
        });
        inputMessage.value = ''; // Limpiar el campo de texto
    }
}

inputMessage.addEventListener('keydown', (e) => sendWithEnter(e));

// Función para mostrar y ocultar el popup
popupButton.addEventListener('click', () => {
    if (username === '') {
        // Mostrar el overlay para pedir el nombre de usuario
        overlay.style.display = 'block';
        // Añadir desenfoque al popup
        popupDiv.style.backdropFilter = 'blur(10px)';
    }
});

function setUsername() {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('set username', username);
        overlay.style.display = 'none';
    }
}

// Al enviar el nombre de usuario
usernameInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        setUsername();
    }
});

submitUsernameButton.addEventListener('click', () => {
    setUsername();
});

// Función para manejar el envío de mensajes
sendButton.addEventListener('click', () => {
    const message = inputMessage.value.trim();
    if (message) {
        socket.emit('chat message', {
            type: 'global',
            content: message,
            sender: username || 'anónimo'  // Usamos el nombre de usuario para el campo sender
        });
        inputMessage.value = '';
    }
});

socket.on('chat message', function (data) {
    const messageItem = document.createElement('div');
    if (mensajesContainer.style.display != "none") {
        // Si el mensaje es del sistema (de tipo 'system'), se asigna una clase especial
        if (data.sender === 'system') {
            messageItem.classList.add('mensajeSistemaContainer');
            messageItem.innerHTML = `${data.content}`; // Solo contenido, sin nombre
        } else {
            // Compara el ID del usuario que envió el mensaje con el ID de este cliente
            if (data.sender === username) {
                messageItem.classList.add('mensajeEnviadoContainer');
                messageItem.innerHTML = `<p>${data.content}</p>`;
            } else {
                messageItem.classList.add('mensajeRecibidoContainer');
                messageItem.innerHTML = `<b>${data.sender}</b><p>${data.content}</p>`;
            }
        }

        mensajesContainer.appendChild(messageItem);
        mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
    }
    else if (mensajesContainer2.style.display != "none") {
        // Si el mensaje es del sistema (de tipo 'system'), se asigna una clase especial
        if (data.sender === 'system') {
            messageItem.classList.add('mensajeSistemaContainer');
            messageItem.innerHTML = `${data.content}`; // Solo contenido, sin nombre
        } else {
            // Compara el ID del usuario que envió el mensaje con el ID de este cliente
            if (data.sender === username) {
                messageItem.classList.add('mensajeEnviadoContainer');
                messageItem.innerHTML = `<p>${data.content}</p>`;
            } else {
                messageItem.classList.add('mensajeRecibidoContainer');
                messageItem.innerHTML = `<b>${data.sender}</b><p>${data.content}</p>`;
            }
        }

        mensajesContainer2.appendChild(messageItem);
        mensajesContainer2.scrollTop = mensajesContainer2.scrollHeight;
    }
    else if (mensajesContainer3.style.display != "none") {
        messageItem.classList.add('mensajeEnviadoContainer');
        messageItem.textContent = data.content;
        socketIA.emit('message-ltim', {
            text: data.content
        });
        mensajesContainer3.appendChild(messageItem);
        mensajesContainer3.scrollTop = mensajesContainer3.scrollHeight;
    }
});

// Al recibir la lista de usuarios activos
socket.on('update user list', (userList) => {
    const userListContainer = document.getElementById('userList');
    userListContainer.innerHTML = ''; // Limpiar la lista de usuarios

    // Agregar cada usuario a la lista
    userList.forEach(user => {
        const listItem = document.createElement('li');
        listItem.classList.add('active');
        listItem.textContent = user;
        userListContainer.appendChild(listItem);
    });
});
