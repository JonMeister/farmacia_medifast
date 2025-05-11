import axios from 'axios'

export const GetAllUsers = () => {
    return axios.get('http://127.0.0.1:8000/api/users/')
}