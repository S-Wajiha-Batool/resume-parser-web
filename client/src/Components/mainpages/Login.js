import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginAPI } from '../../API/UserAPI';
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
                alert("Logged in successfully")
                setToken(res.data.data.accessToken)
                setIsLogged(true)
                //window.location.href = '/'
                navigate('/');
            })
            .catch(err => {
                //console.log(err.response.data)
                alert(err.response.data.error.msg)
            })
    }


    return (
        <div className='container col-md-6'  >
            <div className='card mt-4'>

                <div className="card-header">
                    <h4 style={{ textAlign: 'center' }}>Login</h4>
                </div>

                <div className='card-body'>
                    <form onSubmit={loginSubmit}>
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
                                //placeholder='Password'
                                name='password'
                                value={user.password}
                                required
                                onChange={onChangeInput}
                                className='form-control form-group' />
                        </div>

                        <button type='submit'
                            className='btn btn-danger btn-block'
                            variant='primary'
                            value='Submit'>Submit
                        </button>



                    </form>

                    <div className="text-muted " >
                        Don't have an account?
                    </div>

                    <a href="/register" className="btn btn-outline-secondary btn-sm" role="button" aria-pressed="true">Register</a>

                </div>
            </div>
        </div>
    )
}

export default Login