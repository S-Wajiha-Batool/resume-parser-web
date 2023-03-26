import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

export default function JDAPI() {
    const [allJDs, setAllJDs] = useState([]);
    const [callbackJd, setCallbackJd] = useState(false);
    const [callbackJdDetails, setCallbackJdDetails] = useState(false)
    const [tableData, setTableData] = useState([])
    
    return {
        allJDs : [allJDs, setAllJDs],
        callbackJd: [callbackJd, setCallbackJd],
        callbackJdDetails: [callbackJdDetails, setCallbackJdDetails],
        tableData: [tableData, setTableData]

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
    return await axios.patch(`/api/jd/delete_jd/${id}`, jd, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getIncreasedJdsAPI = async (token) => {
    return await axios.get(`/api/jd/increased_jds`, {
        headers: {token: `Bearer ${token}`}
    })
}

