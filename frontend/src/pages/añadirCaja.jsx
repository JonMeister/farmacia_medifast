import Button from "../components/Button";

export default function AñadirCaja(){
    return(
        <div className= "w-screen h-[76.5vh] flex items-center justify-center">
            <div className= "w-[30vw] h-[50vh] bg-white shadow-lg rounded-xl"> 
                <div className= "w-[25vw] h-[45vh] m-6 bg-white">
                    <h2 className="text-4xl font-bold mb-6 relative z-10">Datos</h2>
                    <div>
                        <label className="block mb-1">Nombre</label>
                        <input
                        type="text"
                        className="border-3 rounded px-4 py-2 w-3/4"
                        placeholder="Agregar texto"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Contraseña</label>
                        <input
                        type="text"
                        className="border-3 rounded px-4 py-2 w-3/4"
                        placeholder="Agregar texto"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Id</label>
                        <input
                        type="text"
                        className="border-3 rounded px-4 py-2 w-3/4"
                        placeholder="Agregar texto"
                        />
                    </div>
                    <button className="bg-green-600 text-white hover:bg-green-700 cursor-pointer px-6 py-2 mt-25 rounded-lg font-semibold">
                        Añadir Caja
                    </button>
                </div>         
            </div>
        </div>
    );   
};