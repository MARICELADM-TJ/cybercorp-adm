import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/AdminNavbar.css';
import logo from '../../assets/logo_share.png';
import { FaHome, FaTasks, FaUsers, FaClipboardList, FaBars, FaSignOutAlt } from 'react-icons/fa';

import appFirebase from '../../firebaseConfig/Firebase';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig/Firebase';

const AdminNavbar = ({ usuario }) => {
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  }, [usuario]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "Admin";
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <FaBars />
        </button>
        <ul className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link to="/admin-dashboard">
              <FaClipboardList /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin-tareas">
              <FaTasks /> Tareas
            </Link>
          </li>
          <li>
            <Link to="/admin-inspecciones">
              <FaClipboardList /> Inspecciones
            </Link>
          </li>
          <li>
            <Link to="/admin-users">
              <FaUsers /> Usuarios
            </Link>
          </li>
          <li className="mobile-only">
            <Link to="/home">
              <FaHome /> Home
            </Link>
          </li>
          <li className="mobile-only">
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
      <div className="navbar-center">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>
      <div className="navbar-right desktop-only">
        <Link to="/home" className="home-link">
          <FaHome /> Home
        </Link>

        <div className="user-info" onClick={() => navigate("/editProfile")}>
          <span className="user-name">
            {getFirstName(userData?.nombre || usuario?.displayName || "Admin")}
          </span>
        </div>

        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;