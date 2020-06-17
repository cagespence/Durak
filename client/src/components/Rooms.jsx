import React, {useState} from 'react'
import { connect, useDispatch } from 'react-redux'

import { roomActions } from '../redux/actions/roomActions';

export const JoinRoom = (props) => {
  
  const dispatch = useDispatch()

  const [joinRoomId, setJoinRoomId] = useState('')


  const handleEnterJoinRoomId = (event) => {
    setJoinRoomId(event.target.value)
  } 

  const handleCreateRoom = (event) => {
    event.preventDefault()
    const roomID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    dispatch(roomActions.addRoom(roomID))
  }

  const handleJoinRoom = (event) => {
    event.preventDefault()
    dispatch(roomActions.joinRoom(joinRoomId))
    setJoinRoomId('')
  }

  return (
    <div>
      {props.error &&
        <div className='message'>
          {props.error}
        </div>
      }
      <button onClick={handleCreateRoom} className='button'>
        new game
      </button>
      <form onSubmit={handleJoinRoom}>
        <div>
          <div>
            <input 
            onChange={handleEnterJoinRoomId}
            type="text"
            value={joinRoomId}
            placeholder="Room code"
            />
            <button disabled={joinRoomId.length < 1} className='button'>
            Join
          </button>
          </div>
        </div>
      </form>
    </div>
  )
}

const mapStateToProps = (state) => ({
    rooms: state.rooms.rooms,
    inRoom: state.rooms.inRoom,
    error: state.rooms.error,
    user: state.registration.user
})

export default connect(mapStateToProps)(JoinRoom)
