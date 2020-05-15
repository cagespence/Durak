import React from 'react';
import './App.css'
import { connect } from 'react-redux'
import RegisterForm from './components/RegisterForm';
import Rooms from './components/Rooms';
import Game from './components/Game';

function App(props) {
  return (
    <div className="App">
      <section>
        <div>
          <h1>
            DURAK!
          </h1>
            <div 
               >
                  {props.user ? 
                    `Logged in as ${props.user.userName}` :                       
                    <RegisterForm/> }
              </div>
              <div >
                {props.error}
              </div>
              {props.user && !props.inRoom && <Rooms className='cont'/>}
              {props.inRoom}
              {props.inRoom && <Game/>}
        </div>
      </section>
    </div>
  );
}

const mapStateToProps = state => {
  const { user, error } = state.registration
  const { inRoom } = state.rooms
  return {
    inRoom,
    user,
    error
  }
}

export default connect
  (mapStateToProps)(App);
