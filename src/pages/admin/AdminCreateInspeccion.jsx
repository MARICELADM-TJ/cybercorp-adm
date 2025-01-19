import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Mapa from "../../components/Mapa";
import { db } from "../../firebaseConfig/Firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/createInspeccion.css";
import logo from "../../assets/logo_share.png";
import AdminNavbar from "./AdminNavbar";

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
    ubicacion: null,
  });
  const [isEditing, setIsEditing] = useState(false); // Para identificar si estamos editando

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inspectionId = searchParams.get("edit"); // Obtener el ID de inspección desde la URL

  // Cargar datos para edición
  useEffect(() => {
    const fetchInspection = async () => {
      if (inspectionId) {
        setIsEditing(true);
        try {
          const docRef = doc(db, "inspecciones", inspectionId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data());
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

  const handleSave = async (e) => {
    e.preventDefault();
    const {
      titulo,
      descripcion,
      fechaProgramada,
      horaProgramada,
      nombreCliente,
      apellidoCliente,
      celularCliente,
      encargado,
      ubicacion,
    } = formData;

    // Validar campos obligatorios
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
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      if (isEditing) {
        // Actualizar inspección existente
        const docRef = doc(db, "inspecciones", inspectionId);
        await updateDoc(docRef, formData);
        toast.success("Inspección actualizada exitosamente");
      } else {
        // Crear nueva inspección
        await addDoc(collection(db, "inspecciones"), {
          ...formData,
          completada: false,
          fechaInicio: null,
          fechaFin: null,
          inProgress: false,
        });
        toast.success("Inspección creada exitosamente");
      }
      navigate("/admin-inspecciones");
    } catch (error) {
      console.error("Error al guardar la inspección:", error);
      toast.error("Error al guardar la inspección");
    }
  };

  return (
    <div className="form-container">
      <AdminNavbar />
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
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Mapa (Ubicación)</label>
          <Mapa
            onLocationChange={(coords) =>
              setFormData({ ...formData, ubicacion: coords })
            }
            defaultLocation={formData.ubicacion}
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcionUbicacion">
            Descripción de la Ubicación
          </label>
          <textarea
            id="descripcionUbicacion"
            name="descripcionUbicacion"
            value={formData.descripcionUbicacion}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="fechaProgramada">Fecha Programada</label>
          <input
            type="date"
            id="fechaProgramada"
            name="fechaProgramada"
            value={formData.fechaProgramada}
            onChange={handleInputChange}
            required
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
            required
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
            required
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
            required
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
            required
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
            required
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
    </div>
  );
};

export default AdminCreateInspeccion;
