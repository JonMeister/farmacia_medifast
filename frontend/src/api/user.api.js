import axios from "axios";

const API_URL_USERS = "http://127.0.0.1:8000/api/users/";

export const GetAllUsers = () => {
  return axios.get(`${API_URL_USERS}`);
};

export const CreateUser = (user) => {
  return axios.post(`${API_URL_USERS}`, user);
};

export const UpdateUser = (id, user) => {
  return axios.put(`${API_URL_USERS}${id}/`, user);
};

export const DeleteUser = (id) => {
  return axios.delete(`${API_URL_USERS}${id}/`);
};
