import { roomConstants } from '../constants/roomConstants'

const initialState = {
}

export function rooms (state = initialState, action) {
  console.log('room reducer ' + action.type)
  console.log("action ",action)
  switch (action.type) {
    case roomConstants.GET_ROOMS_REQUEST:
      return {
        ...state,
        rooms: action.rooms
      }
    case roomConstants.GET_ROOMS_SUCCESS:
      return {
        ...state, rooms: action.rooms
      }
    case roomConstants.GET_ROOMS_FAILURE:
      return {
        ...state, error: action.error
      }
    case roomConstants.ADD_ROOM_REQUEST:
      return {
        ...state, adding: action.roomId
      }
    case roomConstants.ADD_ROOM_SUCCESS:
      return {
        ...state, inRoom: action.inRoom
      }
    case roomConstants.ADD_ROOM_FAILURE:
      return {
        ...state, error: action.error
      }
    case roomConstants.JOIN_ROOM_REQUEST:
      return {
        ...state, joining: action.roomId
      }
    case roomConstants.JOIN_ROOM_SUCCESS:
      return {
        ...state, inRoom: action.inRoom
      }
    case roomConstants.JOIN_ROOM_FAILURE:
      return {
        ...state, error: action.error
      }
    case roomConstants.LEAVE_ROOM_REQUEST:
      return {}
    case roomConstants.LEAVE_ROOM_SUCCESS:
      return {
        ...state, inRoom: ''
      }
    case roomConstants.LEAVE_ROOM_FAILURE:
      return {
        ...state, error: action.error
      }
    default:
      return state
  }
}
