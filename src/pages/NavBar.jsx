import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

import logo from "../assets/logo_share.png";

// Importar Bootstrap y JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signOut } from "firebase/auth";

const Navbar = ({role}) => {
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/"); // Redirige al usuario a la página de inicio de sesión tras cerrar sesión
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="w-100">
          {/* Logo centrado para móvil */}
          <Link to="/home" className="navbar-brand mx-auto d-lg-none">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>

          {/* Botón del menú móvil */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Opciones del menú */}
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Enlaces alineados a la izquierda */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/home" className="nav-link">
                  📋 Ver Tareas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/home" className="nav-link">
                  ✅ Ver Inspecciones
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/home" className="nav-link">
                  ℹ️ Nosotros...
                </Link>
              </li>
            </ul>

            {/* Logo centrado para pantallas grandes */}
            <Link to="/home" className="navbar-brand mx-auto d-none d-lg-flex">
              <img src={logo} alt="Logo" className="navbar-logo" />
            </Link>

            {/* Botones a la derecha */}
            <div className="navbar-right d-flex align-items-center">
            {role === "admin" && (
              <Link to="/admin-dashboard" className="logout-button btn btn-danger">
                Admin
              </Link>
            )}
              <button
                className="logout-button btn btn-danger"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Espaciador para compensar el navbar fijo */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;
