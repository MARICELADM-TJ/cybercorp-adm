import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig/Firebase";
import { useNavigate } from "react-router-dom";
//import "../styles/CreateUser.css";
import logo from "../assets/logo_share.png";
import Swal from "sweetalert2";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validación básica
    const requiredFields = {
      nombre: "nombre",
      apellido: "apellido",
      celular: "celular",
      email: "email",
      password: "contraseña",
      confirmPassword: "confirmación de contraseña"
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: `Los siguientes campos son obligatorios: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      return;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    try {
      // Crear usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Guardar datos adicionales en Firestore
      const userRef = doc(collection(db, "users"), userCredential.user.uid);
      await setDoc(userRef, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        email: formData.email,
        role: "invitado",
        active: false,
        lastLoginAt: "Nunca",
        permissions: [], // Array vacío de permisos por defecto
        createdAt: new Date().toISOString(),
      });

      await Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Tu cuenta ha sido creada y está pendiente de activación por un administrador",
        showConfirmButton: true,
      });

      navigate("/login");
    } catch (error) {
      let errorMessage = "Error al crear la cuenta";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está registrado";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="create-user-container">
      <div className="form-wrapper">
        <div className="left-panel"></div>
        <div className="right-panel">
          <div className="centrar">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <h2 className="form-title">Registro de Usuario</h2>

          <form className="create-user-form" onSubmit={handleRegister}>
            <div className="form-row">
              <div className="left-half">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre"
                />
              </div>
              <div className="right-half">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="full-width">
                <label>Celular</label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Ingresa tu número de celular"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="full-width">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="left-half">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
              <div className="right-half">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                />
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/login")}
              >
                Cancelar
              </button>
              <button type="submit" className="save-button">
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;