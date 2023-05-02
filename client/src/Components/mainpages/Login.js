import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginAPI } from '../../API/UserAPI';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import {showSuccessToast, showErrorToast} from '../utilities/Toasts';
import picture from '../images/login-page.png'
import {} from '../UI/login.css'

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
                showErrorToast(err.response.data.error.msg)
            })
    }

 


    return (
        <div className='login-page'>
            <div className = "login-image-container">
            <figure>
                <img src= {picture} alt = "login picture"/>
            </figure>
            </div>
            <div className='login-form-container'>
            <div className='login-card'>
                <div className="login-header">
                    <h2 className='text1'>Login</h2>
                </div>

                <div className='login-card'>
                    <form>
                        <div>
                            <text className='label' >
                               <p className='text1'>Email</p> 
                            </text>
                            <input type='text'
                                name='email'
                                value={user.email}
                                required
                                onChange={onChangeInput}
                                className='input' />
                            </div>
                        <div>

                            <text className='label'>
                            <p className='text1'>Password</p> 
                            </text>
                            <input type='password'
                                name='password'
                                value={user.password}
                                required
                                onChange={onChangeInput}
                                className='input' />
                            </div>
                        <div>
                        <button type='submit'
                        onClick={loginSubmit}
                            className='input'
                            value='Submit'
                            position='center'>Submit
                        </button>
                        </div>
                        <div className='label'>
                            <text className='span.psw' position = 'center' onClick={() => navigate('/reset-password')}><p className='text1'>Forgot Password?</p> </text>
                        </div>
                    </form>
                    <ToastContainer/>
                </div>
            </div>
            </div>
        </div>
    )
}

export default Login