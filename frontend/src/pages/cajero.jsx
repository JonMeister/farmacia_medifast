import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Datos estáticos para simular usuarios en cola (nuevos 5 usuarios)
const USUARIOS_COLA_INICIAL = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    turno: "A001",
    servicio: "Medicamentos",
    prioridad: false,
  },
  {
    id: 2,
    nombre: "María",
    apellido: "López",
    turno: "A002",
    servicio: "Medicamentos",
    prioridad: true,
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "González",
    turno: "A003",
    servicio: "Consulta",
    prioridad: false,
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "Martínez",
    turno: "A004",
    servicio: "Medicamentos",
    prioridad: false,
  },
  {
    id: 5,
    nombre: "Pedro",
    apellido: "Rodríguez",
    turno: "A005",
    servicio: "Consulta",
    prioridad: true,
  },
  // Nuevos usuarios adicionales
  {
    id: 6,
    nombre: "Luisa",
    apellido: "Ramírez",
    turno: "A006",
    servicio: "Medicamentos",
    prioridad: false,
  },
  {
    id: 7,
    nombre: "Roberto",
    apellido: "Fernández",
    turno: "A007",
    servicio: "Consulta",
    prioridad: true,
  },
  {
    id: 8,
    nombre: "Sofia",
    apellido: "Torres",
    turno: "A008",
    servicio: "Medicamentos",
    prioridad: false,
  },
  {
    id: 9,
    nombre: "Miguel",
    apellido: "Díaz",
    turno: "A009",
    servicio: "Medicamentos",
    prioridad: false,
  },
  {
    id: 10,
    nombre: "Carmen",
    apellido: "Vargas",
    turno: "A010",
    servicio: "Consulta",
    prioridad: true,
  },
];

// Lista estática de productos con indicador de si requieren orden médica
const PRODUCTOS = [
  {
    id: 1,
    nombre: "Paracetamol",
    marca: "Genfar",
    tipo: "Analgésico",
    precio: 5000,
    descuento: 0,
    requireOrden: false,
  },
  {
    id: 2,
    nombre: "Ibuprofeno",
    marca: "MK",
    tipo: "Antiinflamatorio",
    precio: 8000,
    descuento: 1000,
    requireOrden: false,
  },
  {
    id: 3,
    nombre: "Omeprazol",
    marca: "La Santé",
    tipo: "Gastro",
    precio: 12000,
    descuento: 2000,
    requireOrden: false,
  },
  {
    id: 4,
    nombre: "Loratadina",
    marca: "Bayer",
    tipo: "Antialérgico",
    precio: 7500,
    descuento: 0,
    requireOrden: false,
  },
  {
    id: 5,
    nombre: "Amoxicilina",
    marca: "Genfar",
    tipo: "Antibiótico",
    precio: 15000,
    descuento: 3000,
    requireOrden: true,
  },
  {
    id: 6,
    nombre: "Aspirina",
    marca: "Bayer",
    tipo: "Analgésico",
    precio: 4000,
    descuento: 500,
    requireOrden: false,
  },
  {
    id: 7,
    nombre: "Losartán",
    marca: "MK",
    tipo: "Antihipertensivo",
    precio: 9000,
    descuento: 0,
    requireOrden: true,
  },
  {
    id: 8,
    nombre: "Metformina",
    marca: "La Santé",
    tipo: "Antidiabético",
    precio: 10000,
    descuento: 1500,
    requireOrden: true,
  },
  {
    id: 9,
    nombre: "Simvastatina",
    marca: "Genfar",
    tipo: "Hipolipemiante",
    precio: 14000,
    descuento: 2000,
    requireOrden: true,
  },
  {
    id: 10,
    nombre: "Diclofenaco",
    marca: "MK",
    tipo: "Antiinflamatorio",
    precio: 6500,
    descuento: 0,
    requireOrden: false,
  },
];

