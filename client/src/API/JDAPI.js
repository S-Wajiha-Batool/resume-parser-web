import axios from 'axios'
import { useState, useEffect } from 'react'

export default function JDAPI() {
    const [allJDs, setAllJDs] = useState([]);
    
    return {
        allJDs : [allJDs, setAllJDs]
    }
}

export const getAllJDsAPI = async (token) => {
    console.log(token)
    return await axios.get(`api/jd/get_jd`, {
        headers: {token: `Bearer ${token}`}
    })
}