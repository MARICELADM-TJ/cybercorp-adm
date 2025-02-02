import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/EditProfile.css";
import defaultAvatar from "../assets/profileD.avif";

const EditProfile = ({ userId, setUsuario }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    newPassword: "",
  });

  const [photoPreview, setPhotoPreview] = useState(defaultAvatar);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          console.error("userId no está definido");
          return;
        }

        const docRef = doc(db, "users", userId);
        const userSnap = await getDoc(docRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            celular: data.celular || "",
            email: data.email || "",
            newPassword: "",
          });
          setPhotoPreview(data.photoURL || defaultAvatar);
        } else {
          Swal.fire({
            icon: "error",
            title: "Usuario no encontrado",
            showClass: {
              popup: "animate__animated animate__fadeInDown",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOutUp",
            },
          });
          navigate(-1);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos del usuario",
          showClass: {
            popup: "animate__animated animate__shakeX",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
        navigate(-1);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!userId) {
        console.error("userId no está definido");
        return;
      }

      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
      });

      
      if (formData.newPassword) {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          await updatePassword(user, formData.newPassword);
          Swal.fire({
            icon: "success",
            title: "Contraseña actualizada correctamente",
            showClass: {
              popup: "animate__animated animate__zoomIn",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOut",
            },
            showConfirmButton: false,
            timer: 1000,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "No se pudo actualizar la contraseña",
            text: "El usuario no está autenticado.",
            showClass: {
              popup: "animate__animated animate__shakeX",
            },
            hideClass: {
              popup: "animate__animated animate__fadeOutUp",
            },
          });
        }
      }

      if (setUsuario) {
        setUsuario((prevUsuario) => ({
          ...prevUsuario,
          displayName: `${formData.nombre} ${formData.apellido}`,
        }));
      }

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado correctamente",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut",
        },
        showConfirmButton: false,
        timer: 1000,
        willClose: () => {
          navigate(-1);
        },
      });
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar el perfil",
        text: error.message,
        showClass: {
          popup: "animate__animated animate__lightSpeedInRight",
        },
        hideClass: {
          popup: "animate__animated animate__flipOutX",
        },
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSave} className="edit-profile-form">
        <div className="form-group photo-group">
          <img src={photoPreview} alt="Foto de perfil" className="profile-photo" />
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="celular">Celular</label>
          <input
            type="text"
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" id="email" name="email" value={formData.email} readOnly />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Dejar en blanco para no cambiar"
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="btn cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn save">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;