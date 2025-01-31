import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig/Firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateUser.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import logo from "../../assets/logo_share.png";

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
  const [showModal, setShowModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

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
        password: isChecked ? "123456" : "",
        porDefecto: isChecked,
      }));
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    let message = "Los campos";
    let flag = false;
    if (!formData.nombre) {
      message += ", nombre ";
      flag = true;
    }
    if (!formData.apellido) {
      message += ", apellido";
      flag = true;
    }
    if (!formData.celular) {
      message += ", celular";
      flag = true;
    }
    if (!formData.email) {
      message += ", email";
      flag = true;
    }
    if (!formData.password) {
      message += ", contraseña";
      flag = true;
    }

    message += " son obligatorios";

    if (flag) {
      toast.warn(message);
      return;
    }

    setShowModal(true); // Abre el modal
  };

  const confirmSaveUser = async () => {
    const { nombre, apellido, celular, role, email, password } = formData;
    const currentUser = auth.currentUser;
    const adminEmail = currentUser.email;

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

      // toast.success("Usuario creado exitosamente", {
      //   position: "top-center",
      //   autoClose: 3000,
      //   theme: "dark",
      //   transition: Bounce,
      //});

      //setTimeout(() => navigate("/admin-users"), 2000);
      Swal.fire({
        icon: "success",
        title: "Usuario creado exitosamente",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut",
        },
        showConfirmButton: false,
        timer: 1000,
        willClose: () => {
          navigate("/admin-users");
        },
      });
    } catch (error) {
      // toast.error("Error al crear el usuario: " + error.message, {
      //   position: "top-center",
      //   autoClose: 3000,
      //   theme: "dark",
      //   transition: Bounce,
      // });
      Swal.fire({
        icon: "error",
        title: "Error al crear usuario",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut",
        },
        showConfirmButton: true,
        timer: 1000,
      });
    } finally {
      setAdminPassword(""); // Limpia la contraseña del modal
      setShowModal(false); // Cierra el modal
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
                />
              </div>
              <div className="right-half">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
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
                />
              </div>
              <div className="right-half">
                <label>Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="invitado">Invitado</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="contabilidad">Contabilidad</option>
                  <option value="admin">Admin</option>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmación</h3>
            <p>Ingresa tu contraseña para confirmar:</p>
            <input
              type="password"
              className="modal-input"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={confirmSaveUser}>Confirmar</button>
              <button
                onClick={() => {
                  setAdminPassword("");
                  setShowModal(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
