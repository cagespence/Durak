import { gameConstants } from '../redux/constants/gameConstants'
import { store } from '../redux/store'
import { roomConstants } from '../redux/constants/roomConstants';
const io = require('socket.io-client');

// const address = 'https://durak-backend.herokuapp.com'
const address = 'localhost:3000'

/**
 * Manually setting up the IP with the ip of the server ( locally for dev environment )
 */
const socket = io(`${address}`); 

export default function () {

  // Emit gamestate to a list of clients
  socket.on('gamestate', (clients, gameState) => {
    console.log('emitting gameState to clients')
    if (clients.some((client) => {
      return client.clientId === socket.id
    })) {
      store.dispatch({ type: gameConstants.UPDATE_GAMESTATE, gameState });
    }
  })

  // Emit player list to a list of clients
  // Keeps player list up-to-date in a game lobby
  socket.on('player-list', (clients) => {
    console.log('player-list', clients)
    if (clients.some((client) => {
      return client.clientId === socket.id
    })) {
      store.dispatch({ type: roomConstants.PLAYER_LIST, players: clients });
    }
  })

  function register(name, callback) {
    socket.emit('register', name, callback)
  }

  function joinRoom(roomId, callback) {
    socket.emit('join-room', roomId, callback);
  }

  function exitRoom(roomId) {
    socket.emit('leave-room', roomId)
  }

  function createRoom(roomId, callback) {
    socket.emit('create-room', roomId, callback);
  }

  function nextRound(roomId, callback) {
    socket.emit('next-round', roomId, callback);
  }

  function pickUp(roomId, callback) {
    socket.emit('pickup', roomId, callback);
  }

  function getRooms(callback) {
    socket.emit('get-rooms', callback)
  }

  function attack(card, roomId, callback) {
    socket.emit('attack', card, roomId, callback)
  }

  function defend(attacking, defending, roomId, callback) {
    socket.emit('defend', attacking, defending, roomId, callback)
  }

  function startGame(roomId, callback) {
    socket.emit('start-game', roomId, callback)
  }

  return {
    register,
    createRoom,
    getRooms,
    joinRoom,
    exitRoom,
    startGame,
    attack,
    defend,
    nextRound,
    pickUp
  }
}