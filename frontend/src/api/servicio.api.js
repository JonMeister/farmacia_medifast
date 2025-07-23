import axios from "axios";

const API_URL_SERVICIO = "http://127.0.0.1:8000/api/servicios/";

// Configurar header de autorización
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  return token ? { Authorization: `Token ${token}` } : {};
};

export const GetAllServicios = () => {
  const headers = getAuthHeaders();
  return axios.get(`${API_URL_SERVICIO}?show_all=true`, { headers });
};

export const CreateServicio = (servicio) => {
  const headers = getAuthHeaders();
  // Transform frontend data to backend format
  const backendData = {
    Nombre: servicio.etiqueta,
    Descripcion: servicio.descripcion,
    Prioridad: servicio.prioridad ? 1 : 0,
    Estado: true, // New services are created as active
  };
  return axios.post(`${API_URL_SERVICIO}`, backendData, { headers });
};

export const UpdateServicio = (id, servicio) => {
  const headers = getAuthHeaders();
  // Transform frontend data to backend format
  const backendData = {
    Nombre: servicio.etiqueta,
    Descripcion: servicio.descripcion,
    Prioridad: servicio.prioridad ? 1 : 0,
    Estado: true, // Keep existing estado or set default
  };
  return axios.put(`${API_URL_SERVICIO}${id}/`, backendData, { headers });
};

export const DeleteServicio = (id) => {
  const headers = getAuthHeaders();
  return axios.delete(`${API_URL_SERVICIO}${id}/`, { headers });
};

export const DeactivateServicio = (id) => {
  const headers = getAuthHeaders();
  return axios.post(`${API_URL_SERVICIO}${id}/desactivar/`, {}, { headers });
};

export const ActivateServicio = (id) => {
  const headers = getAuthHeaders();
  return axios.post(`${API_URL_SERVICIO}${id}/activar/`, {}, { headers });
};

export const DeleteServicioPermanent = (id) => {
  const headers = getAuthHeaders();
  return axios.delete(`${API_URL_SERVICIO}${id}/`, { headers });
};
