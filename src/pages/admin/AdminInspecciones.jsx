import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig/Firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "../../styles/AdminInspecciones.css";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const AdminInspecciones = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filteredInspections, setFilteredInspections] = useState([]);
  const navigate = useNavigate();

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
    const confirm = window.confirm("¿Estás seguro de eliminar esta inspección?");
    if (!confirm) {
      toast.info("Eliminación cancelada");
      return;
    }

    try {
      await deleteDoc(doc(db, "inspecciones", id));
      setInspections((prev) => prev.filter((inspection) => inspection.id !== id));
      toast.success("Inspección eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar inspección:", error);
      toast.error("Error al eliminar la inspección");
    }
  };

  return (
    <div className="admin-inspecciones">
      <AdminNavbar />
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

      {/* Lista de inspecciones */}
      <ul className="inspections-list">
        {sortedInspections.map((inspection) => (
          <li
            key={inspection.id}
            className={`inspection-item ${
              inspection.inProgress ? "in-progress" : inspection.completada ? "completed" : ""
            }`}
          >
            {/* Columna Izquierda */}
            <div className="inspection-details">
              <h3>{inspection.titulo}</h3>
              <p><strong>Descripción:</strong> {inspection.descripcion}</p>
              <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
              <p><strong>Celular:</strong> {inspection.celularCliente}</p>
              <p><strong>Encargado:</strong> {inspection.encargado}</p>
              <p><strong>Fecha Programada:</strong> {inspection.fechaProgramada}</p>
              <p><strong>Hora Programada:</strong> {inspection.horaProgramada}</p>
              <p><strong>Descripción de la Ubicación:</strong> {inspection.descripcionUbicacion}</p>
              <p><strong>Fecha y Hora de Inicio:</strong> {inspection.fechaInicio || "N/A"}</p>
              <p><strong>Fecha y Hora de Fin:</strong> {inspection.fechaFin || "N/A"}</p>
              
              {inspection.linkCotizacion == ''? null :  <p><strong>Link de Cotización:</strong> <a href={inspection.linkCotizacion} target="_blank" rel="noreferrer">Ver Cotización</a></p>}
            </div>

            {/* Columna Central: Mapa */}
            <div className="inspection-map">
              <MapContainer
                center={inspection.ubicacion || [-21.5355, -64.7295]} // Tarija, Bolivia por defecto
                zoom={13}
                style={{ height: "80%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {inspection.ubicacion && (
                  <Marker position={inspection.ubicacion}></Marker>
                )}
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

            {/* Columna Derecha: Botones */}
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminInspecciones;
