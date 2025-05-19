import { useEffect, useState } from "react";
import { GetAllUsers } from "../api/user.api";
import ClientManagement from "../pages/clienteManagement";

export default function UserList() {
  const [users, setUsers] = useState([]);

  const isStaff = localStorage.getItem("is_staff") === "true"; 

  if (!isStaff) {
    return <p>No tienes permiso para acceder a esta sección.</p>;
  }
  
  useEffect(() => {
    async function CargarTareas() {
      const res = await GetAllUsers();
      console.log(res.data);
      setUsers(res.data);
    }
    CargarTareas();
  }, []);

  return <ClientManagement users={users} />;
}
