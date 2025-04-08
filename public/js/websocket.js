const socket = io();

// Asignamos un identificador único a cada usuario
let userId = socket.id;  // Esto es único por usuario
let username = '';  // Para almacenar el nombre de usuario

// Elementos DOM para manejar la interacción del chat
const popupButton = document.getElementById('popupButton');
const popupDiv = document.getElementById('popupDiv');
const inputMessage = document.querySelector('.escribirMensajesContainer input');
const sendButton = document.querySelector('.escribirMensajesContainer button');
const mensajesContainer = document.querySelector('.mensajesContainer');
const overlay = document.getElementById('overlay');
const submitUsernameButton = document.getElementById('submitUsernameButton');
const usernameInput = document.getElementById('usernameInput');
const chatContainer = document.getElementById('chatContainer');

// Función para mostrar y ocultar el popup
popupButton.addEventListener('click', () => {
    if (username === '') {
        // Mostrar el overlay para pedir el nombre de usuario
        overlay.style.display = 'block';
        // Añadir desenfoque al popup
        popupDiv.style.backdropFilter = 'blur(10px)';
    }
});

// Al enviar el nombre de usuario
submitUsernameButton.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        // Emitir el nombre de usuario al servidor
        socket.emit('set username', username);

        // Ocultar el overlay
        overlay.style.display = 'none';
    }
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

    // Si el mensaje es del sistema (de tipo 'system'), se asigna una clase especial
    if (data.sender === 'system') {
        messageItem.classList.add('mensajeSistemaContainer');
        messageItem.innerHTML = `<p>${data.content}</p>`; // Solo contenido, sin nombre
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
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight; // Mantener el scroll en el fondo
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