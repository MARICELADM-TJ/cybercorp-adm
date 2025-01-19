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

const UserInspecciones = ({role}) => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState("");
  const [newLink, setNewLink] = useState("");

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

  // Filtro de búsquedas
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

  const handleFinishInspection = async (id) => {
    try {
      const docRef = doc(db, "inspecciones", id);
      const endTime = new Date().toISOString();
      await updateDoc(docRef, { inProgress: false, completada: true, fechaFin: endTime });
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === id ? { ...insp, inProgress: false, completada: true, fechaFin: endTime } : insp
        )
      );
      toast.success("Inspección completada correctamente");
    } catch (error) {
      console.error("Error al finalizar inspección:", error);
      toast.error("Error al finalizar la inspección");
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

  const handleOpenModal = (id, currentLink) => {
    console.log("Opening modal for ID:", id);
    setCurrentInspectionId(id);
    setNewLink(currentLink || "");
    setModalIsOpen(true);
  };
  console.log("Modal abierto:", modalIsOpen);


  const handleUpdateLink = async () => {
    try {
      const docRef = doc(db, "inspecciones", currentInspectionId);
      await updateDoc(docRef, { linkCotizacion: newLink });
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === currentInspectionId ? { ...insp, linkCotizacion: newLink } : insp
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
        <Navbar role={role} />
      <h2>Inspecciones</h2>

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

      {/* Inspecciones no completadas */}
      <section>
        <h3>Inspecciones Pendientes</h3>
        <ul className="inspection-list">
          {incompletedInspections.map((inspection) => (
            <li key={inspection.id} className={`inspection-item ${inspection.inProgress ? "in-progress" : ""}`}>
              <div className="inspection-details">
                <h3>{inspection.titulo}</h3>
                <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
                <p><strong>Encargado:</strong> {inspection.encargado}</p>
                <p><strong>Fecha:</strong> {inspection.fechaProgramada}</p>
              </div>
              <div className="inspection-actions">
                {!inspection.inProgress ? (
                  <button onClick={() => handleStartInspection(inspection.id)}>Iniciar</button>
                ) : (
                  <>
                    <button onClick={() => handleFinishInspection(inspection.id)}>Terminar</button>
                    <button onClick={() => handleCancelInspection(inspection.id)}>Cancelar</button>
                  </>
                )}
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
              <div className="inspection-details">
                <h3>{inspection.titulo}</h3>
                <p><strong>Cliente:</strong> {`${inspection.nombreCliente} ${inspection.apellidoCliente}`}</p>
                <p><strong>Encargado:</strong> {inspection.encargado}</p>
                <p><strong>Fecha:</strong> {inspection.fechaProgramada}</p>
                <button onClick={() => handleOpenModal(inspection.id, inspection.linkCotizacion)}>
                  Actualizar Link
                </button>
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
            <h3>Actualizar Link de Cotización</h3>
            <input
            type="text"
            placeholder="Nuevo Link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            />
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
