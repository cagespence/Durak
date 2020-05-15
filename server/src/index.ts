// External dependencies
import express from 'express';
const app = express();

import http from 'http';
const server = new http.Server(app);

import socketIo from 'socket.io';
const io = socketIo(server);

import {Client, ClientRegisteredCallback} from './clients/clientTypes';
import {RoomCreatedCallback, RoomJoinedCallback, GetRoomsCallback} from './rooms/roomTypes';
import {GameStateCallback, Card} from './models/gameStateTypes';

// Configuration for server
const {PORT} = require('./config/serverConfig');

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
} = gameManager();

// Server entry point
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

io.on('connection', (client: any) => {
  // add 'client' aka socket
  addClient(client);

  // handle registering user with username
  client.on('register', (name: string, callback: ClientRegisteredCallback) => {
    handleRegister(client, name, callback);
  });

  // handle user joining a room
  client.on('join-room',
      (roomId: string, callback: RoomJoinedCallback) => {
        getClientById(client.id).then((_client: Client) => {
          handleJoinRoom(_client, roomId, callback);
        });
      }
  );

  // Handle user creating room
  client.on('create-room',
      (roomId: string, callback: RoomCreatedCallback) => {
        getClientById(client.id).then((_client: Client) => {
          handleCreateRoom(_client, roomId, callback);
        });
      });

  // Handle user leaving room
  client.on('leave-room', (client: Client) => {
    handleLeaveRoom(client);
  });

  client.on('get-rooms', (callback: GetRoomsCallback) => {
    getRooms(callback);
  });

  // Handle game starting
  client.on('start-game', (
      roomId: string,
      callback: GameStateCallback
  ) => {
    const clients = getClientsInRoom(roomId);
    const gameState = startGame(roomId, clients, callback);
    if (gameState) {
      io.emit('gamestate', clients, gameState);
    }
  });

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
