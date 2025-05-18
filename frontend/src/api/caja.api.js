import axios from "axios";

const API_URL_CAJAS = "http://127.0.0.1:8000/api/cajas/";

export const GetAllCajas = () => {
  return axios.get(`${API_URL_CAJAS}`);
};

export const GetCajerosDisponibles = () => {
  return axios.get(`${API_URL_CAJAS}cajeros_disponibles/`);
};

export const CreateCaja = (caja) => {
  return axios.post(`${API_URL_CAJAS}`, caja);
};

export const UpdateCaja = (id, caja) => {
  return axios.put(`${API_URL_CAJAS}${id}/`, caja);
};

export const DeleteCaja = (id) => {
  return axios.delete(`${API_URL_CAJAS}${id}/`);
};
