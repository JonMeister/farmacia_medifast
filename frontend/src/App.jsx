import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import SelectorService from "./pages/Services";
import ScheduleSelector from "./pages/schedules";
import Shift from "./pages/shift";
import AdminDashboard from "./pages/admin";
import Cajas from "./pages/cajas";
import Resenas from "./pages/resenas";
import Estadisticas from "./pages/estadisticas";
import Turno from "./pages/turnos";
import Header from "./components/Header";
import UserList from "./components/UserList";
import Footer from "./components/Footer";
import Cajero from "./pages/cajero";
import Producto from "./pages/producto";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div
      className="min-h-screen bg-gray-300 flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(src/assets/FondoClaro.jpg)" }}
    >
      <BrowserRouter>
        <Header />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/clienteManagement" element={<UserList />} />
          <Route path="/servicios" element={<SelectorService />} />
          <Route path="/schedules" element={<ScheduleSelector />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/cajas" element={<Cajas />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/turno" element={<Turno />} />
          <Route path="/cajero" element={<Cajero />} />
          <Route path="/producto" element={<Producto />} />
        </Routes>
        <Toaster />
        <Footer />
      </BrowserRouter>
    </div>
  );
}
//ORIGINAL
export default App;
