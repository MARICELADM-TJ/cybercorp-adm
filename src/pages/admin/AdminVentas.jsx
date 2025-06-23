import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig/Firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "../../styles/AdminVentas.css";
import { toast, ToastContainer } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Modal from "react-modal";

const AdminVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [currentVentaId, setCurrentVentaId] = useState("");
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    if (!isoString) return "N/C";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const ventasSnapshot = await getDocs(collection(db, "ventas"));
        const ventasData = ventasSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setVentas(ventasData);
      } catch (error) {
        console.error("Error al obtener ventas:", error);
      }
    }
    fetchVentas();
  }, []);

  // Filtrar y ordenar las inspecciones
  useEffect(() => {

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = ventas.filter(
      (venta) =>
        venta.cliente.toLowerCase().includes(lowercasedTerm) ||
        venta.asesor.toLowerCase().includes(lowercasedTerm) ||
        venta.titulo.toLowerCase().includes(lowercasedTerm)
    );

    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      setVentasFiltradas(
        filtered.filter((venta) => {
          const date = new Date(venta.fechaVenta);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        })
      );
    } else {
      setVentasFiltradas(filtered);
    }
  }, [searchTerm, filterMonth, ventas]);

  const sortedVentas = [...ventasFiltradas].sort((a, b) => {
    if (a.completada === b.completada) {
      return new Date(b.fechaVenta) - new Date(a.fechaVenta);
    }
    return a.completada ? 1 : -1;
  });
  const handleOpenModal = (id, currentObservacion) => {
    setCurrentVentaId(id);
    setObservacion(currentObservacion || "");
    setModalIsOpen(true);
  };
