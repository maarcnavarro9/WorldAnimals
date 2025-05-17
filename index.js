import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const port = 80;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};  // Objeto para almacenar los usuarios y sus nombres
let peers = []; // webrtc

/*
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
*/

app.use(express.static('public'));

io.on('connection', (socket) => {

    // Al recibir el nombre de usuario del cliente
    socket.on('set username', (username) => {
        users[socket.id] = username;  // Asociar el socket.id con el nombre del usuario

        // Crear un array de objetos { id, username }
        const peerList = peers
            .filter(id => users[id])  // Filtra solo los ids que tienen un username asociado
            .map(id => ({
                id: id,
                username: users[id]
            }));

        io.emit("update-user-list", { users: peerList });


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
        if (data.type === 'ia') {
            // Solo enviar la respuesta al usuario que lo envió
            socket.emit('chat message', {
                type: data.type,
                content: data.content,
                sender: data.sender
            });
        } else {
            // Mensajes globales o p2p sí se mandan a todos
            io.emit('chat message', {
                type: data.type,
                content: data.content,
                sender: data.sender
            });
        }
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

    let count = 0;
    socket.on('message-ltim', async data => {
        const text = data.text;
        const id = ++count;
        const response = await fetch("http://ia-ltim.uib.es/api/ollama/generate", {
            method: 'post',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'model': 'qwen2.5:32b',
                'prompt': data.text,
                'stream': false
            })
        });
        const json = await response.json();
        json.id = id;
        socket.emit('message', json);
    });

    //webrtc
    // Inicializar el chat
    socket.on("init-webrtc", () => {
        if (!peers.includes(socket.id)) {
            peers.push(socket.id);
        }
    });

    socket.on("disconnect", () => {
        peers = peers.filter(id => id !== socket.id);
        socket.broadcast.emit("remove-user", { socketId: socket.id });
    });

    socket.on("call-user", ({ offer, to }) => {
        socket.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ answer, to }) => {
        socket.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
        socket.to(to).emit("ice-candidate", { candidate });
    });

    socket.on("reject-call", ({ to }) => {
        socket.to(to).emit("call-rejected", { from: socket.id });
    });

    socket.on('video-control', (data) => {
        socket.broadcast.emit('video-control', data);
    });

    socket.on("hang-up", ({ to }) => {
        socket.to(to).emit("hanged-up", { from: socket.id });
    })
});

server.listen(port, () => {
    console.log(`Example app listening on port
 ${port}`);
});
