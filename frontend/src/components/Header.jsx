import { useNavigate, useLocation} from "react-router-dom";

export default function Header() {

  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="bg-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img
          src="src/assets/medifast_logo.png"
          alt="Logo"
          className="h-9 w-auto mr-2"
        />
        <span className="text-3xl font-bold cursor-pointer">
          <span className="text-green-600">Medi</span>
          <span className="text-yellow-500">fast</span>
        </span>
      </div>
      
      {location.pathname !== "/" && (
          <button
            className="bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer px-4 py-2 rounded-lg font-semibold w-32"
            onClick={() => navigate(-1)}
          >
            Atrás
          </button>
        )}
    </header>
  );
}
