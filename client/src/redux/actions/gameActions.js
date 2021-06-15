import { gameConstants } from '../constants/gameConstants'

import getClient from './shared'

const client = getClient();

export const gameActions = {
  startGame,
  deal,
  attack,
  defend,
  pickUp,
  nextRound,
  updateGameState,
}

function startGame (roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.startGame(roomId, (error, gameState) => {
      if (error) {
        dispatch(failure(error))
      }
      if (gameState) {
        dispatch(success(gameState))
      }
    })
  }
  function request(roomId)    { return {type: gameConstants.START_GAME_REQUEST, roomId}}
  function success(gameState) { return {type: gameConstants.START_GAME_SUCCESS, gameState}}
  function failure(error)     { return {type: gameConstants.START_GAME_FAILURE, error}}
}

function nextRound (roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.nextRound(roomId, (error, gameState) => {
      if (error) {
        dispatch(failure(error))
      }
      if (gameState) {
        dispatch(success(gameState))
      }
    })
  }
  function request(roomId)    { return {type: gameConstants.NEXT_ROUND_REQUEST, roomId}}
  function success(gameState) { return {type: gameConstants.NEXT_ROUND_SUCCESS, gameState}}
  function failure(error)     { return {type: gameConstants.NEXT_ROUND_FAILURE, error}}
}

function attack (card, roomId) {
  return dispatch => {
    console.log('attacking', card, roomId);
    dispatch(request(card, roomId))
    client.attack(card, roomId, (error, gameState) => {
      console.log('client callback');
      if (error) {
        dispatch(failure(error))
      }
      if (gameState) {
        dispatch(success(gameState))
      }
    })
  }
  function request(card, roomId) { return {type: gameConstants.ATTACK_REQUEST, request: {card, roomId}}}
  function success(gameState)    { return {type: gameConstants.ATTACK_SUCCESS, gameState}}
  function failure(error)        { return {type: gameConstants.ATTACK_FAILURE, error}}
} 

function defend (attacking, defending, clientId) {
  return dispatch => {
    dispatch(request(attacking, defending, clientId))
    client.defend(attacking, defending, clientId, (error, gameState) => {
      if (error) {
        dispatch(failure(error))
      }
      if (gameState) {
        dispatch(success(gameState))
      }
    })
  }
  function request(attacking, defending, clientId)  { return {type: gameConstants.DEFEND_REQUEST, attacking, defending, clientId}}
  function success(gameState)       { return {type: gameConstants.DEFEND_SUCCESS, gameState}}
  function failure(error)           { return {type: gameConstants.DEFEND_FAILURE, error}}
}

function pickUp (roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.pickUp(roomId, (error, gameState) => {
      if (error) {
        dispatch(failure(error))
      }
      if (gameState) {
        dispatch(success(gameState))
      }
    })
  }
  function request(roomId) { return {type: gameConstants.PICKUP_REQUEST, roomId}}
  function success(gameState)       { return {type: gameConstants.PICKUP_SUCCESS, gameState}}
  function failure(error)           { return {type: gameConstants.PICKUP_FAILURE, error}}
}

function updateGameState (gameState) {
  return dispatch => {
    dispatch(update(gameState))
  }
  function update(gameState)  { return {type: gameConstants.UPDATE_GAMESTATE, gameState}}
}

function deal(roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.deal(roomId, (error, gameState) => {
      if (error) {
        dispatch(failure(error))
        console.log('fail deal')
      }
      if (gameState) {
        dispatch(success(gameState))
        console.log('success deal')
      }
    })
    function request(roomId) {return {type: gameConstants.DEAL_REQUEST, roomId}}
    function success(gameState) {return {type: gameConstants.DEAL_SUCCESS, gameState}}
    function failure(error) {return {type: gameConstants.DEAL_FAILURE, error}}
  }
}