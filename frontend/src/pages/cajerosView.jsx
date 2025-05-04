import { useNavigate } from "react-router-dom";

export default function CajerosView() {
  const navigate = useNavigate();

  const cajas = Array(6).fill({
    caja: "1", // Puedes poner el número dinámico
    cajero: "Nombre del cajero",
  });

  const handleCajaClick = (index) => {
    alert(`Haz hecho clic en la Caja ${index + 1}`);
  };

  return (
    <main className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        {/* Lista de cajas */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {cajas.map((caja, index) => (
            <div
              key={index}
              className="flex items-center border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
            >
              {/* Ícono de usuario */}
              <div className="w-1/4 flex justify-center items-center">
                <div className="border rounded-full h-16 w-16 flex justify-center items-center text-2xl">
                  👤
                </div>
              </div>

              {/* Info de la caja */}
              <div className="flex-1 ml-4">
                {/* Botón Caja */}
                <button
                  onClick={() => handleCajaClick(index)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg inline-block mb-2 transition w-full"
                >
                  Caja {caja.caja}
                </button>

                {/* Nombre del cajero */}
                <div className="font-semibold">Cajero:</div>
                <div>{caja.cajero}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón Añadir Caja */}
        <div className="flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            onClick={()=> navigate("/añadirCaja")}
            >
            Añadir Caja
          </button>
        </div>
      </div>
    </main>
  );
}
