import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/AboutUs.css";
import defaultAvatar from '../assets/profileD.avif';
import { FaCrown, FaTools, FaCalculator, FaUser } from "react-icons/fa"; // Iconos

const AboutUs = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((user) => user.active === true); // Filtrar usuarios activos
        setUsers(usersData);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  const roleIcons = {
    Admin: <FaCrown className="role-icon admin" />,
    Tecnico: <FaTools className="role-icon tecnico" />,
    Contabilidad: <FaCalculator className="role-icon contabilidad" />,
    Invitado: <FaUser className="role-icon invitado" />,
  };

  return (
    <div className="about-us">
      <h1>Nosotros</h1>
      <p className="about-us-description">
        Conoce a nuestro equipo. Cada miembro desempeña un rol esencial en nuestra organización.
      </p>
      <div className="card-container">
        {users.map((user) => (
          <div key={user.id} className={`user-card ${user.role.toLowerCase()}`}>
            <img
              src={user.photoURL || defaultAvatar}
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
