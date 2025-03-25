import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const port = 80;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
io.on('connection', (socket) => {
    console.log("S'ha connectat algú");
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log("S'ha desconnectat");
    });

});
server.listen(port, () => {
    console.log(`Example app listening on port
${port}`);
});

