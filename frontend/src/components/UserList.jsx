import { useEffect, useState } from "react";
import { GetAllUsers } from "../api/user.api";
import ClientManagement from "../pages/clienteManagement";

export default function UserList() {

    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function CargarTareas() {
            const res = await GetAllUsers();
            console.log(res.data);
            setUsers(res.data);
        }
        CargarTareas();
    }, []);

    return (
       <ClientManagement users =  {users}/>
    );   
}