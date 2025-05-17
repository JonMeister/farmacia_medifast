import React, {useState}from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [cc, setCc] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/authtoken", {
        cc: Number(cc),
        password: password,
      });

      const {token,is_staff} = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("is_staff", is_staff)
      
      console.log(token)                   //Eliminar despues
      console.log("Admin:", is_staff);     //Eliminar despues

      if (is_staff){
        navigate("/admin")
      }else {navigate("/turno")}

    } catch (error) {
      alert("Error al iniciar sesión: " +
        (error.response?.data?.non_field_errors?.[0] || "Credenciales inválidas"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm">
          <img
            src="src/assets/medifast_logo.png"
            alt="Logo"
            className="w-40 mx-auto mb-6"
          />
          <h2 className="text-center text-xl font-semibold mb-6">
            Welcome to Login
          </h2>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-6 space-x-4">
            <button className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white">
              Login
            </button>
            <button className="px-4 py-2 rounded-full border border-green-600 text-green-600 hover:bg-green-100 ">
              Register
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4"
          onSubmit={handleLogin}
          >            
            <input
              type="number"
              placeholder="Cedula De Ciudadania"
              value = {cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-full px-4 py-2 border rounded-full focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-full focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-white py-2 rounded-full transition"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}