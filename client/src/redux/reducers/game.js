import { gameConstants } from '../constants/gameConstants'

const initialState = {
}

export function game(state = initialState, action) {
  switch (action.type) {
    case gameConstants.START_GAME_REQUEST:
      return {
        ...state
      }
    case gameConstants.START_GAME_SUCCESS:
      return {
        ...state,
        gameState: action.gameState
      }
    case gameConstants.START_GAME_FAILURE:
      return {
        ...state, 
        error: action.error
      }
    case gameConstants.ATTACK_REQUEST:
      return {
        ...state,
        playing: action.card
      }
    case gameConstants.ATTACK_SUCCESS:
      return {
        ...state,
        gameState: action.gameState
      }
    case gameConstants.ATTACK_FAILURE:
      return {
        ...state,
        error: action.error
      }
    case gameConstants.DEFEND_REQUEST:
      return {
        ...state,
        playing: action.defending
      }
    case gameConstants.DEFEND_SUCCESS:
      return {
        gameState: action.gameState
      }
    case gameConstants.DEFEND_FAILURE:
      return {
        ...state,
        error: action.error
      } 
    case gameConstants.UPDATE_GAMESTATE:
      return {
        gameState: action.gameState
      }
    default:
      return state;
  }
}