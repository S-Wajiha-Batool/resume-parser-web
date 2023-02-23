import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

export default function CVAPI() {
    const [allCvs, setAllCvs] = useState([]);
    const [callback, setCallback] = useState(false);
    
    return {
        allCvs : [allCvs, setAllCvs],
        callback: [callback, setCallback]
    }
}

export const parseCvsAPI = async (cvs, token) => {
    return await axios.post(`/api/cv/parse_cv`, cvs, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getCvsAPI = async (token) => {
    return await axios.get(`/api/cv/get_cv`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getCvAPI = async (id, token) => {
    return await axios.get(`/api/cv/get_cv/${id}`, {
        headers: {token: `Bearer ${token}`}
    })
}

export const matchCvsAPI = async (jd, cvs, token) => {
    console.log(jd, cvs, token)
    return await axios.post(`/api/cv/match_cv`, {jd, cvs}, {
        headers: {token: `Bearer ${token}`}
    })
}