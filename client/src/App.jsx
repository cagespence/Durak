import React from 'react';
import { connect } from 'react-redux'
import RegisterForm from './components/RegisterForm';
import Rooms from './components/Rooms';
import Game from './components/Game';

function App(props) {
  return (
    <div className="App">
        <h1 className='title'>
          DURAK
        </h1>
        {props.error &&
          <div className='message'>
            {props.error}
          </div>
        }
        {props.user ? 
          <div className="user-chip">{props.user.userName}</div> :                       
          <RegisterForm />
        }
        {props.user && !props.inRoom && <Rooms className='cont'/>}
        {props.inRoom &&
          <>
            {!props.gameState && (
              <div className="room-code">{props.inRoom}</div>
            )}
            <Game />
          </>}
      </div>
  );
}

const mapStateToProps = state => {
  const { user, error } = state.registration
  const { inRoom } = state.rooms
  const { gameState } = state.game
  return {
    inRoom,
    user,
    error,
    gameState
  }
}

export default connect
  (mapStateToProps)(App);
