import React, {useState} from 'react'
import { connect, useDispatch } from 'react-redux'

import { roomActions } from '../redux/actions/roomActions';

export const JoinRoom = (props) => {
  
  const dispatch = useDispatch()

  const [createRoomId, setCreateRoomId] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')

  const handleEnterCreateRoomId = (event) => {
    setCreateRoomId(event.target.value)
  }

  const handleEnterJoinRoomId = (event) => {
    setJoinRoomId(event.target.value)
  } 

  const handleCreateRoom = (event) => {
    event.preventDefault()
    dispatch(roomActions.addRoom(createRoomId))
    setCreateRoomId('')
  }

  const handleJoinRoom = (event) => {
    event.preventDefault()
    dispatch(roomActions.joinRoom(joinRoomId))
    setJoinRoomId('')
  }

  return (
    <div>
      {props.error}
      <form onSubmit={handleCreateRoom}>
        <div>
          <div>
            <input 
            onChange={handleEnterCreateRoomId}
            value={createRoomId}
            placeholder="Room name"
            id='createRoom'
            name='createRoom'
            type="text"
            />
          </div>
          <div>
          <button >
            Create
          </button>
        </div>
        </div>
      </form>

      <form onSubmit={handleJoinRoom}>
        <div>
          <div>
            <input 
            onChange={handleEnterJoinRoomId}
            type="text"
            value={joinRoomId}
            placeholder="Room code"
            />
          </div>
          <div>
          <button>
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
