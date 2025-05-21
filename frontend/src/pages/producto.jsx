import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

// Datos de productos simulados
const PRODUCTOS_MUESTRA = [
  {
    id: 1,
    nombre: "Paracetamol",
    marca: "Genfar",
    tipo: "Analgésico",
    precio: 5000,
    descuento: 0,
    requireOrden: false,
    descripcion:
      "Medicamento para aliviar el dolor y reducir la fiebre. Actúa bloqueando la producción de ciertas sustancias que causan dolor e inflamación.",
    stock: 45,
    presentacion: "Tabletas 500mg x 10 und",
  },
  {
    id: 2,
    nombre: "Ibuprofeno",
    marca: "MK",
    tipo: "Antiinflamatorio",
    precio: 8000,
    descuento: 1000,
    requireOrden: false,
    descripcion:
      "Antiinflamatorio no esteroideo (AINE) utilizado para tratar el dolor, la fiebre y la inflamación.",
    stock: 32,
    presentacion: "Tabletas 400mg x 10 und",
  },
  {
    id: 3,
    nombre: "Omeprazol",
    marca: "La Santé",
    tipo: "Gastro",
    precio: 12000,
    descuento: 2000,
    requireOrden: false,
    descripcion:
      "Inhibidor de la bomba de protones que disminuye la cantidad de ácido producido en el estómago.",
    stock: 27,
    presentacion: "Cápsulas 20mg x 14 und",
  },
  {
    id: 4,
    nombre: "Loratadina",
    marca: "Bayer",
    tipo: "Antialérgico",
    precio: 7500,
    descuento: 0,
    requireOrden: false,
    descripcion:
      "Antihistamínico que reduce los síntomas de alergias como picazón, estornudos y secreción nasal.",
    stock: 40,
    presentacion: "Tabletas 10mg x 10 und",
  },
  {
    id: 5,
    nombre: "Amoxicilina",
    marca: "Genfar",
    tipo: "Antibiótico",
    precio: 15000,
    descuento: 3000,
    requireOrden: true,
    descripcion:
      "Antibiótico de amplio espectro utilizado para tratar una variedad de infecciones bacterianas.",
    stock: 18,
    presentacion: "Cápsulas 500mg x 50 und",
  },
  {
    id: 6,
    nombre: "Aspirina",
    marca: "Bayer",
    tipo: "Analgésico",
    precio: 4000,
    descuento: 500,
    requireOrden: false,
    descripcion:
      "Analgésico y antiinflamatorio que también actúa como anticoagulante. Útil para dolores leves y moderados.",
    stock: 55,
    presentacion: "Tabletas 100mg x 20 und",
  },
  {
    id: 7,
    nombre: "Losartán",
    marca: "MK",
    tipo: "Antihipertensivo",
    precio: 9000,
    descuento: 0,
    requireOrden: true,
    descripcion:
      "Medicamento que bloquea la acción de ciertas sustancias naturales que contraen los vasos sanguíneos.",
    stock: 22,
    presentacion: "Tabletas 50mg x 30 und",
  },
  {
    id: 8,
    nombre: "Metformina",
    marca: "La Santé",
    tipo: "Antidiabético",
    precio: 10000,
    descuento: 1500,
    requireOrden: true,
    descripcion:
      "Medicamento utilizado para tratar la diabetes tipo 2, mejora la sensibilidad a la insulina.",
    stock: 15,
    presentacion: "Tabletas 850mg x 30 und",
  },
];

