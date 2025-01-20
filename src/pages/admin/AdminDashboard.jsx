import React from 'react';
import '../../styles/AdminDashboard.css';
import logo from '../../assets/logo_share.png';
import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  return (
    <>
      <div className="admin-panel">
        <div className="animated-background"></div>
        <div className="admin-content">
          <h1>Bienvenido al Panel de Administración</h1>
          <p>
            Aquí se agregan nuevas Tareas, Inspecciones y también se pueden Editar y Eliminar.
          </p>
          <img src={logo} alt="Logo del Panel" className="dashboard-logo" />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
