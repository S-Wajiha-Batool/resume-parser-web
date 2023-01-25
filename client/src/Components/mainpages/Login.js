import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginAPI } from '../../API/UserAPI';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import {showSuccessToast, showErrorToast} from '../utilities/Toasts';

function Login() {

    const navigate = useNavigate();
    const state = useContext(GlobalState)

    const [token, setToken] = state.UserAPI.token;
    const [isLogged, setIsLogged] = state.UserAPI.isLogged;


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
                //console.log(res.data)
                localStorage.setItem('firstLogin', true);
                //alert("Logged in successfully")
                showSuccessToast("Logged in successfully");
                setToken(res.data.data.accessToken);
                //setIsLogged(true)
                //window.location.href = '/'
                navigate('/');
            })
            .catch(err => {
                //console.log(err.response.data)
                //alert(err.response.data.error.msg)
                showErrorToast(err.response.data.error.msg)
            })
    }

 


    return (
        <div className='container col-md-8 d-flex align-items-center justify-content-center vh-100'>
            <div className='card'>

                <div className="card-header">
                    <h4 style={{ textAlign: 'center' }}>Login</h4>
                </div>

                <div className='card-body'>
                    <form>
                        <div className='form-group mb-3'>
                            <text style={{ marginTop: 5, marginBottom: 5, fontWeight: 500 }}>
                                Email
                            </text>
                            <input type='text'
                                name='email'
                                value={user.email}
                                required
                                onChange={onChangeInput}
                                className='form-control' />
                        </div>

                        <div className='form-group mb-3'>
                            <text style={{ marginTop: 5, marginBottom: 5, fontWeight: 500 }}>
                                Password
                            </text>
                            <input type='password'
                                name='password'
                                value={user.password}
                                required
                                onChange={onChangeInput}
                                className='form-control form-group' />
                        </div>
                        <div style={{textAlign: 'center'}}>
                        <button type='button'
                        onClick={loginSubmit}
                            className='btn btn-primary'
                            value='Submit'
                            position='center'>Submit
                        </button>
                        </div>
                    </form>
                    <ToastContainer />
                </div>
            </div>
            
        </div>
    )
}

export default Login