import React from "react";
import Navbar from "../../pages/NavBar";
import { Outlet } from "react-router-dom";
import '../layouts/Layout.css'
const UserLayout = ({ usuario, role }) => {
  return (
    <div>
      <Navbar usuario={usuario} role={role} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
