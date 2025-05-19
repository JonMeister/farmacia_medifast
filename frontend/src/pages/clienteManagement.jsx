import { useState, useEffect } from "react";
import {
  GetAllUsers,
  DeleteUser,
  UpdateUser,
  CreateUser,
} from "../api/user.api";

export default function ClientManagement({ users }) {

  const isStaff = localStorage.getItem("is_staff") === "true"; 

  if (!isStaff) {
    return <p>No tienes permiso para acceder a esta sección.</p>;
  }
  
  console.log("Users recibidos:", users);
  const [allClients, setAllClients] = useState(
    Array.isArray(users) ? users : []
  );
  const [clients, setClients] = useState(Array.isArray(users) ? users : []);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Formularios
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    prioridad: false,
    is_staff: false,
    is_cajero: false,
    is_client: true,
  });

  const [newUserForm, setNewUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    cc: "",
    phone_number: "",
    password: "",
    dob: new Date().toISOString().slice(0, 16),
    prioridad: false,
    is_staff: false,
    is_cajero: false,
    is_client: true,
    is_active: true,
  });

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Llenar formulario de edición cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      setEditForm({
        first_name: selectedClient.first_name || "",
        last_name: selectedClient.last_name || "",
        phone_number: selectedClient.phone_number || "",
        prioridad: selectedClient.prioridad || false,
        is_staff: selectedClient.is_staff || false,
        is_cajero: selectedClient.is_cajero || false,
        is_client:
          selectedClient.is_client !== undefined
            ? selectedClient.is_client
            : true,
      });
    }
  }, [selectedClient]);

  // Inicializar datos si es necesario
  useEffect(() => {
    if (!users || users.length === 0) {
      const loadUsers = async () => {
        try {
          const response = await GetAllUsers();
          if (response.data && Array.isArray(response.data)) {
            setAllClients(response.data);
            setClients(response.data);
          }
        } catch (error) {
          console.error("Error al cargar usuarios:", error);
        }
      };
      loadUsers();
    }
  }, [users]);

  // Buscar usuarios
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === "") {
      setClients(allClients);
    }
  };

  const executeSearch = (term = searchTerm, clientList = allClients) => {
    if (!term) {
      setClients(clientList);
      return;
    }

    const lowerCaseSearch = term.toLowerCase();
    const filteredClients = clientList.filter(
      (client) =>
        (client.first_name &&
          client.first_name.toLowerCase().includes(lowerCaseSearch)) ||
        (client.last_name &&
          client.last_name.toLowerCase().includes(lowerCaseSearch)) ||
        (client.cc && client.cc.toString().includes(lowerCaseSearch)) ||
        (client.phone_number &&
          client.phone_number.toString().includes(lowerCaseSearch)) ||
        (client.email && client.email.toLowerCase().includes(lowerCaseSearch))
    );
    setClients(filteredClients);
  };

  // Seleccionar cliente para editar
  const handleSelect = (client) => {
    if (selectedClient && selectedClient.id === client.id) {
      // Si ya está seleccionado, deseleccionar
      setSelectedClient(null);
    } else {
      // Seleccionar nuevo cliente y ocultar formulario de añadir
      setSelectedClient(client);
      setShowAddForm(false);
    }
  };

  // Toggle para mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Funciones para los formularios - MODIFICADAS para roles exclusivos
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si es un checkbox de rol, hacer exclusivo
    if (
      type === "checkbox" &&
      (name === "is_staff" || name === "is_cajero" || name === "is_client")
    ) {
      if (checked) {
        // Si se marca uno, desmarcar los otros
        setEditForm({
          ...editForm,
          is_staff: name === "is_staff" ? true : false,
          is_cajero: name === "is_cajero" ? true : false,
          is_client: name === "is_client" ? true : false,
        });
      } else {
        // Si se desmarca el único rol seleccionado, no permitirlo
        // Al menos debe tener un rol
        if (
          (name === "is_staff" && !editForm.is_cajero && !editForm.is_client) ||
          (name === "is_cajero" && !editForm.is_staff && !editForm.is_client) ||
          (name === "is_client" && !editForm.is_staff && !editForm.is_cajero)
        ) {
          return; // No permitir desmarcar el único rol
        }

        setEditForm({
          ...editForm,
          [name]: false,
        });
      }
    } else {
      // Comportamiento normal para otros campos
      setEditForm({
        ...editForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si es un checkbox de rol, hacer exclusivo
    if (
      type === "checkbox" &&
      (name === "is_staff" || name === "is_cajero" || name === "is_client")
    ) {
      if (checked) {
        // Si se marca uno, desmarcar los otros
        setNewUserForm({
          ...newUserForm,
          is_staff: name === "is_staff" ? true : false,
          is_cajero: name === "is_cajero" ? true : false,
          is_client: name === "is_client" ? true : false,
        });
      } else {
        // Si se desmarca el único rol seleccionado, no permitirlo
        if (
          (name === "is_staff" &&
            !newUserForm.is_cajero &&
            !newUserForm.is_client) ||
          (name === "is_cajero" &&
            !newUserForm.is_staff &&
            !newUserForm.is_client) ||
          (name === "is_client" &&
            !newUserForm.is_staff &&
            !newUserForm.is_cajero)
        ) {
          return; // No permitir desmarcar el único rol
        }

        setNewUserForm({
          ...newUserForm,
          [name]: false,
        });
      }
    } else {
      // Comportamiento normal para otros campos
      setNewUserForm({
        ...newUserForm,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // Manejar guardado de edición
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await UpdateUser(selectedClient.id, editForm);

      // Actualizar cliente en la lista local
      const updatedClient = { ...selectedClient, ...editForm };
      const updatedAllClients = allClients.map((c) =>
        c.id === selectedClient.id ? updatedClient : c
      );

      setAllClients(updatedAllClients);

      // Actualizar la lista filtrada si hay una búsqueda activa
      if (searchTerm) {
        executeSearch(searchTerm, updatedAllClients);
      } else {
        setClients(updatedAllClients);
      }

      // Actualizar el cliente seleccionado con los cambios
      setSelectedClient(updatedClient);

      alert("Usuario actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar usuario");
    }
  };

  // Manejar agregar nuevo usuario
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await CreateUser(newUserForm);
      const newUser = response.data;

      // Actualizar listas
      const updatedAllClients = [...allClients, newUser];
      setAllClients(updatedAllClients);

      if (searchTerm) {
        executeSearch(searchTerm, updatedAllClients);
      } else {
        setClients(updatedAllClients);
      }

      // Limpiar formulario y cerrar
      setNewUserForm({
        first_name: "",
        last_name: "",
        email: "",
        cc: "",
        phone_number: "",
        password: "",
        dob: new Date().toISOString().slice(0, 16),
        prioridad: false,
        is_staff: false,
        is_cajero: false,
        is_client: true,
        is_active: true,
      });

      setShowAddForm(false);
      alert("Usuario creado con éxito");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert(
        "Error al crear usuario. Verifique que la cédula no esté duplicada."
      );
    }
  };

  // Manejar eliminar usuario
  const handleDelete = async (client) => {
    if (
      window.confirm(
        `¿Está seguro que desea eliminar al usuario ${client.first_name} ${client.last_name}?`
      )
    ) {
      try {
        // Llamar a la API para eliminar el usuario
        await DeleteUser(client.id);

        // Actualizar la lista de todos los clientes
        const updatedAllClients = allClients.filter((c) => c.id !== client.id);
        setAllClients(updatedAllClients);

        // Actualizar la lista filtrada
        if (searchTerm) {
          executeSearch(searchTerm, updatedAllClients);
        } else {
          setClients(updatedAllClients);
        }

        // Si el cliente eliminado es el seleccionado, deseleccionarlo
        if (selectedClient && selectedClient.id === client.id) {
          setSelectedClient(null);
        }

        alert("Usuario eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar usuario");
      }
    }
  };

  // Mostrar/ocultar formulario de añadir
  const toggleAddForm = () => {
    // Si hay un cliente seleccionado, deseleccionarlo
    if (showAddForm) {
      setShowAddForm(false);
    } else {
      setSelectedClient(null);
      setShowAddForm(true);
    }
  };

  // Función para mostrar prioridad como texto
  const checkPriority = (priority) => {
    return priority ? (
      <span className="text-red-500 font-bold">Alta</span>
    ) : (
      <span className="text-green-500">Normal</span>
    );
  };

  // Función para mostrar rol del usuario - MODIFICADA para mostrar un solo rol
  const checkType = (user) => {
    if (user.is_staff === true) {
      return "Administrador";
    } else if (user.is_cajero === true) {
      return "Cajero";
    } else if (user.is_client === true) {
      return "Cliente";
    } else {
      return "Sin rol";
    }
  };

  // Renderizar usuarios como tarjetas para vista móvil
  const renderClientCards = () => {
    return clients.map((client, index) => (
      <div
        key={client.id || index}
        className={`mb-4 p-4 border rounded-lg shadow ${
          selectedClient?.id === client.id ? "bg-green-50 border-green-500" : ""
        }`}
      >
        <div className="flex justify-between mb-2">
          <h3 className="font-bold">
            {client.first_name} {client.last_name}
          </h3>
          <div>
            <span className="text-sm text-gray-600">CC: {client.cc}</span>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-sm mb-1">
            <span className="font-medium">Teléfono:</span> {client.phone_number}
          </p>
          <p className="text-sm mb-1">
            <span className="font-medium">Prioridad:</span>{" "}
            {checkPriority(client.prioridad)}
          </p>
          <p className="text-sm">
            <span className="font-medium">Tipo:</span> {checkType(client)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSelect(client)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex-1"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(client)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex-1"
          >
            Eliminar
          </button>
        </div>
      </div>
    ));
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        <div
          className={`flex-1 bg-white rounded-xl shadow p-4 md:p-6 ${
            (selectedClient || showAddForm) && isMobileView ? "mb-4" : ""
          }`}
        >
          {/* Título ahora como encabezado independiente */}
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administra los usuarios del sistema, edita sus datos y crea nuevos
              usuarios.
            </p>
          </div>

          {/* Barra de búsqueda y botón de agregar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="border rounded px-3 py-2 flex-1 text-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyPress={(e) => e.key === "Enter" && executeSearch()}
                />
                <button
                  className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
                  onClick={() => executeSearch()}
                >
                  Buscar
                </button>
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto"
                onClick={toggleAddForm}
              >
                {showAddForm ? "Cancelar" : "Agregar Usuario"}
              </button>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                No se encontraron usuarios con ese criterio de búsqueda
              </p>
            </div>
          ) : isMobileView ? (
            <div className="mt-4">{renderClientCards()}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Apellido</th>
                    <th className="py-2">Identificación</th>
                    <th className="py-2">Prioridad</th>
                    <th className="py-2">Tipo</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr
                      key={client.id || index}
                      className={`border-b ${
                        selectedClient?.id === client.id ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="py-2">{client.first_name}</td>
                      <td className="py-2">{client.last_name}</td>
                      <td className="py-2">{client.cc}</td>
                      <td className="py-2">
                        {checkPriority(client.prioridad)}
                      </td>
                      <td className="py-2">{checkType(client)}</td>
                      <td className="py-2">
                        <div className="flex gap-2 mb-1 mt-1">
                          <button
                            onClick={() => handleSelect(client)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel lateral: Formulario de edición o Añadir nuevo usuario */}
        {(selectedClient || showAddForm) && (
          <div
            className={`${
              isMobileView ? "w-full" : "lg:w-1/3"
            } bg-white rounded-lg shadow p-4 md:p-6 relative overflow-hidden`}
          >
            {/* Mostrar formulario de nuevo usuario o edición según corresponda */}
            {showAddForm ? (
              <>
                <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 relative z-10">
                  Nuevo Usuario
                </h2>
                <form
                  onSubmit={handleAdd}
                  className="space-y-3 md:space-y-5 relative z-10 pr-0 md:pr-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-sm">Nombre</label>
                      <input
                        type="text"
                        name="first_name"
                        value={newUserForm.first_name}
                        onChange={handleNewUserChange}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Apellido</label>
                      <input
                        type="text"
                        name="last_name"
                        value={newUserForm.last_name}
                        onChange={handleNewUserChange}
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-sm">
                        Cédula ciudadanía *
                      </label>
                      <input
                        type="number"
                        name="cc"
                        value={newUserForm.cc}
                        onChange={handleNewUserChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">
                        Número de teléfono *
                      </label>
                      <input
                        type="number"
                        name="phone_number"
                        value={newUserForm.phone_number}
                        onChange={handleNewUserChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newUserForm.email}
                      onChange={handleNewUserChange}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Contraseña *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={newUserForm.password}
                        onChange={handleNewUserChange}
                        className="border rounded px-3 py-2 w-full pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? (
                          // Ícono de ojo abierto (visible)
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          // Ícono de ojo cerrado (oculto)
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="datetime-local"
                      name="dob"
                      value={newUserForm.dob}
                      onChange={handleNewUserChange}
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4 flex-wrap">
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="prioridad"
                        checked={newUserForm.prioridad}
                        onChange={handleNewUserChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Prioridad Alta</label>
                    </div>
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="is_client"
                        checked={newUserForm.is_client}
                        onChange={handleNewUserChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Cliente</label>
                    </div>
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="is_staff"
                        checked={newUserForm.is_staff}
                        onChange={handleNewUserChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Administrador</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_cajero"
                        checked={newUserForm.is_cajero}
                        onChange={handleNewUserChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Cajero</label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto mt-2"
                  >
                    Crear Usuario
                  </button>
                </form>
              </>
            ) : (
              <>
                <div
                  className="absolute top-0 right-0 h-full w-1/3 bg-green-700 hidden md:block"
                  style={{
                    clipPath: "polygon(100% 0, 0% 0, 100% 100%)",
                    borderRadius: "0 8px 8px 0",
                    transform: "scaleY(-1)",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                  }}
                ></div>

                <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 relative z-10">
                  Editar Usuario
                </h2>
                <form
                  onSubmit={handleEdit}
                  className="space-y-3 md:space-y-5 relative z-10 pr-0 md:pr-16"
                >
                  <div>
                    <label className="block mb-1 text-sm">Nombre</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleEditChange}
                      className="border rounded px-3 py-2 w-4/5"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Apellido</label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleEditChange}
                      className="border rounded px-3 py-2 w-4/5"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">
                      Número de teléfono
                    </label>
                    <input
                      type="number"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleEditChange}
                      className="border rounded px-3 py-2 w-4/5"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4 flex-wrap">
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="prioridad"
                        checked={editForm.prioridad}
                        onChange={handleEditChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Prioridad Alta</label>
                    </div>
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="is_client"
                        checked={editForm.is_client}
                        onChange={handleEditChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Cliente</label>
                    </div>
                    <div className="flex items-center mb-2 sm:mb-0 mr-4">
                      <input
                        type="checkbox"
                        name="is_staff"
                        checked={editForm.is_staff}
                        onChange={handleEditChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Administrador</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_cajero"
                        checked={editForm.is_cajero}
                        onChange={handleEditChange}
                        className="mr-2"
                      />
                      <label className="text-sm">Es Cajero</label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto mt-2"
                  >
                    Guardar Cambios
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
