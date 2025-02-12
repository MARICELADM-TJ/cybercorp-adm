// AdminLayout.jsx y UserLayout.jsx (pueden ser el mismo ahora)
import React from "react";
import SidebarNav from "../../components/SideBarNav";
import { Outlet } from "react-router-dom";

const Layout = ({ usuario }) => {
  return (
    <div>
      <SidebarNav usuario={usuario} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;