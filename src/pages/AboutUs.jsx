import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/AboutUs.css";
import defaultAvatar from '../assets/profileD.avif';
import { FaCrown, FaTools, FaCalculator, FaUser } from "react-icons/fa"; // Iconos

import ImageAdmin from '../assets/admin.png';
import ImageTecnico from '../assets/tecnico.png';
import ImageContabilidad from '../assets/contador.png';
import ImageInvitado from '../assets/invitado.png';

const AboutUs = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((user) => user.active === true); // Filtrar usuarios activos

        // Ordenar usuarios: Admin -> Contabilidad -> Tecnico -> Invitado
        const roleOrder = { admin: 1, contabilidad: 2, tecnico: 3, invitado: 4 };
        usersData.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

        setUsers(usersData);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Función para obtener la imagen según el rol
  const getRoleImage = (role) => {
    switch (role) {
      case "admin" || 'Admin':
        return ImageAdmin;
      case "contabilidad" || 'Contabilidad':
        return ImageContabilidad;
      case "tecnico" || 'Tecnico':
        return ImageTecnico;
      case "invitado" || 'Invitado':
        return ImageInvitado;
      default:
        return defaultAvatar;
    }
  };

  const roleIcons = {
    Admin: <FaCrown className="role-icon admin" />,
    Tecnico: <FaTools className="role-icon tecnico" />,
    Contabilidad: <FaCalculator className="role-icon contabilidad" />,
    Invitado: <FaUser className="role-icon invitado" />,
  };

  return (
    <div className="about-us">
      <h1>Equipo</h1>
      <p className="about-us-description">
        Conoce a nuestro equipo. Cada miembro desempeña un rol esencial en nuestra organización.
      </p>
      <div className="card-container">
        {users.map((user) => (
          <div key={user.id} className={`user-card ${user.role.toLowerCase()}`}>
            <img
              src={user.photoURL || getRoleImage(user.role)} // Usar photoURL o imagen predeterminada según el rol
              alt={`${user.nombre} ${user.apellido}`}
              className="user-photo"
            />
            <div className="user-details">
              <h3>{`${user.nombre} ${user.apellido}`}</h3>
              <div className="role">
                {roleIcons[user.role] || <FaUser className="role-icon" />}
                <span>{user.role}</span>
              </div>
              <p className="user-phone">{user.celular}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;