import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/EditProfile.css";
import defaultAvatar from "../assets/profileD.avif";

const EditProfile = ({ userId }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    celular: "",
    email: "",
    //photoURL: "",
  });

  const [photoPreview, setPhotoPreview] = useState(defaultAvatar); // Foto por defecto
  const navigate = useNavigate();

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const userSnap = await getDoc(docRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            celular: data.celular || "",
            email: data.email || "",
            //photoURL: data.photoURL || "",
          });
          setPhotoPreview(data.photoURL || defaultAvatar);
        } else {
          toast.error("Usuario no encontrado");
          navigate(-1); // Redirige a la página anterior si no se encuentra
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        toast.error("Error al cargar datos del usuario");
        navigate(-1);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Verificar y actualizar la foto de perfil
  // const handleVerifyPhotoURL = () => {
  //   if (formData.photoURL) {
  //     const timeout = 5000; // 5 segundos
  //     const controller = new AbortController();
  //     const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  //     fetch(formData.photoURL, { signal: controller.signal })
  //       .then((response) => {
  //         clearTimeout(timeoutId); // Limpiar el timeout si la respuesta es exitosa
  //         if (response.ok) {
  //           const contentType = response.headers.get("Content-Type");
  //           if (contentType && contentType.startsWith("image")) {
  //             setPhotoPreview(formData.photoURL);
  //             toast.success("Foto de perfil actualizada");
  //           } else {
  //             throw new Error("El enlace no es una imagen válida");
  //           }
  //         } else {
  //           throw new Error("No se pudo cargar la foto");
  //         }
  //       })
  //       .catch((error) => {
  //         clearTimeout(timeoutId); // Limpiar el timeout en caso de error
  //         setPhotoPreview(defaultAvatar);
  //         toast.error(error.message || "No se pudo cargar la foto, revisa el link");
  //       });
  //   } else {
  //     setPhotoPreview(defaultAvatar);
  //     toast.error("El campo de la URL está vacío");
  //   }
  // };

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // if(handleVerifyPhotoURL()){
        
      // }
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        //photoURL: formData.photoURL,
      });

      toast.success("Perfil actualizado correctamente");
      navigate(-1); // Redirige a la página anterior
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      toast.error("Error al guardar el perfil");
    }
  };

  // Cancelar cambios
  const handleCancel = () => {
    navigate(-1); // Redirige a la página anterior
  };

  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSave} className="edit-profile-form">
        {/* Foto de perfil */}
        <div className="form-group photo-group">
          <img src={photoPreview} alt="Foto de perfil" className="profile-photo" />
          {/* <label htmlFor="photoURL">Link de la Foto</label>
          <input
            type="text"
            id="photoURL"
            name="photoURL"
            value={formData.photoURL}
            onChange={handleInputChange}
          />
          <button type="button" onClick={handleVerifyPhotoURL} className="btn verify">
            Verificar
          </button> */}
        </div>

        {/* Nombre */}
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

        {/* Apellido */}
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

        {/* Celular */}
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

        {/* Correo (solo lectura) */}
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input type="email" id="email" name="email" value={formData.email} readOnly />
        </div>

        {/* Botones */}
        <div className="form-buttons">
          <button type="button" className="btn cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn save">
            Guardar
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditProfile;
