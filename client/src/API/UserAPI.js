import { useState, useEffect } from 'react'
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

        console.log('login')
            if (firstLogin) {
                const refreshToken = async () => {
                    await axios.get("api/user/refresh_token")
                        .then(res => {
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
                            setUser(false)
                            localStorage.removeItem('firstLogin')
                            alert(err.response.data.error.msg)
                            console.log(err.response.data)
                            clearTimeout(timer);
                        }) 
                        
                    }
                    refreshToken()
        }
    }, [])
    
    useEffect(() => {
        if (token) {
            const getUser = async () => {
                try {
                    await axios.get(`api/user/profile`, {
                        headers: { token: `Bearer ${token}` }
                    })
                    .then(res => {
                        console.log(res.data)
                        setUser(res.data.data)
                    })
                    .catch(err => {
                        console.log(err.response.data)
                        alert(err.response.data.error.msg)
                        })

                } catch (err) {
                    alert(err.response.data.msg)
                }
            }
            getUser()
        }

            else{
                setIsLogged(false)
            }
    },[token,userCallback])

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

export const logoutAPI = async () => {
    return await axios.get('api/user/logout')
}

export const allUsersAPI = async () => {
    return await axios.get('api/user/all_users')
}


