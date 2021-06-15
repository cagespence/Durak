// External dependencies
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());

import http from 'http';
const server = new http.Server(app);

import socketIo from 'socket.io';
const io = socketIo(server);

// const session = require("express-session")({
//   secret: "my-secret",
//   resave: true,
//   saveUninitialized: true
// })

// import sharedsession from "express-socket.io-session";

// // Attach session
// app.use(session);

// // Share session with io sockets

// io.use(sharedsession(session));

import { 
  Client, 
  ClientRegisteredCallback } from './clients/clientTypes';
import {
  RoomCreatedCallback,
  RoomJoinedCallback,
  GetRoomsCallback} from './rooms/roomTypes';
import { 
  GameStateCallback, 
  Card } from './models/gameStateTypes';

// Configuration for server
// const {PORT} = require('./config/serverConfig');

// handlers and functions for clients
const clientManager = require('./clients/clientManager');
const {
  handleRegister,
  handleDisconnect,
  addClient,
  getClientById,
} = clientManager();

// handlers and functions for rooms
const roomManager = require('./rooms/roomManager');
const {
  handleCreateRoom,
  handleJoinRoom,
  getRooms,
  removeHostedRoom,
  handleLeaveRoom,
  getClientsInRoom,
} = roomManager();

const gameManager = require('./game/gameManager');
const {
  startGame,
  attack,
  defend,
  nextRound,
  pickUp,
  deal,
} = gameManager();

// Server entry point
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

io.on('connection', (client: any) => {
  // add 'client' aka socket
  addClient(client);

  // handle registering user with username
  client.on('register', (name: string, callback: ClientRegisteredCallback) => {
    handleRegister(client, name.toLowerCase(), callback);
  });

  // handle user joining a room
  client.on('join-room',
      (roomId: string, callback: RoomJoinedCallback) => {
        getClientById(client.id).then((_client: Client) => {
          handleJoinRoom(_client, roomId.toLowerCase(), callback).then((clients: Client[]) => {
            if (clients) {
              io.emit('player-list', clients);
            }
          });
        });
      }
  );

  // Handle user creating room
  client.on('create-room',
      (roomId: string, callback: RoomCreatedCallback) => {
        getClientById(client.id).then((_client: Client) => {
          handleCreateRoom(_client, roomId.toLowerCase(), callback).then((successful: boolean) => {
            if (successful) {
              io.emit('player-list', [_client]);
            }
          });
        });
      });

  // Handle user leaving room
  client.on('leave-room', (client: Client) => {
    handleLeaveRoom(client);
  });

  client.on('get-rooms', (callback: GetRoomsCallback) => {
    getRooms(callback);
  });

  // get list of clients in a room
  client.on('get-clients', (roomId: string, callback: GetRoomsCallback) => {
    const clients = getClientsInRoom(roomId);
    callback(clients);
  });

  // Handle game starting
  client.on('start-game', (
      roomId: string,
      callback: GameStateCallback
  ) => {
    console.log('starting game')
    const clients = getClientsInRoom(roomId);
    const gameState = startGame(roomId.toLowerCase(), clients, callback);
    if (gameState) {
      io.emit('gamestate', clients, gameState);
    }
  });

  client.on('deal', async (
    roomId: string,
    callback: GameStateCallback
    ) => {
      console.log('dealing server')
      const clients = getClientsInRoom(roomId)
      const gameState = await deal(roomId, callback)
      console.log(gameState.players[0].cards)
      console.log(gameState.players[1].cards)
      if (gameState) {
        io.emit('gamestate', clients, gameState)
      }
    }
  )

  client.on('attack', (
      card: Card,
      roomId: string,
      callback: GameStateCallback
  ) => {
    const clientId = client.id;
    const clients = getClientsInRoom(roomId);
    const gameState = attack(card, clientId, roomId, callback);
    if (gameState) {
      io.emit('gamestate', clients, gameState);
    }
  }
  );

  client.on('next-round', (
      roomId: string,
  ) => {
    const gameState = nextRound(roomId);
    const clients = getClientsInRoom(roomId);
    if (gameState) {
      console.log('emitting gamestate for next round');
      io.emit('gamestate', clients, gameState);
    }
  });

  client.on('pickup', (
      roomId: string,
  ) => {
    const gameState = pickUp(roomId);
    const clients = getClientsInRoom(roomId);
    if (gameState) {
      console.log('emitting gamestate for pickup');
      io.emit('gamestate', clients, gameState);
    }
  });

  client.on('defend', (
      attacking: Card,
      defending: Card,
      roomId: string,
      callback: GameStateCallback
  ) => {
    const clientId = client.id;
    const clients = getClientsInRoom(roomId);
    const gameState = defend(attacking, defending, clientId, roomId, callback);
    if (gameState) {
      io.emit('gamestate', clients, gameState);
    }
  }
  );

  /**
   * Handles client disconnecting from the server
   *  */
  client.on('disconnect', () => {
    console.log(`${client.id} disconnected`);
    getClientById(client.id).then((_client: Client) => {
      handleDisconnect(_client);
      removeHostedRoom(_client);
      handleLeaveRoom(_client);
    });
  });
});
