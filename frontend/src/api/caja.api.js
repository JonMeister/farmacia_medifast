import axios from "axios";

const API_URL_CAJAS = "http://127.0.0.1:8000/api/caja/";

// Configurar header de autorización
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
};

export const GetAllCajas = () => {
  return axios.get(API_URL_CAJAS, { headers: getAuthHeaders() });
};

export const GetUsuariosDisponibles = () => {
  return axios.get(`${API_URL_CAJAS}usuarios_disponibles/`, {
    headers: getAuthHeaders(),
  });
};

export const GetTodosLosEmpleados = () => {
  return axios.get(`${API_URL_CAJAS}empleados_todos/`, {
    headers: getAuthHeaders(),
  });
};

export const CreateCaja = (caja) => {
  return axios.post(API_URL_CAJAS, caja, { headers: getAuthHeaders() });
};

export const UpdateCaja = (id, caja) => {
  return axios.put(`${API_URL_CAJAS}${id}/`, caja, {
    headers: getAuthHeaders(),
  });
};

export const DeleteCaja = (id) => {
  return axios.delete(`${API_URL_CAJAS}${id}/`, { headers: getAuthHeaders() });
};

export const ActivarCaja = (id) => {
  return axios.post(
    `${API_URL_CAJAS}${id}/activar/`,
    {},
    { headers: getAuthHeaders() }
  );
};

export const DesactivarCaja = (id) => {
  return axios.post(
    `${API_URL_CAJAS}${id}/desactivar/`,
    {},
    { headers: getAuthHeaders() }
  );
};
