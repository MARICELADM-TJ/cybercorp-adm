import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Mapa from "../../components/Mapa";
import { db } from "../../firebaseConfig/Firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/createInspeccion.css";
import logo from "../../assets/logo_share.png";


const AdminCreateInspeccion = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    descripcionUbicacion: "",
    fechaProgramada: "",
    horaProgramada: "",
    nombreCliente: "",
    apellidoCliente: "",
    celularCliente: "",
    encargado: "",
    linkCotizacion: "",
    ubicacion: [-21.5355, -64.7295], // Valor predeterminado
    EstadoFinal: "seguimiento",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [locationLink, setLocationLink] = useState(""); // Link de ubicación para verificar

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inspectionId = searchParams.get("edit");

  useEffect(() => {
    const fetchInspection = async () => {
      if (inspectionId) {
        setIsEditing(true);
        try {
          const docRef = doc(db, "inspecciones", inspectionId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            // Configura los datos obtenidos y asegura un valor predeterminado para `ubicacion`
            setFormData({
              ...data,
              ubicacion: data.ubicacion || [-21.5355, -64.7295],
            });
          } else {
            toast.error("Inspección no encontrada");
          }
        } catch (error) {
          console.error("Error al cargar la inspección:", error);
          toast.error("Error al cargar la inspección");
        }
      }
    };

    fetchInspection();
  }, [inspectionId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const verifyLocation = () => {
    //console.log("Verificando enlace...");
    // Regex para extraer coordenadas de enlaces de Google Maps
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/; // Detecta @lat,lng en enlaces
    const match = locationLink.match(regex);
  
    if (match) {
      console.log("Coordenadas encontradas:", match[1], match[2]);
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
  
      // Validación básica de latitud y longitud
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData((prevData) => ({
          ...prevData,
          ubicacion: [lat, lng],
        }));
        toast.success("Ubicación actualizada correctamente");
        return;
      }
    }


    //console.log("No se pudieron extraer coordenadas");
    // Si el enlace no es válido, muestra un error
    toast.error("No se pudo extraer la ubicación del link. Asegúrate de que sea válido.");
  };
  
  
  

  const handleSave = async (e) => {
    e.preventDefault();

    const {
      titulo,
      descripcion,
      descripcionUbicacion,
      fechaProgramada,
      horaProgramada,
      nombreCliente,
      apellidoCliente,
      celularCliente,
      encargado,
      ubicacion,
    } = formData;

    if (
      !titulo ||
      !descripcion ||
      !fechaProgramada ||
      !horaProgramada ||
      !nombreCliente ||
      !apellidoCliente ||
      !celularCliente ||
      !encargado ||
      !ubicacion
    ) {
      let message = "Los campos ";
      if (!titulo) message += "Título, ";
      if (!descripcion) message += "Descripción, ";
      if (!fechaProgramada) message += "Fecha Programada, ";
      if (!horaProgramada) message += "Hora Programada, ";
      if (!nombreCliente) message += "Nombre del Cliente, ";
      if (!apellidoCliente) message += "Apellido del Cliente, ";
      if (!celularCliente) message += "Celular del Cliente, ";
      if (!encargado) message += "Encargado, ";
      if (!ubicacion) message += "Ubicación, ";
      message += "son obligatorios.";
      toast.warn(message);
      return;
    }

    try {
      if (isEditing) {
        const docRef = doc(db, "inspecciones", inspectionId);
        await updateDoc(docRef, formData);
        
        Swal.fire({
                icon: "success",
                title: "Inspeccion actualizada correctamente",
                showClass: {
                  popup: "animate__animated animate__zoomIn", // Animación de entrada
                },
                hideClass: {
                  popup: "animate__animated animate__fadeOut", // Animación de salida sin movimiento
                },
                showConfirmButton: false, // Oculta el botón "OK"
                timer: 1000, // Cierra automáticamente después de 1.5 segundos
                willClose: () => {
                  navigate("/admin-inspecciones");
                },
              });

      } else {
        await addDoc(collection(db, "inspecciones"), {
          ...formData,
          completada: false,
          fechaInicio: null,
          fechaFin: null,
          inProgress: false,
        });
        Swal.fire({
          icon: "success",
          title: "Inspeccion creada correctamente",
          showClass: {
            popup: "animate__animated animate__zoomIn", // Animación de entrada
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut", // Animación de salida sin movimiento
          },
          showConfirmButton: false, // Oculta el botón "OK"
          timer: 1000, // Cierra automáticamente después de 1.5 segundos
          willClose: () => {
            navigate("/admin-inspecciones");
          },
        });
      }
      
    } catch (error) {
      console.error("Error al guardar la inspección:", error);
      //toast.error("Error al guardar la inspección");
      Swal.fire({
              icon: "error",
              title: "Error al guardar la inspeccion",
              showClass: {
                popup: "animate__animated animate__lightSpeedInRight", // Animación de entrada
              },
              hideClass: {
                popup: "animate__animated animate__flipOutX", // Animación de salida sin movimiento
              },
              showConfirmButton: false, // Oculta el botón "OK"
              timer: 1000, // Cierra automáticamente después de 1.5 segundos
            });
    }
  };

  return (
    <div className="form-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>{isEditing ? "Editar Inspección" : "Crear Inspección"}</h2>
      </div>
      <form onSubmit={handleSave} className="form">
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label>Mapa (Ubicación)</label>
          <Mapa
          onLocationChange={(coords) =>
              setFormData((prevData) => ({ ...prevData, ubicacion: coords }))
            }
            defaultLocation={formData.ubicacion}
          />

        </div>
        <div className="form-group">
          <label htmlFor="locationLink">Link de Ubicación</label>
          <div className="location-link-group">
            <input
              type="text"
              id="locationLink"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="Pega aquí el link de Google Maps"
            />
            <button type="button" onClick={verifyLocation}>
              Verificar
            </button>

            
          </div>
          <label htmlFor="locationLink">Descripcion de la ubicacion</label>
          <input
            type="text"
            id="descripcionUbicacion"
            name="descripcionUbicacion"
            value={formData.descripcionUbicacion}
            onChange={handleInputChange}
            />
        </div>
        <div className="form-group">
          <label htmlFor="EstadoFinal">Estado Final</label>
          <select
            id="EstadoFinal"
            name="EstadoFinal"
            value={formData.EstadoFinal}
            onChange={handleInputChange}
            
          >
            <option value="venta">Venta</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="no le interesa">No le interesa</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="fechaProgramada">Fecha Programada</label>
          <input
            type="date"
            id="fechaProgramada"
            name="fechaProgramada"
            value={formData.fechaProgramada}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="horaProgramada">Hora Programada</label>
          <input
            type="time"
            id="horaProgramada"
            name="horaProgramada"
            value={formData.horaProgramada}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="nombreCliente">Nombre del Cliente</label>
          <input
            type="text"
            id="nombreCliente"
            name="nombreCliente"
            value={formData.nombreCliente}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="apellidoCliente">Apellido del Cliente</label>
          <input
            type="text"
            id="apellidoCliente"
            name="apellidoCliente"
            value={formData.apellidoCliente}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="celularCliente">Celular del Cliente</label>
          <input
            type="text"
            id="celularCliente"
            name="celularCliente"
            value={formData.celularCliente}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="encargado">Encargado de la Inspección</label>
          <input
            type="text"
            id="encargado"
            name="encargado"
            value={formData.encargado}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="linkCotizacion">Link de Cotización</label>
          <input
            type="text"
            id="linkCotizacion"
            name="linkCotizacion"
            value={formData.linkCotizacion}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="btn cancel"
            onClick={() => navigate("/admin-inspecciones")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn submit">
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AdminCreateInspeccion;