const handleUpdateLink = async () => {
  try {
    const docRef = doc(db, "ventas", currentVentaId);

    const completada = observacion === "venta" || observacion === "no le interesa";

    await updateDoc(docRef, {
      observacion: observacion,
      completada: completada,
    });

    setVentas((prev) =>
      prev.map((venta) =>
        venta.id === currentVentaId
          ? { ...venta, observacion: observacion, completada: completada }
          : venta
      )
    );

    setModalIsOpen(false);

    Swal.fire({
      title: "¡Actualización exitosa!",
      text: "La observación y el estado final han sido actualizados.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

  } catch (error) {
    console.error("Error al actualizar la inspección:", error);

    Swal.fire({
      title: "Error",
      text: "Hubo un problema al actualizar la inspección.",
      icon: "error",
    });
  }
};


  
  const incompletedVentas = sortedVentas.filter((venta) => !venta.completada);
  const completedVentas = sortedVentas.filter((venta) => venta.completada);
 

  // Handle delete venta
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta venta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
  
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "ventas", id));
        setVentas((prev) => prev.filter((venta) => venta.id !== id));
        
        Swal.fire({
          title: "Eliminado",
          text: "La venta ha sido eliminada correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al eliminar venta:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la venta. Inténtalo de nuevo.",
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "Cancelado",
        text: "La venta no fue eliminada.",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };
  
  


  // Generar reporte en PDF
  const generatePDFReport = () => {
    if (!reportYear || !reportMonth) {
      toast.error("Debe seleccionar año y mes para generar el reporte");
      return;
    }

    const reportVentas = ventas.filter(venta => {
      const ventaDate = new Date(venta.fechaVenta);
      return (
        ventaDate.getFullYear() === parseInt(reportYear) && 
        ventaDate.getMonth() === parseInt(reportMonth) - 1
      );
    });

    if (reportVentas.length === 0) {
      toast.info("No hay ventas para el mes y año seleccionados");
      return;
    }

    //simple pdf generation
    //const doc = new jsPDF();
    //doc.setFontSize(18);

    //pdf generation with custom size
    const doc = new jsPDF('l', 'mm', 'a4');

    //otra forma de hacerlo con custom size
    //--->
    // Custom page width and height (in millimeters) custom size
    // const doc = new jsPDF({
    //   orientation: 'landscape', // or 'portrait'
    //   unit: 'mm',              // measurement unit
    //   format: [297, 210]       // custom width and height
    // });

    doc.text(`Reporte de Ventas - ${reportMonth}/${reportYear}`, 14, 22);

    const tableColumn = [
      "Localidad", 
      "Cliente", 
      "Celular", 
      "Servicio/Producto", 
      "Cantidad",
      "Precio",
      "Precio Total",
      "Fecha",
      "Tipo Cliente",
      "Asesor",
      "Observacion"
    ];

    const tableRows = reportVentas.map(venta => [
      venta.localidad,
      venta.cliente,
      venta.celularCliente,
      venta.titulo,
      venta.cantidad,
      venta.precio,
      venta.precio*venta.cantidad,
      venta.fechaVenta,
      venta.tipoCliente,
      venta.asesor,
      venta.observacion
    ]);

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    doc.save(`Reporte_Ventas_${reportMonth}_${reportYear}.pdf`);
  };


  return (
    <div className="admin-inspecciones">
      <h2>Administrar Ventas</h2>
  
      <button
        className="futuristic-button"
        onClick={() => navigate("/admin-createVenta")}
      >
        Agregar Venta
      </button>
  
      {/* Buscadores */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por cliente, asesor o título"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        />
      </div>

      {/* Generación de Reportes */}
      <div className="report-generation">
        <h3>Generar Reportes</h3>
        <div className="report-controls">
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            required
          >
            <option value="">Seleccionar Mes</option>
            {[...Array(12)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(0, index).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={reportYear}
            onChange={(e) => setReportYear(e.target.value)}
            required
          >
            <option value="">Seleccionar Año</option>
            {[...Array(5)].map((_, index) => {
              const year = new Date().getFullYear() - 2 + index;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button 
            className="download-report-button"
            onClick={generatePDFReport}
            //para desactivsrlo si no hay mes y año seleccionado
            // disabled={!reportMonth || !reportYear}
          >
            Descargar Reporte
          </button>
        </div>
      </div>
  
      {/* Lista de ventas */}
      <section>
      <h3>Ventas Registradas</h3>
      <ul className="ventas-list">
        {incompletedVentas.map((venta) => (
          <li
            key={venta.id}
            className={`inspection-item ${venta.inProgress ? "in-progress" : venta.completada ? "completed" : ""}`}
          >
            <div className="inspection-content">
              <div className="inspection-details">
                <h3>{venta.titulo}</h3>
                <p><strong>Localidad:</strong> {venta.localidad}</p>
                <p><strong>Cliente:</strong> {venta.cliente}</p>
                <p><strong>Celular:</strong> {venta.celularCliente}</p>
                <p><strong>Cantidad:</strong> {venta.cantidad}</p>
                <p><strong>Precio:</strong> {venta.precio}</p>
                <p><strong>Precio Total:</strong> {venta.precio * venta.cantidad}</p>
                <p><strong>Fecha de Venta:</strong> {venta.fechaVenta}</p>
                <p><strong>Asesor:</strong> {venta.asesor}</p>
                <p><strong>Observacion:</strong> {venta.observacion || "N/A"}</p>
                <p><strong>Tipo de Cliente:</strong> {venta.tipoCliente}</p>
                <p><strong>Captacion por:</strong> {venta.captacion}</p>
              </div>
  
              {/* Botones */}
              <div className="inspection-actions">
                <button
                  className="edit-button"
                  onClick={() => navigate(`/admin-createVenta?edit=${venta.id}`)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(venta.id)}
                >
                  Eliminar
                </button>
                <button onClick={() => handleOpenModal(venta.id, venta.observacion)}>
                    Actualizar
                  </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </section>
      <section>
        <h3>Ventas Completadas</h3>
      <ul className="ventas-list">
        {completedVentas.map((venta) => (
          <li
            key={venta.id}
            className={`inspection-item ${venta.inProgress ? "in-progress" : venta.completada ? "completed" : ""}`}
          >
            <div className="inspection-content">
              <div className="inspection-details">
                <h3>{venta.titulo}</h3>
                <p><strong>Localidad:</strong> {venta.localidad}</p>
                <p><strong>Cliente:</strong> {venta.cliente}</p>
                <p><strong>Celular:</strong> {venta.celularCliente}</p>
                <p><strong>Cantidad:</strong> {venta.cantidad}</p>
                <p><strong>Precio:</strong> {venta.precio}</p>
                <p><strong>Precio Total:</strong> {venta.precio * venta.cantidad}</p>
                <p><strong>Fecha de Venta:</strong> {venta.fechaVenta}</p>
                <p><strong>Asesor:</strong> {venta.asesor}</p>
                <p><strong>Observacion:</strong> {venta.observacion || "N/A"}</p>
                <p><strong>Tipo de Cliente:</strong> {venta.tipoCliente}</p>
                <p><strong>Captacion por:</strong> {venta.captacion}</p>
              </div>
  
              {/* Botones */}
              <div className="inspection-actions">
                <button
                  className="edit-button"
                  onClick={() => navigate(`/admin-createVenta?edit=${venta.id}`)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(venta.id)}
                >
                  Eliminar
                </button>
                <button onClick={() => handleOpenModal(venta.id, venta.observacion)}>
                    Actualizar
                  </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </section>
      <Modal
              isOpen={modalIsOpen}
              onRequestClose={() => setModalIsOpen(false)}
              className="modal"
              overlayClassName="overlay"
            >
              <div>
                <h3>Actualizar Venta</h3>
      
                <select
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                >
                  <option value="seguimiento">Seguimiento</option>
                  <option value="venta">Venta</option>
                  <option value="no le interesa">No le interesa</option>
                </select>
      
                <div>
                  <button onClick={handleUpdateLink}>Guardar</button>
                  <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
                </div>
              </div>
            </Modal>
      <ToastContainer />
    </div>
  );
  
};

export default AdminVentas;
