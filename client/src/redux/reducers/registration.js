import { userConstants } from '../constants/userConstants'

const initialState = {
}

export function registration(state = initialState, action) {
  switch (action.type) {
    case userConstants.REGISTER_REQUEST: 
      return {
        // user: action.user
      };
    case userConstants.REGISTER_SUCCESS:
      return {
        user: action.user
      };
    case userConstants.REGISTER_FAILURE:
      return {
        error: action.error
      };
    case userConstants.RECONNECT_INFO:
      console.log('reconnect info in user', action)
      if (action.appState.user)
      return {
        user: action.appState.user
      };
    default: 
      return state
  }
}