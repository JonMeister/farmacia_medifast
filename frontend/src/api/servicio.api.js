import axios from "axios";

const API_URL_SERVICIO = "http://127.0.0.1:8000/api/servicios/";

export const GetAllServicios = () => {
  return axios.get(`${API_URL_SERVICIO}`);
};

export const CreateServicio = (servicio) => {
  return axios.post(`${API_URL_SERVICIO}`, servicio);
};

export const UpdateServicio = (id, servicio) => {
  return axios.put(`${API_URL_SERVICIO}${id}/`, servicio);
};

export const DeleteServicio = (id) => {
  return axios.delete(`${API_URL_SERVICIO}${id}/`);
};
