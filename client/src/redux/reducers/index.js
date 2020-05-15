import { combineReducers } from 'redux'

import { rooms } from './rooms'
import { registration } from './registration'
import { game } from './game'

const rootReducer = combineReducers({
  rooms,
  registration,
  game,
})

export default rootReducer
