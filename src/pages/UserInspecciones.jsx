import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "../styles/UserInspecciones.css";
import { toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Modal from "react-modal";

import Navbar from "./NavBar";

Modal.setAppElement("#root");

const UserInspecciones = () => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState("");
  const [newLink, setNewLink] = useState("");
  const [estadoFinal, setEstadoFinal] = useState("");

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

  const handleStartInspection = async (id) => {
    try {
      const docRef = doc(db, "inspecciones", id);
      const startTime = new Date().toISOString();
      await updateDoc(docRef, { inProgress: true, fechaInicio: startTime });
      setInspections((prev) =>
        prev.map((insp) => (insp.id === id ? { ...insp, inProgress: true, fechaInicio: startTime } : insp))
      );
      toast.success("Inspección iniciada correctamente");
    } catch (error) {
      console.error("Error al iniciar inspección:", error);
      toast.error("Error al iniciar la inspección");
    }
  };

  const handleUpdateInspection = async () => {
    try {
      const docRef = doc(db, "inspecciones", currentInspectionId);
      await updateDoc(docRef, {
        linkCotizacion: newLink,
        EstadoFinal: estadoFinal,
      });
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === currentInspectionId
            ? { ...insp, linkCotizacion: newLink, EstadoFinal: estadoFinal }
            : insp
        )
      );
      setModalIsOpen(false);
      toast.success("Inspección actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar inspección:", error);
      toast.error("Error al actualizar la inspección");
    }
  };
  

  const handleCancelInspection = async (id) => {
    try {
      const docRef = doc(db, "inspecciones", id);
      await updateDoc(docRef, { inProgress: false, fechaInicio: null });
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === id ? { ...insp, inProgress: false, fechaInicio: null } : insp
        )
      );
      toast.success("Inspección cancelada correctamente");
    } catch (error) {
      console.error("Error al cancelar inspección:", error);
      toast.error("Error al cancelar la inspección");
    }
  };

  const handleOpenModal = (id, currentLink, currentEstadoFinal) => {
    setCurrentInspectionId(id);
    setNewLink(currentLink || "");
    setEstadoFinal(currentEstadoFinal || "");
    setModalIsOpen(true);
  };

  const handleUpdateLink = async () => {
    try {
      const docRef = doc(db, "inspecciones", currentInspectionId);
      await updateDoc(docRef, { linkCotizacion: newLink });
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === currentInspectionId ? { ...insp, linkCotizacion: newLink, EstadoFinal: estadoFinal } : insp
        )
      );
      setModalIsOpen(false);
      toast.success("Link de cotización actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el link:", error);
      toast.error("Error al actualizar el link");
    }
  };

  const incompletedInspections = filteredInspections.filter((insp) => !insp.completada);
  const completedInspections = filteredInspections.filter((insp) => insp.completada);

  return (
    <div className="user-inspecciones">
      <h2>Inspecciones</h2>
  
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
  
      {/* Inspecciones no completadas */}
      <section>
        <h3>Inspecciones Pendientes</h3>
        <ul className="inspection-list">
          {incompletedInspections.map((inspection) => (
            <li key={inspection.id} className={`inspection-item ${inspection.inProgress ? "in-progress" : ""}`}>
              <div className="inspection-content">
                {/* Datos */}
                <div className="inspection-details">
                  <h3>{inspection.titulo}</h3>
                  <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
                  <p><strong>Celular:</strong> {inspection.celularCliente}</p>
                  <p><strong>Encargado:</strong> {inspection.encargado}</p>
                  <p><strong>Fecha Programada:</strong> {inspection.fechaProgramada}</p>
                  <p><strong>Hora Programada:</strong> {inspection.horaProgramada}</p>
                  <p><strong>Descripción de la Ubicación:</strong> {inspection.descripcionUbicacion}</p>
                  <p><strong>Estado Final:</strong> {inspection.EstadoFinal || 'N/A'}</p>
                  <p><strong>Link de Cotización:</strong> {inspection.linkCotizacion || "N/A"}</p>
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
                  
                </div>
  
                {/* Botones */}
                <div className="inspection-actions">
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
                  {!inspection.inProgress ? (
                    <button onClick={() => handleStartInspection(inspection.id)}>Iniciar</button>
                  ) : (
                    <>
                      <button onClick={() => handleFinishInspection(inspection.id)}>Terminar</button>
                      <button onClick={() => handleCancelInspection(inspection.id)}>Cancelar</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
  
      {/* Inspecciones completadas */}
      <section>
        <h3>Inspecciones Completadas</h3>
        <ul className="inspection-list">
          {completedInspections.map((inspection) => (
            <li key={inspection.id} className="inspection-item completed">
              <div className="inspection-content">
                {/* Datos */}
                <div className="inspection-details">
                  <h3>{inspection.titulo}</h3>
                  <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
                  <p><strong>Celular:</strong> {inspection.celularCliente}</p>
                  <p><strong>Encargado:</strong> {inspection.encargado}</p>
                  <p><strong>Fecha Programada:</strong> {inspection.fechaProgramada}</p>
                  <p><strong>Hora Programada:</strong> {inspection.horaProgramada}</p>
                  <p><strong>Descripción de la Ubicación:</strong> {inspection.descripcionUbicacion}</p>
                  <p><strong>Fecha Inicio:</strong> {inspection.fechaInicio || "N/A"}</p>
                  <p><strong>Fecha Fin:</strong> {inspection.fechaFin || "N/A"}</p>
                  <p><strong>Estado Final:</strong> {inspection.EstadoFinal || "N/A"}</p>
                  <p>
                    <strong>Link de Cotización:</strong>{" "}
                    {inspection.linkCotizacion ? (
                      <a href={inspection.linkCotizacion} target="_blank" rel="noreferrer">
                        Ver Cotización
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
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
                </div>
  
                {/* Botones */}
                <div className="inspection-actions">
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
                  <button onClick={() => handleOpenModal(inspection.id, inspection.linkCotizacion, inspection.EstadoFinal)}>
                    Actualizar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
  
      {/* Modal para actualizar link */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <div>
          <h3>Actualizar Cotización</h3>
          <input
            type="text"
            placeholder="Nuevo Link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />


          <select
            value={estadoFinal}
            onChange={(e) => setEstadoFinal(e.target.value)}
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
    </div>
  );
  
};

export default UserInspecciones;
