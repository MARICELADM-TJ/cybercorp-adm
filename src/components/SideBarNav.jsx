import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaUsers, FaClipboardList, 
         FaSignOutAlt, FaCalendarAlt, FaUserFriends, 
         FaCog, FaBars } from 'react-icons/fa';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig/Firebase';
import '../styles/SidebarNav.css';
import { FaSackDollar } from 'react-icons/fa6';

const PERMISSIONS = {
  VIEW_INSPECTIONS: 'view_inspections',
  MANAGE_TASKS: 'manage_tasks',
  MANAGE_INSPECTIONS: 'manage_inspections',
  MANAGE_SALES: 'manage_sales',
  VIEW_CALENDAR: 'view_calendar',
  MANAGE_USERS: 'manage_users',
};

const NavItem = ({ to, icon: Icon, label, isActive }) => (
  <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
    <Icon className="nav-icon" />
    <span className="nav-label">{label}</span>
  </Link>
);

const SidebarNav = ({ usuario }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

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
      .then(() => navigate('/'))
      .catch((error) => console.error('Error al cerrar sesión:', error));
  };

  const hasPermission = (permission) => {
    if (!userData) return false;
    if (userData.role === 'admin') return true;
    return userData.permissions?.includes(permission);
  };

  const navItems = [
    { to: '/home', icon: FaHome, label: 'Home', alwaysShow: true },
    { to: '/nosotros', icon: FaUserFriends, label: 'Equipo', alwaysShow: true },
    { to: '/inspecciones', icon: FaClipboardList, label: 'Inspecciones e Instalaciones', 
      permission: PERMISSIONS.VIEW_INSPECTIONS },
    { to: '/admin-tareas', icon: FaTasks, label: 'Administrar Tareas', 
      permission: PERMISSIONS.MANAGE_TASKS },
    { to: '/admin-inspecciones', icon: FaClipboardList, label: 'Administrar Inspecciones e Instalaciones', 
      permission: PERMISSIONS.MANAGE_INSPECTIONS },
    { to: '/admin-ventas', icon: FaSackDollar, label: 'Administrar Ventas', 
      permission: PERMISSIONS.MANAGE_SALES },
    { to: '/admin-dashboard', icon: FaCalendarAlt, label: 'Calendario', 
      permission: PERMISSIONS.VIEW_CALENDAR },
    { to: '/admin-users', icon: FaUsers, label: 'Gestionar Usuarios', 
      permission: PERMISSIONS.MANAGE_USERS, adminOnly: true },
  ];

  return (
    <header className="top-nav">
      <nav className="nav-container">
        <div className="mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <FaBars />
        </div>

        <div className={`nav-items ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => {
            const shouldShow = item.alwaysShow || 
              (item.adminOnly ? userData?.role === 'admin' : hasPermission(item.permission));
            
            if (!shouldShow) return null;

            return (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            );
          })}
        </div>

        <div className="nav-actions">
          <div className="user-info" onClick={() => navigate("/editProfile")}>
            <FaCog className="nav-icon" />
            <span className="nav-label">
              {userData?.nombre?.split(" ")[0] || usuario?.displayName || "Usuario"}
            </span>
          </div>
          
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default SidebarNav