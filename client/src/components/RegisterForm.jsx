import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';

import { userActions } from '../redux/actions/userActions';
import { roomActions } from '../redux/actions/roomActions';

const RegisterForm = () => {

  const dispatch = useDispatch();

  const [userName, setUserName] = useState('');

  const handleRegister = (e) => {
    e.preventDefault()
    dispatch(userActions.register(userName))
    setUserName('')
  }

  useEffect(() => {
    dispatch(roomActions.getRooms)
  }, [dispatch])

  const handleEnterName = (event) => {
    setUserName(event.target.value)
  } 

  return (
    <form onSubmit={handleRegister}>
      <p className='login-message'>login to play</p>
      <div>
        <div>
          <div>
            <input 
              onChange={handleEnterName}
              value={userName}
              placeholder="Username" 
              id='userName' 
              name='userName' 
              type='text'
            />
          </div>
          <div>
            <button>
              Join
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default RegisterForm