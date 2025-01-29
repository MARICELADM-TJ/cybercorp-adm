import React from "react";
import AdminNavbar from "../../pages/admin/AdminNavbar";
import { Outlet } from "react-router-dom";

const AdminLayout = ({role, userId}) => {
  return (
    <div>
      <AdminNavbar role={role} userId={userId} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
