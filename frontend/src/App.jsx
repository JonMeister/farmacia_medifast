import { BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import Login from "./pages/Login";
import SelectorService from "./pages/Services";
import ScheduleSelector from "./pages/schedules";
import Shift from "./pages/shift";
import AdminDashboard from "./pages/admin";
import ClientManagement from "./pages/clienteManagement";
import CajerosView from "./pages/cajerosView";
import Resenas from "./pages/resenas";
import Estadisticas from "./pages/estadisticas";
import Header  from "./components/Header";

function App() { 
  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
      <BrowserRouter>
      
        <Header />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/clienteManagement" element={<ClientManagement />} />
          <Route path="/servicios" element={<SelectorService />} />
          <Route path="/schedules" element={<ScheduleSelector />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/cajeros" element={<CajerosView />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>

        {      <footer className="bg-green-900 text-white py-3 mt-3">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          {/* Sección de enlaces */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Enlaces</h3>
            <ul className="mt-2 space-y-1 px-3">
              <li>
                <a href="#" className="hover:text-yellow-200">
                  - Inicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-200">
                  - Productos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-200">
                  - Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Contacto</h3>
            <div className="px-3">
              <p className="mt-2">📍 Dirección: Calle 5, Cali, Colombia</p>
              <p>📞 Teléfono: +57 300 123 4567</p>
              <p>✉️ Email: contacto@medifast.com</p>
            </div>
          </div>

          {/* Derechos de autor y redes */}
          <div className="text-center md:text-right">
            <p className="text-sm">
              © {new Date().getFullYear()} Farmacia. Todos los derechos
              reservados.
            </p>
            <div className="flex space-x-4 mt-2 justify-center md:justify-end">
              <a href="#" className="hover:text-yellow-300">
                🌐 Facebook
              </a>
              <a href="#" className="hover:text-yellow-300">
                📷 Instagram
              </a>
              <a href="#" className="hover:text-yellow-300">
                🐦 Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>}
      </BrowserRouter>
    </div>
  );
}

export default App;
