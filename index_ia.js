//const express = require('express');
//const http = require('http');
//const socketio = require('socket.io');
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 80;
const HF_TOKEN = process.env.HF_TOKEN;

// const { InferenceClient } = require('@huggingface/inference');
import { InferenceClient } from "@huggingface/inference";

const inference = new InferenceClient(HF_TOKEN);

let peers = []; // webrtc

io.on('connection', (socket) => {
  console.log("CONNECTAT IA");
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
        'stream': false // podeu fer servir stream: true per rebre tokens
      })
    });
    const json = await response.json();
    json.id = id;
    // enviar el json sencer és una burrada, això és només il·lustratiu
    socket.emit('message', json);
  });
  socket.on('message-image-ltim', async data => {
    const text = data.text;
    const id = ++count;
    socket.emit('message', {
      id: id,
      text: "Rebut: " + text + ". Ara generaré imatge amb LTIM. Espera un poquet.",
    });
    const response = await fetch("http://ia-ltim.uib.es/api/sd/txt2img", {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'prompt': data.text
      })
    });
    const json = await response.json();
    json.id = id;
    socket.emit('image', json);
  });
  socket.on('message-image-hf', async data => {
    const text = data.text;
    const id = ++count;
    socket.emit('message', {
      id: id,
      text: "Rebut: " + text + ". Generant amb HuggingFace. Espera un poquet."
    });

    const image = await inference.textToImage({
      // provider: 'replicate',
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: text,
      parameters: {
        negative_prompt: "blurry",
      }
    });

    console.log(image);

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString('base64');

    const json = {
      id: id,
      images: [base64],
      type: image.type,
      info: 'pendent'
    };

    socket.emit('image', json);
    
  });

  // webrtc
  socket.on("init-webrtc", () => {
    const existing = peers.find( s => s === socket.id);
    if (!existing) {
      peers.push(socket.id);
      io.emit('update-user-list', {
        users: peers
      });
    }
  });

  socket.on('disconnect', () => {
    peers = peers.filter(
      s => s !== socket.id
    );
    socket.broadcast.emit("remove-user", {
      socketId: socket.id
    });
  });

  socket.on('ice-candidate', data => {
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate
    });
  });

  socket.on("call-user", data => {
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id
    });
  });

  socket.on("make-answer", data => {
    socket.to(data.to).emit("answer-made", {
      socket: socket.id,
      answer: data.answer
    });
  });
});

app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});