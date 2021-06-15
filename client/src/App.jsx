import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import RegisterForm from './components/RegisterForm';
import Rooms from './components/Rooms';
import Game from './components/Game';

function importAll(r) {
  let images = {};
  r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

function App(props) {
  const [images, setImages] = useState([])
  
  useEffect(() => {
    setImages(importAll(require.context('./assets/deck', false, /.png$/)))
  }, [])
  return (
    <div className="App">
      <div className={`title 
      ${!props.user ? 'large' : ''}`}>
        <div>RUSSIAN FOOL</div>
        {/* {props.gameState && <button className="button scores">scores</button>} */}
      </div>

        {props.user && <div className="user-chip">{props.user.userName}</div>}                      
      {props.error &&
        <div className='message'>
          {props.error}
        </div>
      }
      {!props.user &&
        <>
          <RegisterForm />
          {/* <div className="label">
            This game has no winner - only a loser. At the start, each player is dealt six cards, which are played in a series of bouts of attack and defence. When a player's hand is reduced to fewer than six cards it is replenished from the talon of undealt cards. After the talon is exhausted, there is no more replenishment and the aim is to get rid of all the cards from your hand. The last player left holding cards is the loser. This player is the fool (durak) and is ridiculed by the other players.
          </div> */}
        </>
      }
      {props.user && !props.inRoom && <Rooms className='cont'/>}
      {props.inRoom &&
        <>
          {!props.gameState && (
            <>
            <div className="room-code"><u>{props.inRoom}</u></div>
            <div className='message'>
              share the room code above with friends
            </div>
            </>
          )}
          <Game images={images} />
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
