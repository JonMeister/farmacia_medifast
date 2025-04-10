import Button from "../components/Button";

export default function ServicioEditor() {
  const servicios = [
    "Servicio 1",
    "Servicio 2",
    "Servicio 3",
    "Servicio 4",
    "Servicio 5",
    "Servicio 6",
  ];

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        {/* Contenedor de servicios */}
        <div className="grid grid-cols-3 gap-6 mb-6 ">
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className="flex flex-col items-center relative space-y-2"
            >
              <Button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                {servicio}
              </Button>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                Prioridad
              </span>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md">
                Editar
              </Button>
            </div>
          ))}
        </div>

        {/* Contenedor inferior */}
        <div className="border-t pt-6 flex flex-col items-center space-y-4">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Servicio Seleccionado
          </Button>
          <div className="bg-yellow-700 text-white font-bold rounded-lg p-4 w-48 text-center">
            <span className="block">Fecha:</span>
            <span className="block">Hora:</span>
          </div>
        </div>
      </div>
    </div>
  );
}
