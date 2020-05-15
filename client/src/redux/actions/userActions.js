import { userConstants } from '../constants/userConstants'
import getClient from './shared'

const client = getClient();

export const userActions = {
  register
}

function register(userName) {
  return dispatch => {
    dispatch(request({user: userName}))
    client.register(userName, (error, user) => {
      if (error) {
        dispatch(failure(error))
      }
      if (user) {
        dispatch(success(user))
      }
    })
  }

  function request(user) { return {type: userConstants.REGISTER_REQUEST, user}}
  function success(user) { return {type: userConstants.REGISTER_SUCCESS, user}}
  function failure(error) { return {type: userConstants.REGISTER_FAILURE, error}}
}