import React, { useState, useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'

export const Lobby = (props) => {
  const dispatch = useDispatch()
  const handleStartGame = (event) => {
    event.preventDefault()
    dispatch(gameActions.startGame(props.inRoom))
  }

  return (
    <>
      {props.players?.map((player) => (
        <div
          key={player.userName}
          className='opponent-chip'>
            {player.userName}
        </div>
      ))}
      {props.players.length < 6 && new Array(6 - props.players.length).fill('empty').map((empty, index) => (
        <div
        key={`empty-${index}`}
        className='opponent-chip dark'>
          empty
        </div>
      ))}
      {props.isHost ? 
        <button className='button' onClick={handleStartGame}>
          everyone's in
        </button>
        :
        <div className="message">
          waiting on the host to start
        </div> }
    </>

  )
}

const mapStateToProps = (state) => ({
  inRoom: state.rooms.inRoom,
  players: state.rooms.players,
  user: state.registration.user,
  error: state.game.error,
  isHost: state.rooms.isHost
})

export default connect(mapStateToProps)(Lobby)
