import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const port = 80;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
let users = {};  // Objeto para almacenar los usuarios y sus nombres

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Al recibir el nombre de usuario del cliente
    socket.on('set username', (username) => {
        users[socket.id] = username;  // Asociar el socket.id con el nombre del usuario

        // Emitir un mensaje al chat indicando que el usuario se ha conectado
        io.emit('chat message', {
            type: 'global',
            content: `${username} se ha unido al chat`,
            sender: 'system'
        });

        // Emitir la lista de usuarios activos
        io.emit('update user list', Object.values(users));
    });

    socket.on('chat message', (data) => {
        io.emit('chat message', {
            type: data.type,
            content: data.content,
            sender: data.sender // Enviar el sender para cada mensaje
        });
    });

    // Cuando el usuario se desconecta
    socket.on('disconnect', () => {
        const username = users[socket.id]; // Obtener el nombre del usuario por su socket.id
        if (username) {
            io.emit('chat message', {
                type: 'global',
                content: `${username} se ha desconectado.`,
                sender: 'system'
            });
            delete users[socket.id]; // Eliminar el usuario desconectado

            // Emitir la lista actualizada de usuarios activos
            io.emit('update user list', Object.values(users));
        }
    });

    socket.on('video-control', (data) => {
        socket.broadcast.emit('video-control', data);
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port
 ${port}`);
});
