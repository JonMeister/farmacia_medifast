import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import medifastLogo from "../assets/medifast_logo.png";
// Importar las imágenes del carrusel
import imgPR_ViernesPastillaton from "../assets/ads/PR_ViernesPastillaton.jpg";
import imgVT_Vitamax from "../assets/ads/VT_Vitamax.jpg";
import imgMD_Somniora from "../assets/ads/MD_Somniora.jpg";
import {
  getTurnoActivoCliente,
  getColaTurnos,
  getEstadoCajas,
  cancelarTurno,
  getTurnoActualGlobal,
} from "../api/turno.api";

const images = [
  imgPR_ViernesPastillaton,
  imgVT_Vitamax,
  imgMD_Somniora,
];

const messages = [
  {
    title: "¿Sabías que...?",
    text: "En nuestra farmacia encuentras medicamentos certificados, asesoría personalizada y atención prioritaria para adultos mayores.",
    bgColor: "bg-green-50 text-green-900", // verde claro
  },
  {
    title: "Consejo de salud",
    text: "Tomar tus medicamentos a la misma hora cada día mejora su efectividad y reduce los efectos secundarios.",
    bgColor: "bg-blue-50 text-blue-900", // azul claro
  },
  {
    title: "Atención especial",
    text: "Ofrecemos servicios preferenciales para personas con movilidad reducida. ¡Pregunta en recepción!",
    bgColor: "bg-yellow-50 text-yellow-900", // amarillo claro
  },
];

