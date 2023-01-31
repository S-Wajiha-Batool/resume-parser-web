import axios from 'axios'

export const parseCvsAPI = async (cvs, token) => {
    return await axios.post(`/api/cv/parse_cv`, cvs, {
        headers: {token: `Bearer ${token}`}
    })
}