import { gameConstants } from '../redux/constants/gameConstants'
import { store } from '../redux/store'
import { roomConstants } from '../redux/constants/roomConstants';
import { userConstants } from '../redux/constants/userConstants';
const io = require('socket.io-client');

// const address = 'durak-backend.herokuapp.com'
const address = '192.168.2.79:3000'

/**
 * Manually setting up the IP with the ip of the server ( locally for dev environment )
 */
const socket = io(`http://${address}`); 

export default function () {

  socket.on('connect', () => {
    const reconnectId = window.sessionStorage.getItem('clientId');
    console.log('reconnectid', reconnectId)

    if (reconnectId === null) {
      window.sessionStorage.setItem('clientId', socket.id)
    } else {
      console.log('emitting reconnect')
      socket.emit('reconn', reconnectId)
    }
  })

  socket.on('reconnect-info', (appState) => {
    console.log('reconnect info')
    store.dispatch({ type: userConstants.RECONNECT_INFO, appState });
    // store.dispatch({ type: roomConstants.RECONNECT_INFO, inRoom: appState.inRoom });
    // store.dispatch({ type: gameConstants.UPDATE_GAMESTATE, gameState: appState.gameState });
  })

  // Emit gamestate to a list of clients
  socket.on('gamestate', (gameState) => {
      store.dispatch({ type: gameConstants.UPDATE_GAMESTATE, gameState });
  })

  // Emit player list to a list of clients
  // Keeps player list up-to-date in a game lobby
  socket.on('player-list', (clients) => {
    // console.log('player-list', clients)
    // if (clients.some((client) => {
    //   return (client.clientId === socket.id || client.clientId === reconnectId)
    // })) {
    // }
    store.dispatch({ type: roomConstants.PLAYER_LIST, players: clients });
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