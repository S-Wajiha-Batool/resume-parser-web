import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

export default function CVAPI() {
    const [allCvs, setAllCvs] = useState([]);
    const [callbackCv, setCallbackCv] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [cvAgainstJdTableData, setCvAgainstJdTableData] = useState([])

    
    return {
        allCvs : [allCvs, setAllCvs],
        callbackCv: [callbackCv, setCallbackCv],
        tableData: [tableData, setTableData],
        cvAgainstJdTableData: [cvAgainstJdTableData, setCvAgainstJdTableData]
    }
}

export const parseCvsAPI = async (cvs, token) => {
    return await axios.post(`/api/cv/parse_cv`, cvs, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getAllCvsAPI = async (token) => {
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

export const deleteCvAgainstJdAPI = async (id, cv, token) => {
    return await axios.patch(`/api/cv/delete_cv_against_jd/${id}`, cv, {
        headers: {token: `Bearer ${token}`}
    })
}

export const deleteCVAPI = async (id, jd, token) => {
    return await axios.patch(`/api/cv/delete_cv/${id}`, jd, {
        headers: {token: `Bearer ${token}`}
    })
}

export const getIncreasedCvsAPI = async (token) => {
    return await axios.get(`/api/cv/increased_cvs`, {
        headers: {token: `Bearer ${token}`}
    })
}
