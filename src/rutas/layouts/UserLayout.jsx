import React from "react";
import Navbar from "../../pages/NavBar";
import { Outlet } from "react-router-dom";
import '../layouts/Layout.css'
const UserLayout = ({role}) => {
  return (
    <div>
      <Navbar role = {role} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
