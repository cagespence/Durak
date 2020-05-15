import { gameConstants } from '../redux/constants/gameConstants'
import { store } from '../redux/store'
const io = require('socket.io-client');
const socket = io( 'http://192.168.2.42:3000' );

export default function(){

  socket.on('gamestate', (clients, gameState) => {
    if (clients.some((client)=>{
       return client.clientId === socket.id
    }))
    store.dispatch({type: gameConstants.UPDATE_GAMESTATE, gameState});
  })

    function register( name, callback ){
        socket.emit('register', name, callback)
    }

    function joinRoom( roomId, callback ){
        socket.emit('join-room', roomId, callback);
    }

    function exitRoom ( roomId ){
        socket.emit('leave-room', roomId)
    }

    function createRoom ( roomId, callback ) {
        socket.emit('create-room', roomId, callback);
    }

    function getRooms ( callback ) {
      socket.emit('get-rooms', callback)
    }

    function attack( card, roomId, callback) {
      socket.emit('attack', card, roomId, callback)
    }

    function defend( attacking, defending, roomId, callback ) {
      socket.emit('defend', attacking, defending, roomId, callback)
    }

    function startGame( roomId, callback ){
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
    }
}