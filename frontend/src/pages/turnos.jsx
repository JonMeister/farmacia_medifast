import Button from "../components/Button";

import React from "react";

export default function Turno(){
  return (
    <div className= "w-screen h-screen flex items-center justify-center">
      <div className="w-screen h-[98vh] bg-white shadow-lg flex-col p-4">

        {/* Mi Turno Section */}
        <div className="bg-green-600 rounded-2xl flex flex-col justify-center items-center py-8 mb-4">
          <h2 className="text-4xl font-bold text-white">Mi Turno</h2>
          <span className="text-8xl font-black text-white">18</span>
        </div>

        {/* Turno Siguiente y Cancelar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 bg-green-600 rounded-full py-4 px-6 flex justify-between items-center mr-2">
            <span className="text-lg font-bold text-white">Turno Siguiente</span>
            <span className="text-2xl font-bold text-white">15</span>
          </div>
          <button className="flex-1  border border-green-600 text-green-600 rounded-full py-4 px-6 font-bold ml-2 hover:bg-green-200 transition duration-300">
            Servicio
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex flex-1 gap-4">
          {/* Izquierda: puede ser algo más o lo dejamos vacío */}
          <div className="flex-1 bg-gray-100 rounded-xl flex justify-center items-center text-gray-400 text-lg">
            {/* Puedes poner algo aquí si necesitas */}
            {/* Ejemplo: Información Adicional */}
          </div>

          {/* Derecha: espacio vacío también */}
          <div className="flex-1 bg-gray-100 rounded-xl flex justify-center items-center text-gray-400 text-lg">
            {/* Ejemplo: Otra Información */}
          </div>
        </div>
      </div>
    </div>
  );
};
