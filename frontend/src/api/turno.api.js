import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Configurar axios con el token de autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token a todas las requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API de servicios
export const getServicios = async () => {
  try {
    const response = await apiClient.get("/servicios/");
    console.log("Respuesta de servicios:", response.data);
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    throw error;
  }
};

// API de turnos
export const crearTurno = async (servicioId, cedulaCliente) => {
  try {
    const response = await apiClient.post("/turnos/crear_turno/", {
      servicio_id: servicioId,
      cedula_cliente: cedulaCliente,
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear turno:", error);
    throw error;
  }
};

export const getTurnoActivoCliente = async (cedula) => {
  try {
    const response = await apiClient.get(
      `/turnos/turno_activo_cliente/?cedula=${cedula}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener turno activo:", error);
    throw error;
  }
};

export const getColaTurnos = async () => {
  try {
    const response = await apiClient.get("/turnos/cola_turnos/");
    console.log("Respuesta de cola_turnos:", response.data);
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener cola de turnos:", error);
    throw error;
  }
};

export const getTurnoActualCaja = async (cajaId) => {
  try {
    const response = await apiClient.get(
      `/turnos/turno_actual_caja/?caja_id=${cajaId}`
    );
    console.log("Respuesta de turno_actual_caja:", response.data);
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener turno actual de caja:", error);
    throw error;
  }
};

export const getEstadoCajas = async () => {
  try {
    const response = await apiClient.get("/turnos/estado_cajas/");
    console.log("Respuesta de estado_cajas:", response.data);
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener estado de cajas:", error);
    throw error;
  }
};

export const getTurnoActualGlobal = async () => {
  try {
    const response = await apiClient.get("/turnos/turno_actual_global/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener turno actual global:", error);
    throw error;
  }
};

export const cancelarTurno = async (turnoId) => {
  try {
    const response = await apiClient.post(`/turnos/${turnoId}/cancelar_turno/`);
    return response.data;
  } catch (error) {
    console.error("Error al cancelar turno:", error);
    throw error;
  }
};

// API para obtener información del cliente
export const getInfoCliente = async (cedula) => {
  try {
    const response = await apiClient.get(`/clients/?cc=${cedula}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener información del cliente:", error);
    throw error;
  }
};
