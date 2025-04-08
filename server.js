import http from 'http';
import { WebSocketServer } from 'ws';
// o import WebSocket, { WebSocketServer } from 'ws';

const port = 3000;

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        // Reenviar a todos los demás clientes
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
                client.send(data);
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Signaling server listening on port ${port}`);
});
