import Button from "../components/Button"

export default function ScheduleSelector() {
    const horarios = [
      { fecha: "2025/04/05", dia: "Lunes", hora: "2:00pm" },
      { fecha: "2025/04/05", dia: "Martes", hora: "2:00pm" },
      { fecha: "2025/04/05", dia: "Miércoles", hora: "2:00pm" },
      { fecha: "2025/04/05", dia: "Jueves", hora: "2:00pm" },
    ];
  
    return (
      <div className="bg-white rounded-lg p-6 shadow w-full max-w-4xl mx-auto flex">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4">Seleccione El Horario</h2>
          <div className="space-y-3 mb-6">
            {horarios.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-teal-600" />
                <span className="text-sm">{item.fecha}</span>
                <span className="text-sm">{item.dia}</span>
                <span className="text-sm">{item.hora}</span>
              </div>
            ))}
          </div>
          <Button className="w-full">Seleccionar</Button>
        </div>       
      </div>
    );
  }
