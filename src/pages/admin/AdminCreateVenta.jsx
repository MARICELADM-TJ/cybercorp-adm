import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Mapa from "../../components/Mapa";
import { db } from "../../firebaseConfig/Firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/AdminCreateVenta.css";
import logo from "../../assets/logo_share.png";


const AdminCreateVenta = () => {
  const [formData, setFormData] = useState({
    localidad: "",
    cliente: "",
    celularCliente: "",
    titulo: "",
    cantidad: "",
    precio: "",
    fechaVenta: "",
    asesor: "",
    observacion: "seguimiento",
    tipoCliente: "interno",
    captacion: "nuevo",
  });

  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ventaId = searchParams.get("edit");

  useEffect(() => {
    const fetchVenta = async () => {
      if (ventaId) {
        setIsEditing(true);
        try {
          const docRef = doc(db, "ventas", ventaId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setFormData({
              ...data
            });
          } else {
            toast.error("Venta no encontrada");
          }
        } catch (error) {
          console.error("Error al cargar la venta:", error);
          toast.error("Error al cargar la venta");
        }
      }
    };

    fetchVenta();
  }, [ventaId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const {
      localidad,
      cliente,
      celularCliente,
      titulo,
      cantidad,
      precio,
      fechaVenta,
      asesor,
      tipoCliente,
      captacion
    } = formData;

    if (
      !localidad ||
      !cliente ||
      !celularCliente ||
      !titulo ||
      !cantidad ||
      !precio ||
      !fechaVenta ||
      !asesor ||
      !tipoCliente ||
      !captacion
    ) {
      let message = "Los campos ";
      if (!localidad) message += "Localidad, ";
      if (!cliente) message += "Cliente, ";
      if (!celularCliente) message += "Celular Cliente, ";
      if (!titulo) message += "Título, ";
      if (!cantidad) message += "Cantidad, ";
      if (!precio) message += "Precio, ";
      if (!fechaVenta) message += "Fecha Venta, ";
      if (!asesor) message += "Asesor, ";
      if (!tipoCliente) message += "Tipo Cliente, ";
      if (!captacion) message += "Captación, ";
      message += "son obligatorios.";
      toast.warn(message);
      return;
    }

    try {
      if (isEditing) {
        const docRef = doc(db, "ventas", ventaId);
        await updateDoc(docRef, formData);
        
        Swal.fire({
                icon: "success",
                title: "Venta actualizada correctamente",
                showClass: {
                  popup: "animate__animated animate__zoomIn",
                },
                hideClass: {
                  popup: "animate__animated animate__fadeOut",
                },
                showConfirmButton: false, // Oculta el botón "OK"
                timer: 1000, //cierra la animacion despues dde 1 segundo
                willClose: () => {
                  navigate("/admin-ventas");
                },
              });

      } else {
        await addDoc(collection(db, "ventas"), {
          ...formData,
          completada: false,
          inProgress: false,
        });
        Swal.fire({
          icon: "success",
          title: "Venta creada correctamente",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: false, // Oculta el botón "OK"
          timer: 1000, // Cierra la animacion despues de 1 segundo
          willClose: () => {
            navigate("/admin-ventas");
          },
        });
      }
      
    } catch (error) {
      console.error("Error al guardar la venta:", error);
      Swal.fire({
              icon: "error",
              title: "Error al guardar la venta",
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

  return (
    <div className="form-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>{isEditing ? "Editar Venta" : "Crear Venta"}</h2>
      </div>
      <form onSubmit={handleSave} className="form">
        <div className="form-group">
          <label htmlFor="localidad">Localidad</label>
          <input
            type="text"
            id="localidad"
            name="localidad"
            value={formData.localidad}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="cliente">Cliente</label>
          <textarea
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="celularCliente">Celular Cliente</label>
          <input
            type="text"
            id="celularCliente"
            name="celularCliente"
            value={formData.celularCliente}
            onChange={handleInputChange}
            
          />
        </div>
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
          <label htmlFor="cantidad">Cantidad</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            ></input>
        </div>
        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            ></input>
        </div>
        <div className="form-group">
          <label htmlFor="fechaVenta">Fecha de Venta</label>
          <input
            type="date"
            id="fechaVenta"
            name="fechaVenta"
            value={formData.fechaVenta}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="asesor">Asesor</label>
          <input
            type="text"
            id="asesor"
            name="asesor"
            value={formData.asesor}
            onChange={handleInputChange}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="tipoCliente">Tipo de Cliente</label>
          <select
            id="tipoCliente"
            name="tipoCliente"
            value={formData.tipoCliente}
            onChange={handleInputChange}

          >
            <option value="interno">Interno</option>
            <option value="externo">Externo</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="captacion">Captacion por</label>
          <select
            id="captacion"
            name="captacion"
            value={formData.captacion}
            onChange={handleInputChange}

          >
            <option value="recurrente">Cliente Recurrente</option>
            <option value="nuevo">Cliente Nuevo</option>
          </select>
        </div>
        <div className="form-buttons">
          <button
            type="button"
            className="btn cancel"
            onClick={() => navigate("/admin-ventas")}
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

export default AdminCreateVenta;