export default function Cajero() {
  // Estados
  const [usuariosCola, setUsuariosCola] = useState(USUARIOS_COLA_INICIAL);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cajaActiva, setCajaActiva] = useState(true);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [totalCompra, setTotalCompra] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState(PRODUCTOS);
  const [ordenRecibida, setOrdenRecibida] = useState(false);

  // Nuevos estados
  const [seleccionTipoAtencion, setSeleccionTipoAtencion] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);

  // Datos del cajero (simulados)
  const cajero = {
    nombre: "Laura González",
    cedula: "1098765432",
    caja: 3,
  };

  // Filtrar productos según la búsqueda y si requieren orden médica
  useEffect(() => {
    let productos = PRODUCTOS;

    // Si no hay orden médica, filtrar productos que la requieren
    if (!ordenRecibida) {
      productos = productos.filter((producto) => !producto.requireOrden);
    }

    // Aplicar filtro de búsqueda
    setProductosFiltrados(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.tipo.toLowerCase().includes(busqueda.toLowerCase())
      )
    );
  }, [busqueda, ordenRecibida]);

  // Calcular total de la compra
  useEffect(() => {
    const total = carrito.reduce((sum, item) => {
      return sum + (item.precio - item.descuento) * item.cantidad;
    }, 0);
    setTotalCompra(total);
  }, [carrito]);

  // Atender siguiente usuario - MODIFICADO para no eliminar de la cola
  const atenderSiguiente = () => {
    if (usuariosCola.length === 0) {
      alert("No hay más usuarios en cola");
      return;
    }

    // Tomar el primer usuario de la cola
    const siguiente = usuariosCola[0];
    setUsuarioActual(siguiente);

    // Ya no removemos al usuario de la cola aquí
    // Solo lo marcaremos como en atención en selección de tipo de atención

    setSeleccionTipoAtencion(true);
    setMostrarOpciones(false);
    setMostrarProductos(false);
    setCarrito([]);
    setOrdenRecibida(false);
  };

  // Método para atender con orden médica
  const atenderConOrden = () => {
    setOrdenRecibida(true);
    setMostrarOpciones(true);
    setSeleccionTipoAtencion(false);
    setMostrarProductos(false);
  };

  // Método para atender sin orden médica
  const atenderSinOrden = () => {
    setOrdenRecibida(false);
    setMostrarOpciones(true);
    setSeleccionTipoAtencion(false);
    setMostrarProductos(false);
  };

  // Mostrar productos
  const mostrarSeleccionProductos = () => {
    setMostrarProductos(true);
  };

  // Volver al paso anterior
  const volverAtras = () => {
    if (mostrarProductos) {
      // Si estamos en selección de productos, volver a opciones
      setMostrarProductos(false);
    } else if (mostrarOpciones) {
      // Si estamos en opciones, volver a selección de tipo de atención
      setMostrarOpciones(false);
      setSeleccionTipoAtencion(true);
    } else if (seleccionTipoAtencion) {
      // Si estamos en selección de tipo, volver a pantalla inicial
      cancelarAtencion();
    }
  };

  // Mostrar confirmación de cancelar atención
  const confirmarCancelarAtencion = () => {
    setConfirmarCancelar(true);
  };

  // Cancelar atención
  const cancelarAtencion = () => {
    setUsuarioActual(null);
    setMostrarOpciones(false);
    setMostrarProductos(false);
    setSeleccionTipoAtencion(false);
    setOrdenRecibida(false);
    setCarrito([]);
    setConfirmarCancelar(false);
  };

  // Desactivar/activar caja
  const toggleCaja = () => {
    setCajaActiva(!cajaActiva);
    if (cajaActiva) {
      alert("Caja desactivada");
    } else {
      alert("Caja activada");
    }
  };

  // Solicitar ayuda
  const pedirAyuda = () => {
    alert("Se ha solicitado ayuda. Un supervisor acudirá pronto.");
  };

  // Agregar producto al carrito - MODIFICADO para validar requisitos de orden
  const agregarProducto = (producto) => {
    // Verificar si el producto requiere orden médica
    if (producto.requireOrden && !ordenRecibida) {
      alert(
        "Este producto requiere orden médica. No puede ser vendido sin receta."
      );
      return;
    }

    // Verificar si ya existe en el carrito
    const existeEnCarrito = carrito.find((item) => item.id === producto.id);

    if (existeEnCarrito) {
      // Incrementar cantidad
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      // Agregar nuevo producto con cantidad 1
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      // Eliminar producto si cantidad es 0 o negativa
      setCarrito(carrito.filter((item) => item.id !== id));
    } else {
      // Actualizar cantidad
      setCarrito(
        carrito.map((item) => (item.id === id ? { ...item, cantidad } : item))
      );
    }
  };

  // Eliminar producto del carrito
  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  // Generar factura y finalizar compra - MODIFICADO para remover usuario de la cola
  const finalizarCompra = () => {
    if (carrito.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }

    // Crear factura
    const factura = {
      fecha: new Date().toLocaleString(),
      cajero: cajero.nombre,
      cliente: `${usuarioActual.nombre} ${usuarioActual.apellido}`,
      productos: carrito,
      total: totalCompra,
      conOrdenMedica: ordenRecibida,
    };

    // Generar PDF
    generarPDF(factura);

    // MODIFICADO: Solo ahora removemos al usuario de la cola
    if (usuarioActual) {
      setUsuariosCola((prev) =>
        prev.filter((user) => user.id !== usuarioActual.id)
      );
    }

    // Reiniciar estado
    setUsuarioActual(null);
    setMostrarOpciones(false);
    setMostrarProductos(false);
    setCarrito([]);
    setOrdenRecibida(false);
    setSeleccionTipoAtencion(false);
    setConfirmarCancelar(false);

    alert("Compra finalizada. Se ha generado la factura.");
  };

  // Función generarPDF modificada
  const generarPDF = (factura) => {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text("MEDIFAST - FACTURA", 105, 20, { align: "center" });

    // Información factura
    doc.setFontSize(12);
    doc.text(`Fecha: ${factura.fecha}`, 15, 40);
    doc.text(`Cajero: ${factura.cajero}`, 15, 50);
    doc.text(`Cliente: ${factura.cliente}`, 15, 60);
    doc.text(
      `Tipo: ${
        factura.conOrdenMedica ? "Con orden médica" : "Sin orden médica"
      }`,
      15,
      70
    );

    // Usar autoTable como plugin
    autoTable(doc, {
      head: [
        ["Producto", "Marca", "Precio", "Descuento", "Cantidad", "Subtotal"],
      ],
      body: factura.productos.map((producto) => {
        const subtotal =
          (producto.precio - producto.descuento) * producto.cantidad;
        return [
          producto.nombre,
          producto.marca,
          `$${producto.precio.toLocaleString()}`,
          `$${producto.descuento.toLocaleString()}`,
          producto.cantidad,
          `$${subtotal.toLocaleString()}`,
        ];
      }),
      startY: 80,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY || 80;
    doc.text(`Total: $${factura.total.toLocaleString()}`, 15, finalY + 20);

    // Guardar con prefijo para simular ubicación en /src/facturas/
    const fileName = `factura_${factura.cliente.replace(
      /\s+/g,
      "_"
    )}_${new Date().getTime()}.pdf`;

    try {
      // Log para desarrollo
      console.log(`Guardando factura: /src/facturas/${fileName}`);

      // Guardar el archivo en el cliente
      doc.save(fileName);

      // Crear objeto para base de datos
      const facturaData = {
        id: new Date().getTime(),
        fecha: factura.fecha,
        cajero: factura.cajero,
        cliente: factura.cliente,
        total: factura.total,
        conOrdenMedica: factura.conOrdenMedica,
        productos: factura.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
          descuento: p.descuento,
          requireOrden: p.requireOrden || false,
        })),
      };

      // Guardar en localStorage para simulación de persistencia
      const facturas = JSON.parse(localStorage.getItem("facturas") || "[]");
      facturas.push(facturaData);
      localStorage.setItem("facturas", JSON.stringify(facturas));

      console.log("Factura generada con éxito y guardada localmente");
    } catch (error) {
      console.error("Error al generar factura:", error);
      alert("Error al generar la factura");
    }
  };

  // Nueva función para pasar al siguiente turno - MODIFICADO para eliminar usuario
  const pasarSiguienteTurno = () => {
    if (usuarioActual) {
      // Ahora sí eliminamos al usuario de la cola
      setUsuariosCola((prev) =>
        prev.filter((user) => user.id !== usuarioActual.id)
      );
    }

    // Liberar al usuario actual
    setUsuarioActual(null);
    setSeleccionTipoAtencion(false);

    // Verificar si hay más usuarios en cola
    if (usuariosCola.length > 1) {
      // > 1 porque no hemos actualizado el estado aún
      // Llamar a atender siguiente automáticamente
      setTimeout(() => {
        atenderSiguiente();
      }, 300);
    }
  };

  // Nueva función para volver a opciones principales
  const volverAOpciones = () => {
    // Cancelar la atención pero sin mostrar confirmación
    setUsuarioActual(null);
    setMostrarOpciones(false);
    setMostrarProductos(false);
    setSeleccionTipoAtencion(false);
    setOrdenRecibida(false);
    setCarrito([]);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sección Izquierda - Lista de usuarios en cola */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Usuarios en Cola
          </h2>

          {usuariosCola.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay usuarios en cola
            </p>
          ) : (
            <div className="space-y-3">
              {usuariosCola.map((usuario, index) => (
                <div
                  key={usuario.id}
                  className={`p-3 rounded-lg ${
                    usuarioActual && usuario.id === usuarioActual.id
                      ? "bg-green-100 border border-green-400" // Resaltar usuario en atención
                      : index === 0 && !usuarioActual
                      ? "bg-green-50 border border-green-300" // Siguiente sin atención actual
                      : "bg-gray-50 border border-gray-200" // Resto de usuarios
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        usuario.prioridad
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {usuario.prioridad ? "Prioritario" : "Normal"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      Turno: {usuario.turno}
                    </span>
                    <span className="text-gray-600">{usuario.servicio}</span>
                  </div>
                  {usuarioActual && usuario.id === usuarioActual.id && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      En atención
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección Central - Información de cajero y controles */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Información de Cajero {cajero.caja}
          </h2>
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-200 h-24 w-24 flex items-center justify-center text-3xl">
                👤
              </div>
            </div>
            <p className="text-center font-medium text-lg">{cajero.nombre}</p>
            <p className="text-center text-gray-600">CC: {cajero.cedula}</p>
            <p className="text-center">
              <span
                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                  cajaActiva
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Caja {cajaActiva ? "Activa" : "Inactiva"}
              </span>
            </p>
          </div>
          {/* Pantalla inicial - Sin usuario en atención activa */}
          {!seleccionTipoAtencion && !mostrarOpciones && !confirmarCancelar && (
            <div className="space-y-3">
              <button
                onClick={atenderSiguiente}
                disabled={!cajaActiva || usuariosCola.length === 0}
                className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                  cajaActiva && usuariosCola.length > 0
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Atender Siguiente Turno
              </button>

              <button
                onClick={toggleCaja}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  cajaActiva
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {cajaActiva ? "Desactivar Caja" : "Activar Caja"}
              </button>

              <button
                onClick={pedirAyuda}
                className="w-full py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
              >
                Pedir Ayuda
              </button>
            </div>
          )}
          {/* Confirmación de cancelar atención */}
          {confirmarCancelar && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-center mb-4">
                ¿Está seguro que desea cancelar la atención?
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={cancelarAtencion}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Sí, Cancelar
                </button>
                <button
                  onClick={() => setConfirmarCancelar(false)}
                  className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  No, Volver
                </button>
              </div>
            </div>
          )}

          {/* Selección del tipo de atención */}
          {usuarioActual && seleccionTipoAtencion && !confirmarCancelar && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-center mb-2">Atendiendo a:</h3>
              <p className="text-center font-bold mb-4">
                {usuarioActual.nombre} {usuarioActual.apellido}
              </p>

              <div className="space-y-3">
                <button
                  onClick={atenderConOrden}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Atender con Orden Médica
                </button>

                <button
                  onClick={atenderSinOrden}
                  className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                >
                  Atender sin Orden Médica
                </button>

                <button
                  onClick={pasarSiguienteTurno}
                  className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                >
                  No Atender (Siguiente Turno)
                </button>

                <button
                  onClick={volverAOpciones}
                  className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Volver a Opciones
                </button>
              </div>
            </div>
          )}
          {/* Información del usuario en atención */}
          {usuarioActual && mostrarOpciones && !confirmarCancelar && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-center mb-2">En atención:</h3>
              <p className="text-center font-bold mb-2">
                {usuarioActual.nombre} {usuarioActual.apellido}
              </p>
              <p className="text-center mb-2">Turno: {usuarioActual.turno}</p>
              <div className="flex justify-center mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    usuarioActual.prioridad
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {usuarioActual.prioridad
                    ? "Prioridad Alta"
                    : "Prioridad Normal"}
                </span>
              </div>
              <p className="text-center mb-3">
                Servicio:{" "}
                <span className="font-medium">{usuarioActual.servicio}</span>
              </p>

              {/* Indicador de estado de orden médica */}
              <p className="text-center mb-3">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    ordenRecibida
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ordenRecibida ? "Con Orden Médica" : "Sin Orden Médica"}
                </span>
              </p>

              {!mostrarProductos ? (
                <div className="space-y-3">
                  <button
                    onClick={mostrarSeleccionProductos}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                  >
                    Seleccionar Productos
                  </button>

                  <button
                    onClick={volverAtras}
                    className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                  >
                    Volver Atrás
                  </button>

                  <button
                    onClick={confirmarCancelarAtencion}
                    className="w-full py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium"
                  >
                    Cancelar Atención
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p className="mb-2">Seleccione los productos</p>
                  <button
                    onClick={volverAtras}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Volver a opciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección Derecha - Selección de productos y facturación */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow p-4 md:p-6">
          {mostrarProductos ? (
            <>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                Selección de Productos
                {!ordenRecibida && (
                  <span className="ml-2 text-sm font-normal text-yellow-600">
                    (Sin orden médica - Algunos productos no están disponibles)
                  </span>
                )}
              </h2>

              {/* Búsqueda de productos */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar producto por nombre, marca o tipo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Lista de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => agregarProducto(producto)}
                  >
                    {producto.requireOrden && (
                      <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                        Requiere orden
                      </span>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">{producto.nombre}</span>
                      <span className="text-sm text-gray-500">
                        {producto.marca}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{producto.tipo}</div>
                    <div className="flex justify-between mt-1">
                      <span
                        className={`${
                          producto.descuento > 0
                            ? "line-through text-gray-400"
                            : ""
                        }`}
                      >
                        ${producto.precio.toLocaleString()}
                      </span>
                      {producto.descuento > 0 && (
                        <span className="font-medium text-green-600">
                          $
                          {(
                            producto.precio - producto.descuento
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Carrito */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Productos Seleccionados</h3>

                {carrito.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No hay productos seleccionados
                  </p>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto mb-4">
                      {carrito.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 border-b"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{item.nombre}</div>
                            <div className="text-sm text-gray-600">
                              {item.marca}
                            </div>
                            <div className="text-sm">
                              ${(item.precio - item.descuento).toLocaleString()}{" "}
                              c/u
                            </div>
                            {item.requireOrden && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                Requiere orden
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                actualizarCantidad(item.id, item.cantidad - 1);
                              }}
                              className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="border rounded w-12 px-2 py-1 text-center"
                              min="1"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                actualizarCantidad(item.id, item.cantidad + 1);
                              }}
                              className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              +
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarProducto(item.id);
                              }}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t pt-4">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-xl">
                        ${totalCompra.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={finalizarCompra}
                      className="w-full mt-4 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      Confirmar Pago
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-center">
                {usuarioActual
                  ? seleccionTipoAtencion
                    ? "Seleccione el tipo de atención"
                    : "Seleccione 'Seleccionar Productos' para continuar"
                  : "Atienda a un usuario para mostrar opciones"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
