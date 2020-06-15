import { roomConstants } from '../constants/roomConstants'
import { userConstants } from '../constants/userConstants'

const initialState = {
}

export function rooms (state = initialState, action) {
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
        ...state,
        inRoom: action.inRoom,
        isHost: true
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
    case roomConstants.PLAYER_LIST:
      return {
        ...state,
        players: action.players
      }
    case userConstants.RECONNECT_INFO:
      if (action.appState.inRoom)
      return {
        inRoom: action.appState.InRoom
      }
    default:
      return state
  }
}
