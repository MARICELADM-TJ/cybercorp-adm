import React from "react";
import ParticlesComponent from "../components/ParticlesComponent";
import "../styles/Login.css";
import logo from "../assets/logo_share.png";

import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig/Firebase";

import { useNavigate } from "react-router-dom";
//alerta
import { ToastContainer, toast, Bounce } from "react-toastify";

const auth = getAuth(appFirebase);

const Login = () => {
  const navigate = useNavigate();

  const autenticacion = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const contrasena = e.target.password.value;

    try {
      // Intentar inicio de sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, contrasena);
      const user = userCredential.user;

      // Obtener datos del usuario desde Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error("Usuario no encontrado en Firestore");
      }

      const userData = userSnapshot.data();

      // Verificar si el usuario está desactivado
      if (!userData.active) {
        await signOut(auth); // Desloguear si está desactivado
        // toast.error("Usuario desactivado. Contacte al administrador.", {
        //   position: "top-center",
        //   autoClose: 3000,
        //   hideProgressBar: false,
        //   closeOnClick: false,
        //   pauseOnHover: false,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "dark",
        //   transition: Bounce,
        // });
        Swal.fire({
          icon: "error",
          title: "Usuario desactivado. Contacte al administrador.",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: true,
          timer: 1000,
        });
        return;
      }

      // Registrar la fecha y hora del inicio de sesión en Firestore
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString(); // Formato: dd/mm/aaaa
      const formattedTime = currentDate.toLocaleTimeString(); // Formato: hh:mm:ss

      await updateDoc(userRef, {
        lastLoginAt: `${formattedDate} ${formattedTime}`, // Fecha y hora combinadas
      });

      // Redirigir al home si todo es correcto
      navigate("/home");
    } catch (e) {
      if(!email || !contrasena){
        let message = "Ingrese ";
        if(!email){
          message += "correo ";
        }
        if(!contrasena){
          message += ",contraseña";
        }
        Swal.fire({
          icon: "error",
          title: message,
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: true,
          //timer: 1000,
        });
      }
      // Mostrar error si falla el inicio de sesión
      // toast.error("Correo o contraseña incorrectas", {
      //   position: "top-center",
      //   autoClose: 3000,
      //   hideProgressBar: false,
      //   closeOnClick: false,
      //   pauseOnHover: false,
      //   draggable: true,
      //   progress: undefined,
      //   theme: "dark",
      //   transition: Bounce,
      // });
      else
      Swal.fire({
        icon: "error",
        title: "Correo o contraseña incorrectas",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut",
        },
        showConfirmButton: true,
        //timer: 1000,
      });
      console.error("Error al iniciar sesión:", e);
    }
  };

  return (
    <div className="login-container">
      <ParticlesComponent id="particles" />
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
