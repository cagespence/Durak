import React, { useState } from 'react'
import { connect, useDispatch } from 'react-redux'

import { gameActions } from '../redux/actions/gameActions';

export const Game = (props) => {

  const dispatch = useDispatch();

  const [selectedCard, setSelectedCard] = useState();

  const handleAttack = () => {
    if (selectedCard){
      dispatch(gameActions.attack(selectedCard, props.inRoom))
    }
  }

  const handleDefend = () => {
    const attacking = (props.gameState.pairs.slice(-1).pop()).attack;
    console.log("attacking",attacking)
    if (selectedCard && attacking){
      dispatch(gameActions.defend(attacking, selectedCard, props.inRoom))
    }
  }

  const handleStartGame = (event) => {
    event.preventDefault();
    dispatch(gameActions.startGame(props.inRoom))
  }

  const Card = ({suit, value}) => {
    return (
      <button onClick={() => setSelectedCard({suit, value})}>
        {suit}, {value}
      </button>
    )

  }

  const Hand = ({gameState}) => {

    console.log(gameState);
    const playerIndex = gameState.players.findIndex((player) => {
      return player.player.clientId === props.user.clientId
    })

    const cards = gameState.players[playerIndex].cards;
    return (
      <div>
        {cards.map(card => {
          return <Card key={`${card.suit}-${card.value}`} {...card}></Card>
        })}
      </div>
    )
  }

  return (
    <div>
      {props.error}
      {!props.gameState && 
        <button onClick={handleStartGame}>
          startGame
        </button>
      }
      {props.gameState && 
        <div>
          attacker: {props.gameState.attacker.userName} <br/>
          defender: {props.gameState.defender.userName} <br/>
          trump suit: {props.gameState.trump} <br/>
          selected card: {selectedCard && <span>{selectedCard.suit}, {selectedCard.value}</span>} <br/>
          <Hand gameState={props.gameState}/> 
          {props.gameState.attacker.clientId === props.user.clientId &&
            <button onClick={handleAttack}>attack</button>
          }
          {props.gameState.defender.clientId === props.user.clientId &&
            <button onClick={handleDefend}>defend</button>
          }
        </div>
      }
    </div>
  )
}

const mapStateToProps = (state) => ({
  inRoom: state.rooms.inRoom,
  user: state.registration.user,
  gameState: state.game.gameState,
  error: state.game.error
})

export default connect(mapStateToProps)(Game)
