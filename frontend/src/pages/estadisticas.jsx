export default function Estadisticas() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-2xl max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Estadisticas</h1>

        {/* Contenedor de estadisticas */}
        <div className="grid grid-cols-2 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition"
            >
              {/* Ícono de usuario */}
              <div className="w-1/4 flex justify-center items-center">
                <div className="border rounded-full h-16 w-16 flex justify-center items-center text-2xl bg-gray-100">
                  📈
                </div>
              </div>

              {/* Información de la caja */}
              <div className="flex-1 ml-6">
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-lg mb-2 transition w-full">
                  Estadistica {index + 1}
                </button>
                <div className="font-semibold text-gray-700">Estadistica:</div>
                <div className="text-gray-600">Nombre de la estadistica</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
