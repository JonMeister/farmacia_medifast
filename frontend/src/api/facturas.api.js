import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Configurar axios con el token de autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token a todas las requests
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");
    console.log(
      "🔑 Enviando request con token:",
      token ? `${token.substring(0, 10)}...` : "Sin token"
    );

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Error en interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response exitoso:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "❌ Error en response:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// API para obtener todas las facturas
export const getFacturas = async () => {
  try {
    console.log("🔄 Llamando API getFacturas...");
    const response = await apiClient.get("/facturas/");
    console.log("📦 Respuesta completa de facturas:", response.data);
    // Manejar respuesta paginada del backend
    const facturas = response.data.results || response.data;
    console.log("📦 Facturas procesadas:", facturas?.length || 0);
    return facturas;
  } catch (error) {
    console.error("❌ Error al obtener facturas:", error);

    // Log más detallado del error
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
      console.error("   Headers:", error.response.headers);
    } else if (error.request) {
      console.error("   No response received:", error.request);
    } else {
      console.error("   Error message:", error.message);
    }

    throw error;
  }
};

// API para obtener facturas por turno
export const getFacturasPorTurno = async (turnoId) => {
  try {
    const response = await apiClient.get(
      `/facturas/por_turno/?turno_id=${turnoId}`
    );
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener facturas por turno:", error);
    throw error;
  }
};

// API para obtener facturas por caja
export const getFacturasPorCaja = async (cajaId) => {
  try {
    const response = await apiClient.get(
      `/facturas/por_caja/?caja_id=${cajaId}`
    );
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener facturas por caja:", error);
    throw error;
  }
};

// API para obtener facturas por fecha
export const getFacturasPorFecha = async (fecha) => {
  try {
    const response = await apiClient.get(`/facturas/por_fecha/?fecha=${fecha}`);
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener facturas por fecha:", error);
    throw error;
  }
};

// API para obtener reporte de ventas
export const getReporteVentas = async (fechaInicio, fechaFin) => {
  try {
    const response = await apiClient.get(
      `/facturas/reporte_ventas/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
    return response.data.results || response.data;
  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error);
    throw error;
  }
};
