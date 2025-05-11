import Button from "../components/Button";

import React, { useEffect, useState } from "react";

const images = [
  "src/assets/ads/PR_ViernesPastillaton.jpg",
  "src/assets/ads/VT_Vitamax.jpg",
  "src/assets/ads/MD_Somniora.jpg",
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

export default function Turno(){
  const [imageIndex, setImageIndex] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Cambiar imagen cada 15 segundos
   useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 15000);

    return () => clearInterval(imageInterval);
  }, [imageIndex]); // Re-iniciar el intervalo al cambiar la imagen

  // Cambiar mensaje cada 10 segundos (por ejemplo)
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);
    return () => clearInterval(messageInterval);
  }, []);

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto h-auto bg-white shadow-lg rounded-lg p-6">
        {/* Mi Turno Section */}
        <div className="bg-green-600 rounded-2xl flex flex-col justify-center items-center py-8 mb-4">
          <h2 className="text-4xl font-bold text-white">Turno Siguiente</h2>
          <span className="text-8xl font-black text-white">15</span>
        </div>

        {/* Turno Siguiente y Cancelar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex-1 rounded-full py-4 px-6 flex justify-between items-center">
            <span className="text-4xl font-bold text-green-600">Mi Turno</span>
            <span className="text-6xl font-bold text-green-600">18</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:w-auto w-full">
            <button className="flex-1 border border-green-600 text-green-600 rounded-full py-4 px-6 font-bold hover:bg-green-200 transition duration-300">
              Consultar información
            </button>
            <button className="flex-1 border border-orange-600 bg-orange-600 text-white rounded-full py-4 px-6 font-bold hover:bg-orange-800 transition duration-300">
              Cancelar servicio
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 bg-gray-100 rounded-xl flex justify-center items-center text-gray-400 text-lg">
            {/* Información adicional */}
          </div>
          <div className="flex-1 bg-gray-100 rounded-xl flex justify-center items-center text-gray-400 text-lg">
            {/* Otra información */}
          </div>
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
