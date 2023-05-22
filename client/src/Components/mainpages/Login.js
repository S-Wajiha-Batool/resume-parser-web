import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginAPI } from '../../API/UserAPI';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import picture from '../images/login-page.png'
import { } from '../UI/login.css'

function Login() {

  const navigate = useNavigate();
  const state = useContext(GlobalState)

  const [token, setToken] = state.UserAPI.token;
  const [isLogged, setIsLogged] = state.UserAPI.isLogged;
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState({
    email: '', password: ''
  })

  const onChangeInput = e => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value })
  }

  const loginSubmit = async e => {
    e.preventDefault()
    loginAPI({ ...user })
      .then(res => {
        localStorage.setItem('firstLogin', true);
        setIsLogged(true);
        showSuccessToast("Logged in successfully");
        navigate('/');
      })
      .catch(err => {
        console.log(err.response.data.err.msg)
        showErrorToast("Failed to login. Please try again")
      })
  }




  return (
    <div className='login-page' style={{ background: 'linear-gradient(to bottom right, #e6f7ff, #dfecf8, #e5f9cd, #f5eef8, #f9ece3)' }}>
      <div className='login-form-container'>
        <div className='login-card' style={{ width: '500px', height: '520px' }}>
          <div className="login-header" style={{ marginTop: '50px' }}>
            <h2 className='text1'>Login</h2>
          </div>
          <form>
            <div>
              <text className='label'>
                <p className='text1'>Email</p>
              </text>
              <input
                type='text'
                name='email'
                value={user.email}
                required
                onChange={onChangeInput}
                className='input'
              />
            </div>
            <div>
              <text className='label'>
                <p className='text1'>Password</p>
              </text>
              <input
                type='password'
                name='password'
                value={user.password}
                required
                onChange={onChangeInput}
                className='input'
              />
            </div>
            <div className='forgot-text' onClick={()=> navigate('/reset-password')}>Forgot Password?</div>
            <br/>
            <div >
              <button
                type='submit'
                onClick={loginSubmit}
                className='custom-btn login-btn'
                value='Submit'
              >
                Submit
              </button>
            </div>
            <div className='label' style={{ textAlign: 'center' }}>
              <text
                className='span.psw'
                onClick={() => navigate('/reset-password')}
              >
              </text>
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Login