export default function Turno() {
  const navigate = useNavigate();

  const [imageIndex, setImageIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Estados para gestión de turnos
  const [turnoCliente, setTurnoCliente] = useState(null);
  const [turnoActualCaja, setTurnoActualCaja] = useState(null);
  const [colaTurnos, setColaTurnos] = useState([]);
  const [estadoCajas, setEstadoCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [mostrarEstadoCajas, setMostrarEstadoCajas] = useState(false);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [turnoAnterior, setTurnoAnterior] = useState(null);
  
  // Estados para carga en segundo plano (sin afectar UI)
  const [actualizandoTurno, setActualizandoTurno] = useState(false);
  const [actualizandoCola, setActualizandoCola] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState(true);
  const [datosActualizados, setDatosActualizados] = useState(false);

  // Cambiar imagen cada 15 segundos
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 15000);

    return () => clearInterval(imageInterval);
  }, [imageIndex]);

  // Cambiar mensaje cada 10 segundos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);
    return () => clearInterval(messageInterval);
  }, []);

  // Funciones de carga específicas para actualización en segundo plano
  const actualizarTurnoCliente = React.useCallback(async (cedula) => {
    try {
      setActualizandoTurno(true);
      const turnoClienteResponse = await getTurnoActivoCliente(cedula);
      
      if (turnoClienteResponse.tiene_turno) {      setTurnoCliente(prev => {
        // Solo actualizar si hay cambios significativos
        if (!prev || prev.id !== turnoClienteResponse.turno.id || 
            prev.estado !== turnoClienteResponse.turno.estado) {
          // Disparar animación de actualización
          setDatosActualizados(true);
          setTimeout(() => setDatosActualizados(false), 2000);
          return turnoClienteResponse.turno;
        }
        return prev;
      });
      } else {
        // Si no tiene turno, redirigir a pedir turno
        navigate("/pedir-turno");
        return;
      }
    } catch (error) {
      console.error("Error al actualizar turno del cliente:", error);
    } finally {
      setActualizandoTurno(false);
    }
  }, [navigate]);

  const actualizarTurnoActualGlobal = React.useCallback(async () => {
    try {
      const turnoActualGlobalResponse = await getTurnoActualGlobal();
      
      setTurnoActualCaja(prev => {
        const nuevoTurno = turnoActualGlobalResponse.hay_turno_actual 
          ? turnoActualGlobalResponse.turno_actual 
          : null;
        
        // Solo actualizar si hay cambios
        if (!prev && !nuevoTurno) return prev;
        if (!prev || !nuevoTurno) return nuevoTurno;
        if (prev.id !== nuevoTurno.id || prev.numero_turno !== nuevoTurno.numero_turno) {
          return nuevoTurno;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error al actualizar turno actual global:", error);
    }
  }, []);

  const actualizarColaTurnos = React.useCallback(async () => {
    try {
      setActualizandoCola(true);
      const colaResponse = await getColaTurnos();
      
      setColaTurnos(prev => {
        // Comparar si hay cambios reales en la cola
        if (JSON.stringify(prev) !== JSON.stringify(colaResponse)) {
          return colaResponse;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error al actualizar cola de turnos:", error);
    } finally {
      setActualizandoCola(false);
    }
  }, []);

  const actualizarEstadoCajas = React.useCallback(async () => {
    try {
      const estadoCajasResponse = await getEstadoCajas();
      setEstadoCajas(prev => {
        const nuevoCajas = estadoCajasResponse.estado_cajas || [];
        // Solo actualizar si hay cambios
        if (JSON.stringify(prev) !== JSON.stringify(nuevoCajas)) {
          return nuevoCajas;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error al actualizar estado de cajas:", error);
    }
  }, []);

  // Función para carga inicial completa
  const cargarDatosTurnos = React.useCallback(
    async (cedula) => {
      try {
        setLoading(true);

        // Cargar todos los datos en paralelo
        await Promise.all([
          actualizarTurnoCliente(cedula),
          actualizarTurnoActualGlobal(),
          actualizarColaTurnos(),
          actualizarEstadoCajas()
        ]);

        setUltimaActualizacion(new Date());
      } catch (error) {
        console.error("Error al cargar datos de turnos:", error);
      } finally {
        setLoading(false);
      }
    },
    [actualizarTurnoCliente, actualizarTurnoActualGlobal, actualizarColaTurnos, actualizarEstadoCajas]
  );

  // Función para actualización en segundo plano (más rápida y silenciosa)
  const actualizarDatosSegundoPlano = React.useCallback(async (cedula) => {
    try {
      // Solo actualizar datos críticos más frecuentemente
      await Promise.all([
        actualizarTurnoCliente(cedula),
        actualizarTurnoActualGlobal(),
        actualizarColaTurnos()
      ]);

      // Actualizar estado de cajas menos frecuentemente
      if (!ultimaActualizacion || (new Date() - ultimaActualizacion) > 60000) {
        await actualizarEstadoCajas();
      }

      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error("Error en actualización de segundo plano:", error);
    }
  }, [actualizarTurnoCliente, actualizarTurnoActualGlobal, actualizarColaTurnos, actualizarEstadoCajas, ultimaActualizacion]);

  // Verificar autenticación y cargar datos
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const isClient = localStorage.getItem("is_client") === "true";
    const cedula = localStorage.getItem("user_cc");

    // Solo permitir acceso a clientes autenticados
    if (!authToken || !isClient) {
      navigate("/");
      return;
    }

    if (!cedula) {
      alert("Error: No se pudo obtener información del usuario");
      navigate("/");
      return;
    }

    setClienteInfo({
      cedula,
      nombre: localStorage.getItem("user_name") || "",
      apellido: localStorage.getItem("user_lastname") || "",
    });

    // Carga inicial
    cargarDatosTurnos(cedula);

    // Actualización inteligente basada en visibilidad de pestaña
    const intervaloCritico = setInterval(() => {
      // Solo actualizar si la pestaña está activa
      if (pestanaActiva) {
        actualizarDatosSegundoPlano(cedula);
      }
    }, pestanaActiva ? 10000 : 30000); // 10s si está activa, 30s si no

    // Actualización completa menos frecuente
    const intervaloCompleto = setInterval(() => {
      if (pestanaActiva) {
        cargarDatosTurnos(cedula);
      }
    }, pestanaActiva ? 120000 : 300000); // 2min si está activa, 5min si no

    return () => {
      clearInterval(intervaloCritico);
      clearInterval(intervaloCompleto);
    };
  }, [navigate, cargarDatosTurnos, actualizarDatosSegundoPlano, pestanaActiva]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificacionesActivas(permission === "granted");
      });
    } else if (Notification.permission === "granted") {
      setNotificacionesActivas(true);
    }
  }, []);

  // Detectar cuando la pestaña está activa/inactiva para optimizar actualizaciones
  useEffect(() => {
    const handleVisibilityChange = () => {
      setPestanaActiva(!document.hidden);
    };

    const handleFocus = () => {
      setPestanaActiva(true);
      // Actualizar inmediatamente cuando la pestaña vuelve a estar activa
      if (clienteInfo?.cedula) {
        actualizarDatosSegundoPlano(clienteInfo.cedula);
      }
    };

    const handleBlur = () => {
      setPestanaActiva(false);
    };

    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [clienteInfo?.cedula, actualizarDatosSegundoPlano]);

  // Monitorear cambios en el turno para notificaciones
  useEffect(() => {
    if (!turnoCliente || !turnoActualCaja || !notificacionesActivas) return;

    // Verificar si el turno del cliente es el próximo
    const posicionEnCola = colaTurnos.findIndex(
      (turno) => turno.id === turnoCliente.id
    );

    // Si es el siguiente turno (posición 0 después del actual)
    if (
      posicionEnCola === 0 &&
      turnoAnterior?.id !== turnoCliente.id &&
      turnoActualCaja.id !== turnoCliente.id
    ) {
      mostrarNotificacion(
        "¡Tu turno es el siguiente!",
        `Prepárate, serás atendido pronto en ${
          turnoCliente.ID_Caja_data?.nombre || "tu caja asignada"
        }`
      );
    }

    // Si su turno está siendo atendido ahora
    if (
      turnoActualCaja.id === turnoCliente.id &&
      turnoAnterior?.id !== turnoCliente.id
    ) {
      mostrarNotificacion(
        "¡Es tu turno!",
        `Dirígete a ${
          turnoCliente.ID_Caja_data?.nombre || "tu caja asignada"
        } para ser atendido`
      );
    }

    setTurnoAnterior(turnoCliente);
  }, [
    turnoCliente,
    turnoActualCaja,
    colaTurnos,
    notificacionesActivas,
    turnoAnterior,
  ]);

  const mostrarNotificacion = (titulo, mensaje) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(titulo, {
        body: mensaje,
        icon: medifastLogo,
        requireInteraction: true,
      });
    }
  };

  const handleCancelarTurno = async () => {
    if (!turnoCliente) return;

    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas cancelar tu turno? Esta acción no se puede deshacer."
    );

    if (confirmacion) {
      try {
        await cancelarTurno(turnoCliente.id);
        alert("Turno cancelado exitosamente");
        navigate("/pedir-turno");
      } catch (error) {
        alert("Error al cancelar el turno. Intenta nuevamente.");
        console.error("Error:", error);
      }
    }
  };

  // Función para actualización manual instantánea
  const handleActualizacionManual = async () => {
    if (!clienteInfo?.cedula) return;
    
    try {
      // Usar la función de segundo plano que es más rápida
      await actualizarDatosSegundoPlano(clienteInfo.cedula);
      
      // Mostrar feedback visual temporal
      const button = document.querySelector('[data-update-button]');
      if (button) {
        button.style.backgroundColor = '#10b981';
        button.style.color = 'white';
        setTimeout(() => {
          button.style.backgroundColor = '';
          button.style.color = '';
        }, 1000);
      }
    } catch (error) {
      console.error("Error en actualización manual:", error);
    }
  };

  const obtenerPosicionEnCola = () => {
    if (!turnoCliente) return 0;

    const turnosDelante = colaTurnos.filter(
      (turno) =>
        turno.posicion_cola < turnoCliente.posicion_cola &&
        turno.estado === "esperando"
    );

    return turnosDelante.length;
  };

  const obtenerTurnoActual = () => {
    if (turnoActualCaja) {
      return turnoActualCaja.numero_turno;
    }
    return "---";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Cargando información del turno...
          </p>
        </div>
      </div>
    );
  }

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto h-auto bg-white shadow-lg rounded-lg p-6">
        {/* Información del Cliente */}
        {clienteInfo && (
          <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 relative transition-all duration-300 ${datosActualizados ? 'ring-2 ring-green-300 bg-green-50' : ''}`}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-800">
                  👤 Bienvenido, {clienteInfo.nombre} {clienteInfo.apellido}
                </h3>
                <p className="text-sm text-blue-600">CC: {clienteInfo.cedula}</p>
              </div>
              {/* Indicador sutil de actualización */}
              <div className="flex items-center space-x-2">
                {datosActualizados && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-xs text-green-600 font-medium">¡Actualizado!</span>
                  </div>
                )}
                {(actualizandoTurno || actualizandoCola) && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600">Actualizando...</span>
                  </div>
                )}
                {ultimaActualizacion && !datosActualizados && !(actualizandoTurno || actualizandoCola) && (
                  <span className="text-xs text-blue-500">
                    Última actualización: {ultimaActualizacion.toLocaleTimeString()}
                  </span>
                )}
                {!pestanaActiva && (
                  <span className="text-xs text-yellow-600">⏸️ Pausado</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Turno Siguiente Section */}
        <div className="bg-green-600 rounded-2xl flex flex-col justify-center items-center py-8 mb-4">
          <h2 className="text-4xl font-bold text-white">
            {turnoActualCaja
              ? `Turno Actual - Caja ${
                  turnoActualCaja.caja_nombre || turnoActualCaja.caja_id
                }`
              : "Sin Turno en Atención"}
          </h2>
          <span className="text-8xl font-black text-white">
            {obtenerTurnoActual()}
          </span>
          {turnoActualCaja && (
            <div className="text-center text-white mt-2">
              <p className="text-lg">
                Cliente: {turnoActualCaja.cliente?.nombre || "N/A"}
              </p>
              <p className="text-md">
                Servicio: {turnoActualCaja.servicio || "N/A"}
              </p>
              {turnoActualCaja.es_prioritario && (
                <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block">
                  🚨 Prioritario
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mi Turno y Controles */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex-1 rounded-full py-4 px-6 flex justify-between items-center">
            <span className="text-4xl font-bold text-green-600">Mi Turno</span>
            <span className="text-6xl font-bold text-green-600">
              {turnoCliente?.numero_turno || "---"}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:w-auto w-full">
            <button
              data-update-button
              className="flex-1 border border-green-600 text-green-600 rounded-full py-4 px-6 font-bold hover:bg-green-200 transition duration-300 flex items-center justify-center space-x-2"
              onClick={handleActualizacionManual}
              disabled={actualizandoTurno || actualizandoCola}
            >
              {(actualizandoTurno || actualizandoCola) ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Actualizar información</span>
              )}
            </button>
            <button
              className="flex-1 border border-orange-600 bg-orange-600 text-white rounded-full py-4 px-6 font-bold hover:bg-orange-800 transition duration-300"
              onClick={handleCancelarTurno}
              disabled={!turnoCliente || turnoCliente.estado !== "esperando"}
            >
              Cancelar turno
            </button>
          </div>
        </div>

        {/* Información del Turno */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 bg-gray-100 rounded-xl p-4 min-h-[100px] transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">
                Estado del Turno
              </h4>
              {actualizandoTurno && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              )}
            </div>
            {turnoCliente ? (
              <div className="transition-all duration-300 ease-in-out">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    turnoCliente.estado === "esperando"
                      ? "bg-yellow-100 text-yellow-800"
                      : turnoCliente.estado === "en_atencion"
                      ? "bg-blue-100 text-blue-800"
                      : turnoCliente.estado === "finalizado"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {turnoCliente.estado === "esperando"
                    ? "Esperando"
                    : turnoCliente.estado === "en_atencion"
                    ? "En Atención"
                    : turnoCliente.estado === "finalizado"
                    ? "Finalizado"
                    : "Cancelado"}
                </span>
                <p className="text-sm text-gray-600 mt-2 transition-all duration-300">
                  Servicio: {turnoCliente.ID_Servicio_data?.Nombre || "---"}
                </p>
                <p className="text-sm text-gray-600 transition-all duration-300">
                  Personas delante: {obtenerPosicionEnCola()}
                </p>
                {turnoCliente.es_prioritario && (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full mt-1 transition-all duration-300">
                    Prioritario
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Sin información</p>
            )}
          </div>

          <div className="flex-1 bg-gray-100 rounded-xl p-4 min-h-[100px]">
            <h4 className="font-semibold text-gray-800 mb-2">Caja Asignada</h4>
            {turnoCliente?.ID_Caja_data ? (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  Caja{" "}
                  {turnoCliente.ID_Caja_data.nombre ||
                    turnoCliente.ID_Caja_data.id}
                </p>
                {turnoCliente.ID_Caja_data.usuario && (
                  <p className="text-sm text-gray-600">
                    Cajero: {turnoCliente.ID_Caja_data.usuario.first_name}{" "}
                    {turnoCliente.ID_Caja_data.usuario.last_name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  ✨ Asignada automáticamente por nuestro sistema inteligente
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Aún no asignada</p>
            )}
          </div>
        </div>

        {/* Nueva sección: Estado de Cajas */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Estado de las Cajas</h4>
            <button
              onClick={() => setMostrarEstadoCajas(!mostrarEstadoCajas)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              {mostrarEstadoCajas ? "Ocultar" : "Ver estado"}
            </button>
          </div>

          {mostrarEstadoCajas && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {estadoCajas.map((caja) => (
                  <div
                    key={caja.id}
                    className={`border-2 rounded-lg p-3 ${
                      caja.estado
                        ? turnoCliente?.ID_Caja_data?.id === caja.id
                          ? "border-green-500 bg-green-50"
                          : "border-blue-200 bg-blue-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold">
                        Caja {caja.nombre || caja.id}
                      </h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caja.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {caja.estado ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      📋 {caja.turnos_en_espera} turnos en espera
                    </p>

                    {caja.turno_actual ? (
                      <div className="text-sm">
                        <p className="text-blue-600 font-medium">
                          🔄 Atendiendo turno #{caja.turno_actual.numero_turno}
                        </p>
                        <p className="text-gray-600">
                          👤 {caja.turno_actual.cliente.nombre}{" "}
                          {caja.turno_actual.cliente.apellido}
                        </p>
                        <p className="text-gray-600">
                          🏥 {caja.turno_actual.servicio}
                        </p>
                        {caja.turno_actual.hora_inicio_atencion && (
                          <p className="text-gray-500 text-xs">
                            Desde:{" "}
                            {new Date(
                              caja.turno_actual.hora_inicio_atencion
                            ).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Sin turno en atención
                      </p>
                    )}

                    {turnoCliente?.ID_Caja_data?.id === caja.id && (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        ⭐ Tu caja asignada
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Explicación del algoritmo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">
                  🤖 ¿Cómo funciona la asignación automática?
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • El sistema asigna automáticamente la caja con{" "}
                    <strong>menos turnos pendientes</strong>
                  </li>
                  <li>
                    • Solo se consideran las cajas <strong>activas</strong> para
                    asignación
                  </li>
                  <li>
                    • Los turnos <strong>prioritarios</strong> van al frente de
                    cada cola
                  </li>
                  <li>
                    • Se balancea la carga entre todas las cajas disponibles
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Carrusel + texto + Video YouTube */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Carrusel a la izquierda */}
          <div className="w-full lg:w-[500px] rounded-xl overflow-hidden shadow-lg relative">
            <img
              src={images[imageIndex]}
              alt={`Imagen ${imageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Botón Prev */}
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/80 hover:bg-green-100 text-green-800 p-2 rounded-full shadow-md transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Botón Next */}
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/80 hover:bg-green-100 text-green-800 p-2 rounded-full shadow-md transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Carrusel de mensajes informativos con color variable */}
          <div
            className={`w-full lg:w-1/3 p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-center transition-all duration-500 ${messages[messageIndex].bgColor}`}
          >
            <h3 className="text-xl font-bold mb-2">
              {messages[messageIndex].title}
            </h3>
            <p>{messages[messageIndex].text}</p>
          </div>

          {/* Video de YouTube */}
          <div className="w-full lg:w-1/3 flex justify-center items-center">
            <iframe
              width="100%"
              height="auto"
              src="https://www.youtube.com/embed/KFKMEiuCY6M"
              title="Video informativo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow-md aspect-video"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
