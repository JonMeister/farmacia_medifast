import axios from "axios";

// API URLs para todos los endpoints de usuarios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const API_URLS = {
  users: `${API_BASE_URL}/users/`,
  clients: `${API_BASE_URL}/clients/`,
  u_admin: `${API_BASE_URL}/u_admin/`,
  employee: `${API_BASE_URL}/employee/`,
};

// Tipos de roles disponibles
export const USER_ROLES = {
  cliente: "clients",
  administrador: "u_admin",
  empleado: "employee",
};

// Configurar header de autorización
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Token ${token}` } : {};
};

// === FUNCIONES PRINCIPALES (SOLO USERS ENDPOINT) ===

// Obtener todos los usuarios de todos los endpoints
export const GetAllUsersFromAllEndpoints = async () => {
  try {
    const headers = getAuthHeaders();

    const [usersResponse, clientsResponse, adminsResponse, employeesResponse] =
      await Promise.all([
        axios.get(API_URLS.users, { headers }),
        axios.get(API_URLS.clients, { headers }),
        axios.get(API_URLS.u_admin, { headers }),
        axios.get(API_URLS.employee, { headers }),
      ]);

    // Mapear datos de usuarios principales
    const usersData = usersResponse.data.map((user) => ({
      ...user,
      nombre: user.first_name,
      apellido: user.last_name,
      telefono: user.phone_number,
      rol: user.rol || "cliente",
    }));

    // Mapear datos de clientes
    const clientsData = clientsResponse.data.map((client) => ({
      id: client.user?.id, // ID del usuario base
      cc: client.user?.cc,
      nombre: client.user?.first_name,
      apellido: client.user?.last_name,
      email: client.user?.email,
      telefono: client.user?.phone_number,
      rol: "cliente",
      is_active: client.user?.is_active,
      prioritario: client.prioritario,
      // Mantener también el ID de la relación para referencia
      relationId: client.ID_Usuario,
    }));

    // Mapear datos de administradores
    const adminsData = adminsResponse.data.map((admin) => ({
      id: admin.user?.id, // ID del usuario base
      cc: admin.user?.cc,
      nombre: admin.user?.first_name,
      apellido: admin.user?.last_name,
      email: admin.user?.email,
      telefono: admin.user?.phone_number,
      rol: "administrador",
      is_active: admin.user?.is_active,
      // Mantener también el ID de la relación para referencia
      relationId: admin.ID_Usuario,
    }));

    // Mapear datos de empleados
    const employeesData = employeesResponse.data.map((employee) => ({
      id: employee.user?.id, // ID del usuario base
      cc: employee.user?.cc,
      nombre: employee.user?.first_name,
      apellido: employee.user?.last_name,
      email: employee.user?.email,
      telefono: employee.user?.phone_number,
      rol: "empleado",
      is_active: employee.user?.is_active,
      fecha_contratacion: employee.Fecha_contratacion,
      // Mantener también el ID de la relación para referencia
      relationId: employee.ID_Usuario,
    }));

    return {
      users: usersData,
      clients: clientsData,
      u_admin: adminsData,
      employee: employeesData,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

// Crear usuario SOLO en el endpoint de USERS (unificado)
export const CreateUserByRole = async (userData) => {
  try {
    const headers = getAuthHeaders();

    // Validar campos requeridos
    if (
      !userData.cc ||
      !userData.nombre ||
      !userData.apellido ||
      !userData.email ||
      !userData.telefono ||
      !userData.password
    ) {
      throw new Error("Todos los campos son requeridos");
    }

    // Validar fecha de contratación para empleados
    if (userData.rol === "empleado" && !userData.Fecha_contratacion) {
      throw new Error("La fecha de contratación es requerida para empleados");
    }

    // Validar formato de teléfono (debe empezar con 3 o 6 y tener 10 dígitos)
    const phoneRegex = /^[36]\d{9}$/;
    if (!phoneRegex.test(userData.telefono)) {
      throw new Error("El teléfono debe empezar con 3 o 6 y tener 10 dígitos");
    }

    // Validar formato de cédula (6-10 dígitos)
    const ccNumber = parseInt(userData.cc);
    if (isNaN(ccNumber) || ccNumber < 100000 || ccNumber > 9999999999) {
      throw new Error("La cédula debe tener entre 6 y 10 dígitos");
    }

    // Mapear campos para el backend
    const backendData = {
      cc: ccNumber,
      first_name: userData.nombre,
      last_name: userData.apellido,
      email: userData.email,
      phone_number: userData.telefono,
      password: userData.password,
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      dob: "1990-01-01T00:00:00Z", // Fecha por defecto en formato ISO
    };

    // Solo incluir rol si se especifica
    if (userData.rol && userData.rol.trim() !== "") {
      backendData.rol = userData.rol;

      // Incluir fecha de contratación para empleados
      if (userData.rol === "empleado" && userData.Fecha_contratacion) {
        backendData.Fecha_contratacion = userData.Fecha_contratacion;
      }

      // Incluir prioridad para clientes
      if (userData.rol === "cliente") {
        backendData.prioritario = userData.prioritario || false;
      }
    }

    console.log("Datos que se envían al backend:", backendData);

    const response = await axios.post(API_URLS.users, backendData, { headers });
    return response.data;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    throw error;
  }
};

// Actualizar usuario y manejar cambio de rol
export const UpdateUserWithRoleChange = async (
  userId,
  userData,
  currentEndpoint
) => {
  try {
    const headers = getAuthHeaders();

    // Mapear campos para el backend
    const backendData = {
      first_name: userData.nombre,
      last_name: userData.apellido,
      email: userData.email,
      phone_number: userData.telefono,
      rol: userData.rol,
      is_active: userData.is_active,
      replace_role_table: true, // Indicar al backend que debe reemplazar el rol (eliminar de tabla anterior)
    };

    // Solo incluir contraseña si se proporciona
    if (userData.password && userData.password.trim()) {
      backendData.password = userData.password;
    }

    // Incluir fecha de contratación para empleados
    if (userData.rol === "empleado" && userData.Fecha_contratacion) {
      backendData.Fecha_contratacion = userData.Fecha_contratacion;
    }

    // Incluir prioridad para clientes
    if (userData.rol === "cliente") {
      backendData.prioritario = userData.prioritario || false;
    }

    console.log("Actualizando usuario con datos:", backendData);

    // Actualizar directamente en el endpoint de users
    const response = await axios.put(
      `${API_URLS.users}${userId}/`,
      backendData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};

// Actualizar usuario manteniendo múltiples roles (comportamiento anterior)
export const UpdateUserKeepingMultipleRoles = async (
  userId,
  userData,
  currentEndpoint
) => {
  try {
    const headers = getAuthHeaders();

    // Mapear campos para el backend
    const backendData = {
      first_name: userData.nombre,
      last_name: userData.apellido,
      email: userData.email,
      phone_number: userData.telefono,
      rol: userData.rol,
      is_staff: userData.rol === "administrador",
      is_active: userData.is_active,
      add_to_role_table: true, // Indicar al backend que debe agregar a la tabla específica sin eliminar
    };

    // Solo incluir contraseña si se proporciona
    if (userData.password && userData.password.trim()) {
      backendData.password = userData.password;
    }

    // Incluir fecha de contratación para empleados
    if (userData.rol === "empleado" && userData.Fecha_contratacion) {
      backendData.Fecha_contratacion = userData.Fecha_contratacion;
    }

    console.log(
      "Actualizando usuario manteniendo múltiples roles:",
      backendData
    );

    // Actualizar directamente en el endpoint de users
    const response = await axios.put(
      `${API_URLS.users}${userId}/`,
      backendData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};

// Eliminar usuario del endpoint de USERS
export const DeleteUserFromEndpoint = async (userId, endpoint) => {
  try {
    const headers = getAuthHeaders();

    // Siempre eliminar desde el endpoint de users
    const response = await axios.delete(`${API_URLS.users}${userId}/`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

// Actualizar prioridad de cliente
export const UpdateClientPriority = async (clientId, prioritario) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.patch(
      `${API_URLS.clients}${clientId}/`,
      {
        prioritario: prioritario,
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar prioridad del cliente:", error);
    throw error;
  }
};

// === FUNCIONES HEREDADAS PARA COMPATIBILIDAD ===
export const GetAllUsers = () => {
  return axios.get(API_URLS.users, { headers: getAuthHeaders() });
};

export const CreateUser = (user) => {
  return axios.post(API_URLS.users, user, { headers: getAuthHeaders() });
};

export const UpdateUser = (id, user) => {
  return axios.put(`${API_URLS.users}${id}/`, user, {
    headers: getAuthHeaders(),
  });
};

export const DeleteUser = (id) => {
  return axios.delete(`${API_URLS.users}${id}/`, { headers: getAuthHeaders() });
};

export const GetAllClients = () => {
  return axios.get(API_URLS.clients, { headers: getAuthHeaders() });
};

export const GetAllAdmins = () => {
  return axios.get(API_URLS.u_admin, { headers: getAuthHeaders() });
};

export const GetAllEmployees = () => {
  return axios.get(API_URLS.employee, { headers: getAuthHeaders() });
};
