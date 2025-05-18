import { useState, useEffect } from "react";
import {
  GetAllCajas,
  GetCajerosDisponibles,
  CreateCaja,
  UpdateCaja,
  DeleteCaja,
} from "../api/caja.api";

export default function CajerosView() {
  // Estados
  const [cajas, setCajas] = useState([]);
  const [cajeros, setCajeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    numero: "",
    cajero: "",
    activa: true,
  });

  // Cargar datos al iniciar
  useEffect(() => {
    fetchCajas();
    fetchCajeros();
  }, []);

  // Obtener cajas
  const fetchCajas = async () => {
    try {
      const response = await GetAllCajas();
      setCajas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar cajas:", error);
      setLoading(false);
    }
  };

  // Obtener cajeros disponibles
  const fetchCajeros = async () => {
    try {
      const response = await GetCajerosDisponibles();
      setCajeros(response.data);
    } catch (error) {
      console.error("Error al cargar cajeros:", error);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Mostrar formulario para crear
  const handleShowCreateForm = () => {
    setEditingId(null);
    setFormData({
      numero: "",
      cajero: "",
      activa: true,
    });
    setShowForm(true);
  };

  // Mostrar formulario para editar
  const handleShowEditForm = (caja) => {
    setEditingId(caja.id);
    setFormData({
      numero: caja.numero,
      cajero: caja.cajero || "",
      activa: caja.activa,
    });
    setShowForm(true);
  };

  // Cancelar edición/creación
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Guardar caja (crear o actualizar)
  const handleSave = async () => {
    try {
      if (editingId) {
        // Actualizar caja existente
        await UpdateCaja(editingId, formData);
      } else {
        // Crear nueva caja
        await CreateCaja(formData);
      }
      // Recargar datos
      fetchCajas();
      fetchCajeros();
      // Cerrar formulario
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar caja:", error);
      alert("Error al guardar la caja");
    }
  };

  // Eliminar caja
  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar esta caja?")) {
      try {
        await DeleteCaja(id);
        fetchCajas();
        fetchCajeros();
        alert("Caja eliminada con éxito");
      } catch (error) {
        console.error("Error al eliminar caja:", error);
        alert("Error al eliminar la caja");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Cargando cajas...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Cajas</h1>
          <button
            onClick={handleShowCreateForm}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Nueva Caja
          </button>
        </div>

        {/* Formulario de Creación/Edición */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Editar Caja" : "Nueva Caja"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Número de Caja
                </label>
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Asignar Cajero
                </label>
                <select
                  name="cajero"
                  value={formData.cajero}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="">-- Seleccionar Cajero --</option>
                  {cajeros.map((cajero) => (
                    <option key={cajero.id} value={cajero.id}>
                      {cajero.first_name} {cajero.last_name}
                    </option>
                  ))}
                  {/* Para mantener el cajero actual en edición, si ya está asignado */}
                  {editingId &&
                    formData.cajero &&
                    !cajeros.some((c) => c.id === formData.cajero) && (
                      <option value={formData.cajero}>Cajero actual</option>
                    )}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activa"
                  checked={formData.activa}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm">Caja Activa</label>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                {editingId ? "Guardar Cambios" : "Crear Caja"}
              </button>
            </div>
          </div>
        )}

        {/* Lista de cajas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {cajas.length > 0 ? (
            cajas.map((caja) => (
              <div
                key={caja.id}
                className={`flex items-center border rounded-lg p-4 shadow hover:shadow-md transition ${
                  !caja.activa ? "bg-gray-100" : "bg-white"
                }`}
              >
                {/* Ícono de usuario */}
                <div className="w-1/4 flex justify-center items-center">
                  <div className="border rounded-full h-16 w-16 flex justify-center items-center text-2xl">
                    👤
                  </div>
                </div>

                {/* Info de la caja */}
                <div className="flex-1 ml-4">
                  <div className="flex justify-between items-center mb-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg inline-block w-3/4">
                      Caja {caja.numero}
                    </button>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        caja.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {caja.activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  {/* Nombre del cajero */}
                  <div className="font-semibold">Cajero:</div>
                  <div className="mb-3">
                    {caja.cajero_nombre || "Sin asignar"}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShowEditForm(caja)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(caja.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No hay cajas disponibles. ¡Agrega una nueva caja!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
