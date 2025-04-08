import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const port = 80;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Función para actualizar y emitir la lista de usuarios activos
function updateActiveUsers() {
    const users = [];
    for (let [id, socket] of io.of('/').sockets) {
        if (socket.username) {
            users.push(socket.username);
        }
    }
    console.log("Usuarios activos:", users); // Verifica la lista en la consola del servidor
    io.emit('active users', users);
}

io.on('connection', (socket) => {
    console.log("S'ha connectat algú");

    socket.on('set username', (username) => {
        socket.username = username;
        updateActiveUsers();
    });

    socket.on('chat message', (msg) => {
        const sender = socket.username || 'Anónimo';
        io.emit('chat message', `${sender}: ${msg}`);
    });

    // Si se desconecta un usuario, se debe actualizar la lista
    socket.on('disconnect', () => {
        console.log("S'ha desconnectat");
        socket.username = null; // Limpiar el nombre de usuario
        updateActiveUsers();
    });

    socket.on('request active users', () => {
        updateActiveUsers();
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port
${port}`);
});