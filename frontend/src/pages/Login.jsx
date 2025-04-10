import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
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
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-full focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-full focus:outline-none"
            />

            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white text-white py-2 rounded-full transition"
              onClick={() => navigate("/admin")}
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
