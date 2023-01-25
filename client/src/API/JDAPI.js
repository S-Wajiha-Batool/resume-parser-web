import axios from 'axios'
import { useState, useEffect } from 'react'

export default function JDAPI() {
    const [allJDs, setAllJDs] = useState([]);
    
    return {
        allJDs : [allJDs, setAllJDs]
    }
}

export const getAllJDsAPI = async (token) => {
    return await axios.get(`/api/jd/all_jds`, {
        headers: {token: `Bearer ${token}`}
    })
}