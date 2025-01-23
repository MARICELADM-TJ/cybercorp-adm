import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/Firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateUser.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import logo from '../../assets/logo_share.png';
import AdminNavbar from "./AdminNavbar";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    role: "invitado",
    email: "",
    password: "",
    porDefecto: false,
  });

  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "porDefecto") {
      const isChecked = e.target.checked;
      setFormData((prevData) => ({
        ...prevData,
        password: isChecked ? `${formData.nombre}123` : "",
        porDefecto: isChecked,
      }));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const { nombre, apellido, celular, role, email, password } = formData;

    const currentUser = auth.currentUser;
    const adminEmail = currentUser.email;
    const adminPassword = prompt("Por favor, ingresa tu contraseña para confirmar:");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userRef = doc(collection(db, "users"), uid);
      await setDoc(userRef, {
        nombre,
        apellido,
        celular,
        role,
        email,
        active: true,
        lastLoginAt: "Nunca",
      });


      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      toast.success("Usuario creado exitosamente", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });

      setTimeout(() => navigate("/admin-users"), 2000);
      
    } catch (error) {
      toast.error("Error al crear el usuario: " + error.message, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  return (
    <div className="create-user-container">

      <div className="form-wrapper">
        <div className="left-panel">
          
        </div>
        <div className="right-panel">
        <div className="centrar">
          <img src={logo} alt="Logo" className="logo" />
          </div>
          <h2 className="form-title">Crear Usuario</h2>
          
          
          <form className="create-user-form" onSubmit={handleSaveUser}>
            <div className="form-row">
              <div className="left-half">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="right-half">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="left-half">
                <label>Celular</label>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="right-half">
                <label>Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="contabilidad">Contabilidad</option>
                  <option value="admin">Admin</option>
                  <option value="invitado">Invitado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="left-half">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="right-half">
                <label>Contraseña</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={formData.porDefecto}
                  required
                />
              </div>
            </div>

            <div className="form-row checkbox-container">
              <input
                type="checkbox"
                name="porDefecto"
                checked={formData.porDefecto}
                onChange={handleChange}
              />
              <label>Usar contraseña por defecto</label>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/admin-users")}
              >
                Cancelar
              </button>
              <button type="submit" className="save-button">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateUser;