import axios from 'axios'
import { useState, useEffect } from 'react'

export default function JDAPI() {
    const [allJDs, setAllJDs] = useState([]);
    
    return {
        allJDs : [allJDs, setAllJDs]
    }
}

export const getAllJdsAPI = async (token) => {
    console.log(token)
    return await axios.get(`api/jd/get_jd`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getJdAPI = async (id, token) => {
    return await axios.get(`/api/jd/get_jd/${id}`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const addJdAPI = async (jd, token) => {
    return await axios.post(`/api/jd/`)
}

