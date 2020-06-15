// External dependencies
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors())

import http from 'http';
const server = new http.Server(app);

import socketIo from 'socket.io';
const io = socketIo(server);

import {Client, ClientRegisteredCallback} from './clients/clientTypes';
import {RoomCreatedCallback, RoomJoinedCallback, GetRoomsCallback, Room} from './rooms/roomTypes';
import {GameStateCallback, Card, GameStateInterface} from './models/gameStateTypes';

// Configuration for server
// const {PORT} = require('./config/serverConfig');

// handlers and functions for clients
const clientManager = require('./clients/clientManager');
const {
  handleRegister,
  handleDisconnect,
  handleReconnect,
  getReconnectId,
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
  findRoomByClient,
} = roomManager();

const gameManager = require('./game/gameManager');
const {
  startGame,
  attack,
  defend,
  nextRound,
  pickUp,
  getGame,
} = gameManager();

// Server entry point
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

io.on('connection', (client: any) => {
  // add 'client' aka socket
  addClient(client);

  client.on('reconn', (oldClientId: string) => {

    console.log('reconnecting ... ')

    let appState = {
      user: undefined,
      inRoom: undefined,
      gameState: undefined,
    }

    const reconnectId = handleReconnect(client.id, oldClientId);

    const retrievedClient = getClientById(reconnectId);

    if (!retrievedClient) console.log('user did not register yet')

    if (retrievedClient?.clientId) {
      appState.user = retrievedClient;
      const inRoom: Room = findRoomByClient(retrievedClient.clientId);

      if (!inRoom) console.log('client not in room')
      if (inRoom) {
        appState.inRoom = inRoom.roomId;
      }

      console.log('emitting reconnect info')
      // console.log(appState)
      io.to(client.id).emit('reconnect-info', appState)
    }

    // handleReconnect(client.id, oldClientId)
    //   .then((newId: string) => {
    //     return getClientById(newId)
    //   })
    //   .then((retrievedClient: Client) => {
    //     console.log('retrieved', retrievedClient)
    //     if (retrievedClient) {
    //       appState.user = retrievedClient;
    //     } else {
    //       console.log('user did not register yet')
    //     }
    //     return findRoomByClient(retrievedClient.clientId);
    //   })
    //   .then((room: Room) => {
    //     console.log('finding room', room)
    //     if (room) {
    //       appState.inRoom = room.roomId;
          getGame('roomId')
    //     }
    //   })
    //   .then((gameState: GameStateInterface) => {
    //     if (gameState) {
    //       appState.gameState = gameState
    //     }
    //   })
    //   .catch((reason: string) => {
    //     console.log(reason)
    //   })
    //   .finally(() => {
    //     console.log('emitting reconnect info')
    //     console.log(appState)
    //     io.to(client.id).emit('reconnect-info', appState)
    //   })
    
      // check if the client has joined a room


      /**
       * emit all relevant information to the client
       * 1: username
       * 2: 
       */

      // findRoomByClient(reconnectId).then((room: Room) => {
      //   if (room) {

      //   }
      // })
    })
  // })

  // handle registering user with username
  client.on('register', (name: string, callback: ClientRegisteredCallback) => {
    handleRegister(client.id, name.toLowerCase(), callback);
  });

  // handle user joining a room
  client.on('join-room',
    (roomId: string, callback: RoomJoinedCallback) => {
      const _client = getClientById(client.id);
      handleJoinRoom(_client, roomId.toLowerCase(), callback)
        .then((clients: Client[]) => {
            emitClientListToClients(clients)
            // if (clients) {
            //   io.emit('player-list', clients);
            // }
          });
      }
  );

  // Handle user creating room
  client.on('create-room',
      (roomId: string, callback: RoomCreatedCallback) => {
        const _client = getClientById(client.id)
        handleCreateRoom(_client, roomId.toLowerCase(), callback);
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
    const clients = getClientsInRoom(roomId);
    const gameState = startGame(roomId.toLowerCase(), clients, callback);
    emitGameStateToRoom(roomId, gameState)
    // if (gameState) {
    //   clients.forEach((client: Client) => {
    //     io.to(client.clientId).emit('gameState', gameState)
    //   })
    //   // io.emit('gamestate', clients, gameState);
    // }
  });

  client.on('attack', (
      card: Card,
      roomId: string,
      callback: GameStateCallback
  ) => {
    const clientId = client.id;
    // const clients = getClientsInRoom(roomId);
    const gameState = attack(card, clientId, roomId, callback);
    emitGameStateToRoom(roomId, gameState)
    // if (gameState) {
    //   io.emit('gamestate', clients, gameState);
    // }
  }
  );

  client.on('next-round', (
    roomId: string,
  ) => {
    const gameState = nextRound(roomId);
    emitGameStateToRoom(roomId, gameState)
    // const clients = getClientsInRoom(roomId);
    // if (gameState) {
    //   console.log('emitting gamestate for next round')
    //   io.emit('gamestate', clients, gameState);
    // }
  });

  client.on('pickup', (
    roomId: string,
  ) => { 
    const gameState = pickUp(roomId);
    emitGameStateToRoom(roomId, gameState)

    // const clients = getClientsInRoom(roomId);
    // if (gameState) {
    //   console.log('emitting gamestate for pickup')
    //   io.emit('gamestate', clients, gameState);
    // }
  });

  client.on('defend', (
      attacking: Card,
      defending: Card,
      roomId: string,
      callback: GameStateCallback
  ) => {
    const clientId = client.id;
    // const clients = getClientsInRoom(roomId);
    const gameState = defend(attacking, defending, clientId, roomId, callback);
    emitGameStateToRoom(roomId, gameState)

    // if (gameState) {
    //   io.emit('gamestate', clients, gameState);
    // }
  }
  );

  /**
   * Handles client disconnecting from the server
   *  */
  client.on('disconnect', () => {
    console.log(`${client.id} disconnected ... waiting for reconnect`);
    const _client = getClientById(client.id)
    handleDisconnect(_client);
    removeHostedRoom(_client);
    handleLeaveRoom(_client);
  });

  const emitGameStateToRoom = (roomId: string, gameState: GameStateInterface) => {
    const clients = getClientsInRoom(roomId);
    clients.forEach((client: Client) => {
      io.to(getReconnectId(client.clientId)).emit('gameState', gameState)
    })
  }

  const emitClientListToClients = (clients: Client[]) => {
    clients.forEach((client: Client) => {
      io.to(getReconnectId(client.clientId)).emit('player-list', clients)
    })
  }
});
