import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig/Firebase";
import "../../styles/AdminUsers.css";
import { useNavigate } from "react-router-dom";

import AdminNavbar from "./AdminNavbar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  // Obtener usuarios desde Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los usuarios: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Manejar la activación/desactivación de usuarios
  const handleToggleActive = async (userId, isActive) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { active: !isActive });
      // Actualizar estado local
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, active: !isActive } : user
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del usuario: ", error);
    }
  };

  // Filtrar usuarios (solo usuarios, no administradores)
  const filteredUsers = users.filter(
    (user) => user.role !== "admin" && `${user.nombre} ${user.apellido}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Administradores y usuarios regulares
  const admins = users.filter((user) => user.role === "admin");
  const regularUsers = filteredUsers;

  return (
    <div className="admin-users">
      <h1>Gestión de Usuarios</h1>
      <div className="actions-container">
        <button className="add-button" onClick={() => navigate('/admin-createUser')} >Agregar</button>
      </div>

      <h2>Administradores</h2>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Último acceso</th>
              
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.nombre}</td>
                <td>{admin.apellido}</td>
                <td>{admin.email}</td>
                <td>{admin.celular || "No disponible"}</td>
                <td>{admin.lastLoginAt || "No disponible"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Usuarios</h2>
      <input
        type="text"
        placeholder="Buscar por nombre y apellido"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Celular</th>
            <th>Último acceso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {regularUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.celular || "No disponible"}</td>
              <td>{user.lastLoginAt || "No disponible"}</td>
              <td>
                <button
                  className={`toggle-button ${
                    user.active ? "active" : "inactive"
                  }`}
                  onClick={() => handleToggleActive(user.id, user.active)}
                >
                  {user.active ? "Desactivar" : "Activar"}
                </button>
                {/*Posible funcion de editar usuarios para un super Administrador, pero innesesaria */}
                {/* <button className="edit-button">Editar</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;