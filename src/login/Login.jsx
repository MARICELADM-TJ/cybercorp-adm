import React from "react";
import ParticlesComponent from "../components/ParticlesComponent";
import '../styles/Login.css';
import logo from '../assets/logo_share.png';

import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { useNavigate } from "react-router-dom";
//alerta
import { ToastContainer, toast, Bounce } from 'react-toastify';

const auth = getAuth(appFirebase);


const Login = () => {
    const navigate = useNavigate();
    const autenticacion = async(e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const contrasena = e.target.password.value;

        try {
            e.target.email.value = '';
            e.target.password.value = '';
            await signInWithEmailAndPassword(auth, email, contrasena);
            navigate('/home');
        } catch (e) {
            toast.error('Correo o contraseña incorrectas', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
                });
        }

    }

  return (
    <div className="login-container">
      <ParticlesComponent id = 'particles'/>
      <div className="login-form-container">
        <img src={logo} alt="Logo" className="login-logo" />
        <form className="login-form" onSubmit={autenticacion}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="login-input"
            id="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            id="password"
          />
          <button className="login-button">Ingresar</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
