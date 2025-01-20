import React from "react";
import AdminNavbar from "../../pages/admin/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <div className="content">
        <Outlet /> {/* Renderiza las rutas secundarias */}
      </div>
    </div>
  );
};

export default AdminLayout;
