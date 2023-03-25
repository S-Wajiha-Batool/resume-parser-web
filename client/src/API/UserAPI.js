import { useState, useEffect } from 'react'
import { showErrorToast } from '../Components/utilities/Toasts'
import axios from 'axios'
let timer = null

export default function UserAPI() {
    const [isLogged, setIsLogged] = useState(false)
    const [user, setUser] = useState([])
    const [token, setToken] = useState(false)
    const [userCallback, setUserCallback] = useState(false)
    console.log('token', token)
    console.log('logged', isLogged)
    console.log(localStorage.getItem('firstLogin'))
    const firstLogin = localStorage.getItem('firstLogin')

    useEffect(() => {
        if (firstLogin) {
            const refreshToken = async () => {
                await axios.get("/api/user/refresh_token")
                    .then(res => {
                        console.log('refresh')
                        timer = setTimeout(() => {
                            refreshToken()
                        }, 60 * 60 * 1000)
                        console.log(res.data)
                        setToken(res.data.data)
                        setIsLogged(true)
                    })
                    .catch(err => {
                        setIsLogged(false)
                        //setIsAdmin(false)
                        setToken(false)
                        setUser(false)
                        localStorage.removeItem('firstLogin')
                        alert(err.response.data.error.msg)
                        clearTimeout(timer);
                    })
            }
            refreshToken()
        }
    }, [localStorage.getItem('firstLogin')])

    useEffect(() => {
        if (token) {
            const getUser = async () => {
                try {
                    await axios.get(`/api/user/profile`, {
                        headers: { token: `Bearer ${token}` }
                    })
                        .then(res => {
                            console.log(res.data)
                            setUser(res.data.data)
                        })
                        .catch(err => {
                            console.log(err.response.data)
                            setIsLogged(false)
                            setToken(false)
                            alert(err.response.data.error.msg)
                        })
                } catch (err) {
                    alert(err.response.data.error.msg)
                    setIsLogged(false)
                    setToken(false)
                }
            }
            getUser()
        }
        else {
            setIsLogged(false)
            //showErrorToast("Please login to proceed")
        }
    }, [token, userCallback])

    return {
        isLogged: [isLogged, setIsLogged],
        user: [user, setUser],
        token: [token, setToken],
    }
}

export const loginAPI = async (user) => {
    return await axios.post("api/user/login", user)
}

export const registerAPI = async (user) => {
    return await axios.post("api/user/register", user)
}

export const logoutAPI = async (token) => {
    console.log('in')
    return await axios.get("api/user/logout", {
        headers: {token: `Bearer ${token}`}
        }
    )
}

export const getUserAPI = async (id, token) => {
    console.log('in')
    return await axios.get(`/api/user/profile/${id}`, {
        headers: {token: `Bearer ${token}`}
        }
    )
}

export const allUsersAPI = async () => {
    return await axios.get('api/user/all_users')
}



