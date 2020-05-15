import { roomConstants } from '../constants/roomConstants'

import getClient from './shared'

const client = getClient();

export const roomActions = {
  getRooms,
  addRoom,
  joinRoom,
  leaveRoom
}

function getRooms() {
  return dispatch => {
    dispatch(request()) 
    client.getRooms((error, rooms) => {
      if (error) {
        dispatch(failure(error))
      }
      if (rooms) {
        dispatch(success(rooms))
      }
    })
  }

  function request() { return {type: roomConstants.GET_ROOMS_REQUEST}}
  function success(rooms) { return {type: roomConstants.GET_ROOMS_SUCCESS, rooms}}
  function failure(error) { return {type: roomConstants.GET_ROOMS_FAILURE, error}}
}

function joinRoom(roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.joinRoom(roomId, (error, inRoom) => {
      if (error) {
        dispatch(failure(error))
      }
      if (inRoom) {
        dispatch(success(inRoom))
      }
    })
  }

  function request(roomId) { return {type: roomConstants.JOIN_ROOM_REQUEST, roomId}}
  function success(inRoom) { return {type: roomConstants.JOIN_ROOM_SUCCESS, inRoom}}
  function failure(error) { return {type: roomConstants.JOIN_ROOM_FAILURE, error}}

}

function addRoom(roomId) {
  return dispatch => {
    dispatch(request(roomId))
    client.createRoom(roomId, (error, inRoom) => {
      if (error) {
        dispatch(failure(error))
      }
      if (inRoom) {
        dispatch(success(inRoom))
      }
    })
  }

  function request(roomId) { return {type: roomConstants.ADD_ROOM_REQUEST, roomId}}
  function success(inRoom) { return {type: roomConstants.ADD_ROOM_SUCCESS, inRoom}}
  function failure(error) { return {type: roomConstants.ADD_ROOM_FAILURE, error}}

}

function leaveRoom(roomId) {
  return dispatch => {
    dispatch(request())
    client.exitRoom(roomId, (error, rooms) => {
      if (error) {
        dispatch(failure(error))
      }
      if (rooms) {
        dispatch(success())
      }
    })
  }

  function request() { return {type: roomConstants.LEAVE_ROOM_REQUEST}}
  function success() { return {type: roomConstants.LEAVE_ROOM_SUCCESS}}
  function failure(error) { return {type: roomConstants.LEAVE_ROOM_FAILURE, error}}

}