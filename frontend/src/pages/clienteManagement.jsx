export default function ClientManagement( {users} ) {
  console.log(users)
  const clients = Array.isArray(users) ? users : [];

  return (
    <main className="flex-1 p-8 flex gap-8">
      {/* Tabla de clientes */}
      <div className="flex-1 bg-white rounded-xl shadow p-6">
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Buscar"
            className="border rounded px-4 py-2 flex-1 mr-4"
          />
          <button className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
            Seleccionar
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="border-b">
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Identificación</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client.id} className="border-b">
                <td>
                  <input type="checkbox" />
                </td>
                <td>{client.first_name}</td>
                <td>{client.last_name}</td>
                <td>{client.cc}</td>
                <td>{client.prioridad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de edición */}
      <div className="w-1/3 bg-white rounded-lg shadow p-6 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 h-full w-1/2 bg-green-700"
          style={{
            clipPath: "polygon(100% 0, 0% 0, 100% 100%)",
            borderRadius: "0 8px 8px 0",
            transform: "scaleY(-1)",
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
          }}
        ></div>

        <h2 className="text-4xl font-bold mb-6 relative z-10">Datos</h2>
        <div className="space-y-5 relative z-10 pr-20">
          <div>
            <label className="block mb-1">Nombre</label>
            <input
              type="text"
              className="border-3 rounded px-4 py-2 w-3/4"
              placeholder="Agregar texto"
            />
          </div>
          <div>
            <label className="block mb-1">Apellido</label>
            <input
              type="text"
              className="border-3 rounded px-4 py-2 w-3/4"
              placeholder="Agregar texto"
            />
          </div>
          <div>
            <label className="block mb-1">Prioridad</label>
            <input
              type="text"
              className="border-3 rounded px-4 py-2 w-3/4"
              placeholder="Agregar texto"
            />
          </div>
          <button className="bg-green-600 text-white hover:bg-green-700 cursor-pointer px-6 py-2 rounded-lg font-semibold mt-4">
            Editar
          </button>
        </div>
      </div>
    </main>
  );
}
