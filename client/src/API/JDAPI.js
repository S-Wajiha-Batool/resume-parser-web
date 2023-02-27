import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

export default function JDAPI() {
    const [allJDs, setAllJDs] = useState([]);
    const [callback, setCallback] = useState(false);
    const [callbackJdDetails, setCallbackJdDetails] = useState(false)
    
    return {
        allJDs : [allJDs, setAllJDs],
        callback: [callback, setCallback],
        callbackJdDetails: [callbackJdDetails, setCallbackJdDetails]

    }
}

export const getAllJdsAPI = async (token) => {
    console.log(token)
    return await axios.get(`/api/jd/get_jd`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getJdAPI = async (id, token) => {
    return await axios.get(`/api/jd/get_jd/${id}`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const addJdAPI = async (jd, token) => {
    return await axios.post(`/api/jd/upload_jd`, jd, {
        headers: {token: `Bearer ${token}`}
    })
}

export const deleteJdAPI = async (id, jd, token) => {
    console.log(id)
    return await axios.patch(`/api/jd/delete_jd/${id}`, jd, {
        headers: {token: `Bearer ${token}`}
    })
}

