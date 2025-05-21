import { useState, useEffect } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import {
  GetAllServicios,
  CreateServicio,
  UpdateServicio,
  DeleteServicio,
} from "../api/servicio.api";

export default function ServicioEditor() {
  const navigate = useNavigate();

  // Estados
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: "",
    etiqueta: "",
    prioridad: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar servicios al montar el componente
  useEffect(() => {
    fetchServicios();
  }, []);

  // Función para cargar servicios
  const fetchServicios = async () => {
    try {
      setLoading(true);
      const response = await GetAllServicios();
      setServicios(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError("No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
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
      descripcion: "",
      etiqueta: "",
      prioridad: false,
    });
    setShowForm(true);
  };

  // Mostrar formulario para editar
  const handleShowEditForm = (servicio) => {
    setEditingId(servicio.id);
    setFormData({
      descripcion: servicio.descripcion,
      etiqueta: servicio.etiqueta,
      prioridad: servicio.prioridad,
    });
    setShowForm(true);
  };

  // Cancelar edición/creación
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Guardar servicio (crear o actualizar)
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Actualizar servicio existente
        await UpdateServicio(editingId, formData);
        alert("Servicio actualizado con éxito");
      } else {
        // Crear nuevo servicio
        await CreateServicio(formData);
        alert("Servicio creado con éxito");
      }
      // Recargar datos
      fetchServicios();
      // Cerrar formulario
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar servicio:", error);
      alert("Error al guardar el servicio");
    }
  };

  // Eliminar servicio
  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro que desea eliminar este servicio?")) {
      try {
        await DeleteServicio(id);
        fetchServicios();
        alert("Servicio eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        alert("Error al eliminar el servicio");
      }
    }
  };

  // Seleccionar servicio
  const handleSelectServicio = (servicio) => {
    setSelectedServicio(servicio);
  };

  if (loading)
    return <div className="text-center mt-8">Cargando servicios...</div>;
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Contenedor principal con diseño responsive de 2 columnas */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna izquierda - Lista de servicios */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestión de Servicios</h2>
            <Button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={handleShowCreateForm}
            >
              Nuevo Servicio
            </Button>
          </div>

          {/* Lista de servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicios.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                No hay servicios disponibles
              </p>
            ) : (
              servicios.map((servicio) => (
                <div
                  key={servicio.id}
                  className={`flex flex-col p-5 border rounded-lg shadow-sm min-h-[240px] ${
                    selectedServicio?.id === servicio.id
                      ? "bg-green-50 border-green-500"
                      : ""
                  }`}
                >
                  <Button
                    className="w-full px-2 py-1 bg-zinc-400 hover:bg-slate-500 text-sm text-white rounded-lg"
                    onClick={() => {
                      handleSelectServicio(servicio);
                      navigate("/schedules", {
                        state: { servicio: servicio.etiqueta },
                      });
                    }}
                  >
                    {servicio.etiqueta}
                  </Button>

                  <p className="text-lg text-gray-600 flex-grow my-4 line-clamp-3">
                    {servicio.descripcion}
                  </p>

                  <div className="mt-auto w-full">
                    <div className="mb-3">
                      <span
                        className={`inline-block text-xs ${
                          servicio.prioridad
                            ? "bg-red-200 text-red-700"
                            : "bg-gray-200 text-gray-600"
                        } px-2 py-1 rounded-full`}
                      >
                        {servicio.prioridad
                          ? "Prioridad Alta"
                          : "Prioridad Normal"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-md w-full flex justify-center items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowEditForm(servicio);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded-md w-full flex justify-center items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(servicio.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel de servicio seleccionado - Solo visible en modo móvil cuando no se muestra el formulario */}
          {selectedServicio && !showForm && (
            <div className="lg:hidden mt-6 pt-6 border-t flex flex-col items-center space-y-4">
              <div className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                Servicio: {selectedServicio.etiqueta}
              </div>
              <div className="bg-yellow-700 text-white font-bold rounded-lg p-4 w-48 text-center">
                <span className="block">
                  Prioridad: {selectedServicio.prioridad ? "Alta" : "Normal"}
                </span>
                <span className="block">ID: {selectedServicio.id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Formulario o detalles del servicio */}
        {(showForm || selectedServicio) && (
          <div className="lg:w-2/5 xl:w-1/3 bg-white rounded-xl shadow p-5 h-fit">
            {showForm ? (
              /* Formulario de creación/edición */
              <>
                <h2 className="text-2xl font-semibold mb-4 pb-2">
                  {editingId ? "Editar Servicio" : "Nuevo Servicio"}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Etiqueta
                    </label>
                    <input
                      type="text"
                      name="etiqueta"
                      value={formData.etiqueta}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="prioridad"
                      checked={formData.prioridad}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label className="text-sm">Prioridad Alta</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                      {editingId ? "Actualizar" : "Crear"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Detalles del servicio seleccionado - Solo visible en pantallas grandes */
              selectedServicio && (
                <div className="hidden lg:flex flex-col items-center space-y-5">
                  <h2 className="text-xl font-semibold self-start mb-2">
                    Detalles del servicio
                  </h2>

                  <div className="w-full bg-green-600 text-white px-6 py-3 rounded-lg text-center font-medium text-lg">
                    {selectedServicio.etiqueta}
                  </div>

                  <div className="w-full bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700 mb-4">
                      {selectedServicio.descripcion}
                    </p>

                    <div className="flex justify-between items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedServicio.prioridad
                            ? "bg-red-200 text-red-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {selectedServicio.prioridad
                          ? "Prioridad Alta"
                          : "Prioridad Normal"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {selectedServicio.id}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                      onClick={() => handleShowEditForm(selectedServicio)}
                    >
                      Editar Servicio
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                      onClick={() => {
                        navigate("/schedules", {
                          state: { servicio: selectedServicio.etiqueta },
                        });
                      }}
                    >
                      Programar
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
