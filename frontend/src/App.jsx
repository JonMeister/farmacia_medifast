import { BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import Login from "./pages/Login";
import SelectorService from "./pages/Services";
import ScheduleSelector from "./pages/schedules";
import Shift from "./pages/shift";
import AdminDashboard from "./pages/admin";
import CajerosView from "./pages/cajerosView";
import Resenas from "./pages/resenas";
import Estadisticas from "./pages/estadisticas";
import Turno from "./pages/turnos";
import AñadirCaja from "./pages/añadirCaja";
import Header  from "./components/Header";
import UserList from "./components/UserList";
import Footer from "./components/Footer";

function App() { 
  return (
    <div
    className="max-h-screen bg-gray-300 flex flex-col bg-cover bg-center"
    style={{ backgroundImage: "url(src/assets/FondoClaro.jpg)" }}
    >
      <BrowserRouter>      
        <Header />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/clienteManagement" element={<UserList/>} />
          <Route path="/servicios" element={<SelectorService />} />
          <Route path="/schedules" element={<ScheduleSelector />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/cajeros" element={<CajerosView />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/turno" element={<Turno />} />
          <Route path="/añadirCaja" element={<AñadirCaja />} />
        </Routes>

        <Footer />

      </BrowserRouter>
    </div>
  );
}
//ORIGINAL
export default App;
