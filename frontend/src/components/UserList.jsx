import { useEffect } from "react"; 
import {getAllUsers} from "../api/user.api";

export function userList(){
    useEffect(() => {
        console.log("pagina cargada");
    }, [])

    return (
        <div>userList</div>
    )
}