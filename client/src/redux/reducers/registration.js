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
    default: 
      return state
  }
}