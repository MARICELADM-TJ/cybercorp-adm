import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo_share.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig/Firebase";
import defaultAvatar from "../assets/profileD.avif";

const Navbar = ({ role, usuario }) => {
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (usuario?.uid) {
        const userDoc = doc(db, "users", usuario.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };

    fetchUserData();
  }, [usuario]); // Dependencia: usuario

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "Usuario";
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="w-100">
          <Link to="/home" className="navbar-brand mx-auto d-lg-none">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>

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

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link to="/home" className="nav-link">
                  📋 Ver Tareas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/inspecciones" className="nav-link">
                  ✅ Ver Inspecciones
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/nosotros" className="nav-link">
                  ℹ️ Equipo...
                </Link>
              </li>
            </ul>

            <Link to="/home" className="navbar-brand mx-auto d-none d-lg-flex">
              <img src={logo} alt="Logo" className="navbar-logo" />
            </Link>

            <div className="navbar-right d-flex align-items-center">
              {role === "admin" && (
                <Link to="/admin-dashboard" className="logout-button btn btn-danger">
                  Admin
                </Link>
              )}
              <div className="user-info" onClick={() => navigate("/editProfile")}>
                {/* <img
                  src={userData?.photoURL || defaultAvatar}
                  alt="Foto de perfil"
                  className="profile-photo"
                /> */}
                <span className="user-name">
                  {getFirstName(userData?.nombre || usuario?.displayName || "Usuario")}
                </span>
              </div>
              <button className="logout-button btn btn-danger" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;