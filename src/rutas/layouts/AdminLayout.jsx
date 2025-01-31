import React from "react";
import AdminNavbar from "../../pages/admin/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = ({ usuario, role }) => {
  return (
    <div>
      <AdminNavbar usuario={usuario} role={role} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
