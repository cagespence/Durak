import React, { useState, useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { gameActions } from '../redux/actions/gameActions'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
// import { Animated } from "react-animated-css";

import helpers from '../helpers'

export const Game = (props) => {
  const dispatch = useDispatch()

  // const [gameState, setGameState] = useState(undefined)
  const [playerCards, setPlayerCards] = useState([])
  const [playedCards, setPlayedCards] = useState([])
  const [waitingOnDefender, setWaitingOnDefender] = useState(false)
  const [dropDisabled, setDropDisabled] = useState(false)
  // const [trump, setTrump] = useState(undefined)
  const [message, setMessage] = useState(undefined)
  const [canFinish, setCanFinish] = useState(false)
  const [canPickup, setCanPickup] = useState(false)

  useEffect(() => {

    setupHand()
    configureDropZone()

    let cardsInZone = props.gameState?.pairs?.map(pair => {
      if (pair.attack && pair.defend) return [pair.attack, pair.defend]
      if (!pair.defend) return [pair.attack]
    })?.flat()
    // cardsInZone = cardsInZone ? cardsInZone.flat() : cardsInZone
    if (cardsInZone) setPlayedCards(helpers.updateOrdered(playedCards, cardsInZone))

  }, [props.gameState, props.error, props.user.clientId])

  const setupHand = () => {
    const playerIndex = getPlayerIndex()
    const cardsInHand = props.gameState?.players[playerIndex].cards
    
    // if (!cardsInHand) setGameState(props.gameState)

    if (cardsInHand) {
      if ((cardsInHand.length !== playerCards.length) || cardsInHand.length === 0) {
        setPlayerCards(helpers.updateOrdered(playerCards, cardsInHand))
      }
    }
  }

  const getPlayerIndex = () => {
    return props.gameState?.players?.findIndex((player) => {
      return player.player.clientId === props.user.clientId
    })
  }

  /**
   * enable / disable ability to play a card
   */ 
  const configureDropZone = () => {
    
    let enabled = true;
    setWaitingOnDefender(false)
  
    const currentPlayerIsAttacker = props?.gameState?.attacker?.clientId === props.user.clientId
    const currentPlayerIsDefender = props?.gameState?.defender?.clientId === props.user.clientId
    
    console.log('isAttacker', currentPlayerIsAttacker);
    console.log('isDefender', currentPlayerIsDefender);

    const currentPair = props.gameState?.pairs?.slice(-1).pop()
    let attackAgain = []
    if (props.gameState?.pairs.length >= 1) { 
      attackAgain = props.gameState?.pairs?.map((pair) => (
        [[helpers.getCardValue(pair.attack?.value)], [helpers.getCardValue(pair.defend?.value)]]
      ))
    }
    
    // join the available attack card values with commas, remove duplicates
    attackAgain = joinWithOr([...new Set(attackAgain.flat(2))])

    const hasAttacked =
      currentPair?.attack !== undefined &&
      currentPair?.defend === undefined
    
    const hasDefended =
      currentPair?.attack !== undefined &&
      currentPair?.defend !== undefined

    console.log(hasAttacked);
    console.log(hasDefended);

    if (currentPlayerIsAttacker) {
      enabled = !(hasAttacked && !hasDefended)
      
      setMessage(
        !hasAttacked ?
          attackAgain.length > 0 ? 
            `Add to the attack with ${attackAgain}` :
            `You are attacking ${props.gameState?.defender.userName}` :
          `Waiting on ${props.gameState?.defender.userName} to defend`
      )

      setCanFinish(
        !hasAttacked ?
          attackAgain.length > 0 ? 
            true :
            false :
          false
      )

      // reset when the round changes
      setCanPickup(false)
    }

    if (currentPlayerIsDefender) {   
      enabled = hasAttacked && !hasDefended

      setMessage(
        hasAttacked ?
          `Defend the ${helpers.getCardValue(currentPair.attack.value)}` : 
          `Waiting on ${props.gameState?.attacker.userName} to play a card`
      )

      setCanPickup(hasAttacked && !hasDefended)

      // reset this when the round finishes
      setCanFinish(false)
    }

    if (!currentPlayerIsAttacker && !currentPlayerIsDefender) {
      enabled = false
      setCanFinish(false)
      setCanPickup(false)
      setMessage(`${props?.gameState?.attacker?.userName} is playing against ${props?.gameState?.defender?.userName}`)
    }

    setDropDisabled(!enabled);

    // setWaitingOnDefender(hasAttacked)
    // setWaitingOnDefender(!hasDefended)
    
    if (hasAttacked) setWaitingOnDefender(true)
    if (hasDefended) setWaitingOnDefender(false)
  }

  /**
   * Helper function to join arrays with commas, and 'or' at the end
   * input: [1, 2, 3, 4]
   * output: '1, 2, 3, 4 or 5'
   * @param {*} arr 
   */
  const joinWithOr = (arr) => {
    return arr.length > 1 ?
      arr.slice(0, -1).join(', ') + ' or ' + arr.slice(-1) :
      arr
  }

  const handleAttack = (card) => {
    if (card) { 
      dispatch(gameActions.attack(card, props.inRoom))
    }
  }

  const handleDefend = (card) => {
    const pairs = props.gameState?.pairs?.slice(-1).pop()
    let attacking;
    if (pairs) {
      attacking = pairs.attack
    }
    if (attacking) {
      dispatch(gameActions.defend(attacking, card, props.inRoom))
    }
  }

  const handleStartGame = (event) => {
    event.preventDefault()
    dispatch(gameActions.startGame(props.inRoom))
  }

  const handleNextRound = (event) => {
    event.preventDefault()
    dispatch(gameActions.nextRound(props.inRoom))
  }

  const handlePickUp = (event) => {
    event.preventDefault()
    dispatch(gameActions.pickUp(props.inRoom))
  }
  
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  };

  const move = (source, destination, droppableSource, droppableDestination) => {
    // get arrays of both source and destination
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)

    // remove item from source
    const [removed] = sourceClone.splice(droppableSource.index, 1)

    // add element to destination
    destClone.splice(droppableDestination.index, 0, removed)

    const result = {
      removed,
      sourceClone,
      destClone
    };

    return result
  };

  const onDragEnd = result => {
    const { source, destination } = result

    // dropped outside the list
    if (!destination) {
        return;
    }

    // dropped in same list
    if (source.droppableId === destination.droppableId) {
      // get list of items based on where the card was dropped
      const cardsSource = source.droppableId === 'hand' ? playerCards : playedCards
      const reorderedCards = reorder(
          cardsSource,
          source.index,
          destination.index
      );
      
      if (source.droppableId === 'hand') {
        setPlayerCards(reorderedCards)
      }

      if (source.droppableId === 'play-zone') {
        setPlayedCards(helpers.updateOrdered(playedCards, reorderedCards))
      }

    } else {
      const src = source.droppableId === 'hand' ? playerCards : playedCards
      const dest = destination.droppableId === 'hand' ? playerCards : playedCards

      const result = move(
          src,
          dest,
          source,
          destination
      );

      const card = result.removed;

      if (source.droppableId === 'hand') {
        if (waitingOnDefender) {
          handleDefend(card)
        }
        if (!waitingOnDefender) {
          handleAttack(card)
        }
        setPlayerCards(result.sourceClone)
        setPlayedCards(helpers.updateOrdered(playedCards, result.destClone))
      }

      // if (source.droppableId === 'play-zone') {
      //     setPlayedCards(helpers.updateOrdered(playedCards, result.sourceClone))
      //     setPlayerCards(result.destClone)
      // }
    }
  };

  const DraggableCard = ({ suit, value, index, isDragDisabled }) => {
    const imageUrl = `${value + 1}${suit[0].toUpperCase()}.png`
    // const imageUrl = `${value}-${suit[0]}.png`
    
    return (
      <Draggable
        key={`${suit}${value}-draggable`}
        draggableId={`${suit}${value}`}
        index={index}
        isDragDisabled={dropDisabled}
      >
        {(provided, snapshot) => (
          <div
            className='card'
          >
            <img
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={
                props?.gameState?.trump === suit ? 'trump' : ''
              }
              style={{
                ...provided.draggableProps.style
              }}
              src={props.images[imageUrl]}>
              {provided.placeholder}
            </img>
          </div>
        )}          
      </Draggable>
    )
  }

  const SimpleCard = ({ suit, value }) => {
    const imageUrl = `${value + 1}${suit[0].toUpperCase()}.png`

    return (
      <div
        key={`${value}-${suit}-non-draggable`}
        className='card'>
        <img
          className={
            props?.gameState?.trump === suit ? 'trump' : ''
          }
          src={props.images[imageUrl]}>
        </img>
      </div>
    )
  }

  const PlayerCards = (props) => {
    return (
      <div
        className='hand'
      >
        {console.log('rendering hand')}
        {playerCards.map((card, index) => {
          return (
            <DraggableCard
              key={`${card.suit}-${card.value}`}
              {...card}
              index={index}
            />
          )
        })}
        <div className='card' style={{
          visibility: 'hidden'
        }}>
          {props.children}
        </div>
      </div>
    )
  }

  const DropZone = ({ children, isDraggingOver }) => {
    console.log('isDraggingOver', isDraggingOver);
    return (
      <div className={`zone ${isDraggingOver ? 'filled' : ''} ${dropDisabled? 'gone': ''}`}>
        <div style={{
          visibility: 'hidden'
        }}>
          {children}
        </div>
      </div>
    )
  }

  const Table = (props) => {
    return (
      <div className='played-cards'>
        {playedCards.map(card => {
          const { suit, value } = card
          return <SimpleCard key={`${suit}-${value}-key`} {...card} />
        })}
        {!dropDisabled && <Droppable
          droppableId='play-zone'
          direction='horizontal'
          isDropDisabled={dropDisabled}>
          {(provided, snapshot) => (
            <div
            ref={provided.innerRef}
            {...provided.droppableProps}>
              <DropZone isDraggingOver={snapshot.isDraggingOver}>
                {provided.placeholder}
              </DropZone>
            </div>
          )}
        </Droppable>
        }
        {props.children}
      </div>
    )
  }

  return (
    <>
      {props.error &&
          <div className='message'>
            {props.error}
          </div>
        }
      {!props.gameState && 
        <>
        {props.players?.map((player) => (
            // player.userName !== props.user.userName &&
          <div
            key={player.userName}
            className='opponent-chip'>
              {player.userName}
            </div>
        ))
        }
        {props.players.length < 6 && new Array(6 - props.players.length).fill('empty').map((empty, index) => (
          <div
          key={`empty-${index}`}
          className='opponent-chip dark'>
            empty
          </div>
        ))}
          {props.isHost && <button className='button' onClick={handleStartGame}>
            everyone's in
          </button>}
        </>
      }
      {props.gameState &&
        <>
        {message && (<div className="message">
          {message}
        </div>)}
        <div className="container">
          <DragDropContext
            onDragEnd={onDragEnd}>
            <Table/> 
            {canPickup && <button className='button pick-up' onClick={handlePickUp}>forfeit</button>}
            {canFinish && <button className='button next-round' onClick={handleNextRound}>finish attack</button>}
            <Droppable
              className='dropContainer'
              droppableId='hand'
              direction='horizontal'>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}>
                  <PlayerCards>
                    {provided.placeholder}
                  </PlayerCards>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        </>
      }
    </>
  )
}

const mapStateToProps = (state) => ({
  inRoom: state.rooms.inRoom,
  players: state.rooms.players,
  user: state.registration.user,
  gameState: state.game.gameState,
  error: state.game.error,
  isHost: state.rooms.isHost
})

export default connect(mapStateToProps)(Game)