export default function ProductosManagement() {
  const navigate = useNavigate();

  // Simulación de verificación de usuario staff
  // En una aplicación real, esto vendría de una autenticación
  const [isStaff, setIsStaff] = useState(true); // Siempre true para simulación

  // Estados
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    tipo: "",
    precio: 0,
    descuento: 0,
    requireOrden: false,
    descripcion: "",
    stock: 0,
    presentacion: "",
  });

  // Tipos predefinidos de medicamentos para selección en formulario
  const tiposMedicamentos = [
    "Analgésico",
    "Antiinflamatorio",
    "Antibiótico",
    "Antialérgico",
    "Antihipertensivo",
    "Antidiabético",
    "Gastro",
    "Hipolipemiante",
    "Otros",
  ];

  // Cargar productos al montar el componente (simulado)
  useEffect(() => {
    // Simular una carga de datos con retardo para imitar una API
    const fetchProductos = () => {
      setLoading(true);
      setTimeout(() => {
        setProductos(PRODUCTOS_MUESTRA);
        setLoading(false);
      }, 800); // 800ms de retardo simulado
    };

    fetchProductos();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    });
  };

  // Filtrar productos por búsqueda
  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar formulario para crear
  const handleShowCreateForm = () => {
    setEditingId(null);
    setFormData({
      nombre: "",
      marca: "",
      tipo: "",
      precio: 0,
      descuento: 0,
      requireOrden: false,
      descripcion: "",
      stock: 0,
      presentacion: "",
    });
    setShowForm(true);
    setSelectedProducto(null);
  };

  // Mostrar formulario para editar
  const handleShowEditForm = (producto) => {
    setEditingId(producto.id);
    setFormData({
      nombre: producto.nombre,
      marca: producto.marca,
      tipo: producto.tipo,
      precio: producto.precio,
      descuento: producto.descuento,
      requireOrden: producto.requireOrden,
      descripcion: producto.descripcion || "",
      stock: producto.stock || 0,
      presentacion: producto.presentacion || "",
    });
    setShowForm(true);
  };

  // Cancelar edición/creación
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Guardar producto (crear o actualizar) - Simulado con datos locales
  const handleSave = (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.nombre || !formData.marca || !formData.tipo) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    try {
      if (editingId) {
        // Actualizar producto existente (simulado)
        setProductos(
          productos.map((producto) =>
            producto.id === editingId
              ? { ...producto, ...formData, id: editingId }
              : producto
          )
        );
        alert("Producto actualizado con éxito");
      } else {
        // Crear nuevo producto (simulado)
        const nuevoId = Math.max(...productos.map((p) => p.id), 0) + 1;
        const nuevoProducto = {
          id: nuevoId,
          ...formData,
        };
        setProductos([...productos, nuevoProducto]);
        alert("Producto creado con éxito");
      }
      // Cerrar formulario
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    }
  };

  // Eliminar producto (simulado con datos locales)
  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro que desea eliminar este producto?")) {
      try {
        // Eliminar localmente
        setProductos(productos.filter((producto) => producto.id !== id));

        // Si el producto eliminado estaba seleccionado, deseleccionarlo
        if (selectedProducto && selectedProducto.id === id) {
          setSelectedProducto(null);
        }

        alert("Producto eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  // Seleccionar producto para ver detalles
  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setShowForm(false);
  };

  // Formatear precio
  const formatPrice = (price) => `$${price.toLocaleString()}`;

  // Restricción de acceso (simulado)
  if (!isStaff) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 inline-block">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Acceso Restringido
          </h2>
          <p className="text-gray-700">
            No tienes permiso para acceder a esta sección.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna izquierda - Lista de productos */}
        <div className="flex-1 bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestión de Productos</h2>
            <Button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={handleShowCreateForm}
            >
              Nuevo Producto
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar por nombre, marca o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Lista de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProductos.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                No hay productos disponibles
              </p>
            ) : (
              filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  className={`flex flex-col border rounded-lg shadow-sm cursor-pointer hover:shadow p-4 ${
                    selectedProducto?.id === producto.id
                      ? "bg-green-50 border-green-500"
                      : ""
                  }`}
                  onClick={() => handleSelectProducto(producto)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{producto.nombre}</h3>
                    {producto.requireOrden && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Requiere receta
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {producto.marca}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                      {producto.tipo}
                    </span>
                  </div>

                  <div className="text-sm mb-1">
                    Stock: <span className="font-medium">{producto.stock}</span>
                  </div>

                  <div className="text-sm mb-auto">{producto.presentacion}</div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-baseline">
                      {producto.descuento > 0 && (
                        <span className="line-through text-gray-500 text-sm mr-1">
                          {formatPrice(producto.precio)}
                        </span>
                      )}
                      <span className="font-bold text-blue-600">
                        {formatPrice(producto.precio - producto.descuento)}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowEditForm(producto);
                        }}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        title="Editar producto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(producto.id);
                        }}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                        title="Eliminar producto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna derecha - Formulario o detalles del producto */}
        {(showForm || selectedProducto) && (
          <div className="lg:w-2/5 xl:w-1/3 bg-white rounded-xl shadow p-5 h-fit">
            {showForm ? (
              <>
                <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">
                  {editingId ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Nombre*
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Marca*
                      </label>
                      <input
                        type="text"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Tipo*
                      </label>
                      <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposMedicamentos.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Precio*
                      </label>
                      <input
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Descuento
                      </label>
                      <input
                        type="number"
                        name="descuento"
                        value={formData.descuento}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Stock*
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Presentación
                      </label>
                      <input
                        type="text"
                        name="presentacion"
                        value={formData.presentacion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Ej: Tabletas 500mg x 10 und"
                      />
                    </div>
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
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireOrden"
                      name="requireOrden"
                      checked={formData.requireOrden}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="requireOrden" className="text-sm">
                      Requiere orden médica
                    </label>
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
              /* Detalles del producto seleccionado */
              selectedProducto && (
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold border-b pb-3 mb-4">
                    Detalles del producto
                  </h2>

                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedProducto.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm">
                        {selectedProducto.marca}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-sm">
                        {selectedProducto.tipo}
                      </span>
                      {selectedProducto.requireOrden && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-sm">
                          Requiere orden médica
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="mb-3">
                      <span className="block text-sm text-gray-500">
                        Presentación:
                      </span>
                      <span className="font-medium">
                        {selectedProducto.presentacion || "No especificada"}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="block text-sm text-gray-500">
                        Stock disponible:
                      </span>
                      <span className="font-medium">
                        {selectedProducto.stock}
                      </span>{" "}
                      unidades
                    </div>

                    <div className="mb-3">
                      <span className="block text-sm text-gray-500">
                        Precio:
                      </span>
                      <div className="flex items-baseline">
                        {selectedProducto.descuento > 0 && (
                          <span className="line-through text-gray-500 mr-2">
                            {formatPrice(selectedProducto.precio)}
                          </span>
                        )}
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(
                            selectedProducto.precio - selectedProducto.descuento
                          )}
                        </span>
                        {selectedProducto.descuento > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            Descuento: {formatPrice(selectedProducto.descuento)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedProducto.descripcion && (
                    <div className="mb-6">
                      <span className="block text-sm text-gray-500 mb-1">
                        Descripción:
                      </span>
                      <p className="text-gray-700">
                        {selectedProducto.descripcion}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                      onClick={() => handleShowEditForm(selectedProducto)}
                    >
                      Editar Producto
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      onClick={() => handleDelete(selectedProducto.id)}
                    >
                      Eliminar
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
