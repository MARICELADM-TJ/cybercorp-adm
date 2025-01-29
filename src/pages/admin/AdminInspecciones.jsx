import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig/Firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "../../styles/AdminInspecciones.css";
import AdminNavbar from "./AdminNavbar";
import { toast, ToastContainer } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminInspecciones = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [reportYear, setReportYear] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [filteredInspections, setFilteredInspections] = useState([]);
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    if (!isoString) return "N/C";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Fetch inspections from Firestore
  useEffect(() => {

    const fetchInspections = async () => {
      try {
        const inspectionsSnapshot = await getDocs(collection(db, "inspecciones"));
        const inspectionsData = inspectionsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setInspections(inspectionsData);
      } catch (error) {
        console.error("Error al obtener inspecciones:", error);
      }
    };

    fetchInspections();
  }, []);

  // Filter and sort inspections
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = inspections.filter(
      (inspection) =>
        `${inspection.nombreCliente} ${inspection.apellidoCliente}`.toLowerCase().includes(lowercasedTerm) ||
        inspection.encargado.toLowerCase().includes(lowercasedTerm) ||
        inspection.titulo.toLowerCase().includes(lowercasedTerm)
    );

    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      setFilteredInspections(
        filtered.filter((inspection) => {
          const date = new Date(inspection.fechaProgramada);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        })
      );
    } else {
      setFilteredInspections(filtered);
    }
  }, [searchTerm, filterMonth, inspections]);

  // Sort inspections
  const sortedInspections = [...filteredInspections].sort((a, b) => {
    if (a.completada === b.completada) {
      return new Date(b.fechaProgramada) - new Date(a.fechaProgramada);
    }
    return a.completada ? 1 : -1; // Completadas al final
  });

  // Handle delete inspection
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro de eliminar esta inspección?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "inspecciones", id));
        setInspections((prev) => prev.filter((inspection) => inspection.id !== id));
        toast.success("Inspección eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar inspección:", error);
        toast.error("Error al eliminar la inspección");
      }
    } else {
      toast.info("Eliminación cancelada");
    }
  };
  


  // Generate PDF Report
  const generatePDFReport = () => {
    if (!reportYear || !reportMonth) {
      toast.error("Debe seleccionar año y mes para generar el reporte");
      return;
    }

    // Filter inspections for the selected month and year
    const reportInspections = inspections.filter(inspection => {
      const inspectionDate = new Date(inspection.fechaProgramada);
      return (
        inspectionDate.getFullYear() === parseInt(reportYear) && 
        inspectionDate.getMonth() === parseInt(reportMonth) - 1
      );
    });

    if (reportInspections.length === 0) {
      toast.info("No hay inspecciones para el mes y año seleccionados");
      return;
    }

    //simple pdf generation
    //const doc = new jsPDF();
    //doc.setFontSize(18);

    //pdf generation with custom size
    const doc = new jsPDF('l', 'mm', 'a4');

    // Custom page width and height (in millimeters) custom size
    // const doc = new jsPDF({
    //   orientation: 'landscape', // or 'portrait'
    //   unit: 'mm',              // measurement unit
    //   format: [297, 210]       // custom width and height
    // });

    doc.text(`Reporte de Inspecciones - ${reportMonth}/${reportYear}`, 14, 22);

    const tableColumn = [
      "Título", 
      "Cliente", 
      "Encargado", 
      "Fecha Programada", 
      "Hora", 
      "Estado Final",
      "Realizada?", 
      "Descripción"
    ];

    const tableRows = reportInspections.map(inspection => [
      inspection.titulo,
      `${inspection.nombreCliente} ${inspection.apellidoCliente}`,
      inspection.encargado,
      inspection.fechaProgramada,
      inspection.horaProgramada,
      inspection.EstadoFinal || "N/A",
      inspection.completada ? "Sí" : "No",
      inspection.descripcion
    ]);

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    doc.save(`Reporte_Inspecciones_${reportMonth}_${reportYear}.pdf`);
  };


  return (
    <div className="admin-inspecciones">
      <h2>Administrar Inspecciones</h2>
  
      <button
        className="futuristic-button"
        onClick={() => navigate("/admin-createInspeccion")}
      >
        Agregar Inspección
      </button>
  
      {/* Buscadores */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por cliente, encargado o título"
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
  
      {/* Lista de inspecciones */}
      <ul className="inspection-list">
        {sortedInspections.map((inspection) => (
          <li
            key={inspection.id}
            className={`inspection-item ${inspection.inProgress ? "in-progress" : inspection.completada ? "completed" : ""}`}
          >
            <div className="inspection-content">
              {/* Datos */}
              <div className="inspection-details">
                <h3>{inspection.titulo}</h3>
                <p><strong>Descripción:</strong> {inspection.descripcion}</p>
                <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
                <p><strong>Celular:</strong> {inspection.celularCliente}</p>
                <p><strong>Encargado:</strong> {inspection.encargado}</p>
                <p><strong>Fecha Programada:</strong> {inspection.fechaProgramada}</p>
                <p><strong>Hora Programada:</strong> {inspection.horaProgramada}</p>
                <p><strong>Descripción de la Ubicación:</strong> {inspection.descripcionUbicacion? inspection.descripcionUbicacion : "N/C"}</p>
                <p><strong>Fecha y Hora de Inicio:</strong> {formatDate(inspection.fechaInicio) || "N/A"}</p>
                <p><strong>Fecha y Hora de Fin:</strong> {formatDate(inspection.fechaFin) || "N/A"}</p>
                <p><strong>Estado Final:</strong> {inspection.EstadoFinal || "N/A"}</p>
                {inspection.linkCotizacion && ( 
                  <p>
                    <strong>Link de Cotización:</strong>{" "}
                    <a href={inspection.linkCotizacion} target="_blank" rel="noreferrer">Ver Cotización</a>
                  </p>
                )}
              </div>
  
              {/* Mapa */}
              <div className="inspection-map">
                <MapContainer
                  center={inspection.ubicacion || [-21.5355, -64.7295]}
                  zoom={13}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {inspection.ubicacion && <Marker position={inspection.ubicacion} />}
                </MapContainer>
                <button
                  className="map-button"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${inspection.ubicacion[0]},${inspection.ubicacion[1]}`,
                      "_blank"
                    )
                  }
                >
                  Ver en Google Maps
                </button>
              </div>
  
              {/* Botones */}
              <div className="inspection-actions">
                <button
                  className="edit-button"
                  onClick={() => navigate(`/admin-createInspeccion?edit=${inspection.id}`)}
                >
                  Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(inspection.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
  
};

export default AdminInspecciones;
