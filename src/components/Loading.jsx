import React from "react";
import "../styles/Loading.css"; // Archivo CSS con los estilos
import logo from "../assets/logo_share.png"; // Archivo de imagen

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="loading-animation">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      {/*<p className="loading-text">Cargando...</p> */}
    </div>
  );
};

export default Loading;
