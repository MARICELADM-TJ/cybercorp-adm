import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "../styles/UserInspecciones.css";
import { toast, ToastContainer } from "react-toastify";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Modal from "react-modal";


Modal.setAppElement("#root");

const UserInspecciones = ({role}) => {
  const [inspections, setInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentInspectionId, setCurrentInspectionId] = useState("");
  const [newLink, setNewLink] = useState("");
  const [estadoFinal, setEstadoFinal] = useState("");

  const formatDate = (isoString) => {
    if (!isoString) return "N/C";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

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
  
      Swal.fire({
        title: "¡Inspección iniciada!",
        text: "La inspección ha comenzado correctamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al iniciar inspección:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al iniciar la inspección.",
        icon: "error",
      });
    }
  };
  

  const handleFinishInspection = async (id) => {
    try {
      const docRef = doc(db, "inspecciones", id);
      const endTime = new Date().toISOString();
      await updateDoc(docRef, {
        completada: true,
        fechaFin: endTime,
        inProgress: false,
      });
  
      setInspections((prev) =>
        prev.map((insp) =>
          insp.id === id
            ? { ...insp, completada: true, fechaFin: endTime, inProgress: false }
            : insp
        )
      );
  
      Swal.fire({
        title: "¡Inspección finalizada!",
        text: "La inspección se ha completado con éxito.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al finalizar inspección:", error);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al finalizar la inspección.",
        icon: "error",
      });
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
    const result = await Swal.fire({
      title: "¿Cancelar Inspección?",
      text: "¿Seguro que quieres cancelar esta inspección?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
  
    if (result.isConfirmed) {
      try {
        const docRef = doc(db, "inspecciones", id);
        await updateDoc(docRef, { inProgress: false, fechaInicio: null });
  
        setInspections((prev) =>
          prev.map((insp) =>
            insp.id === id ? { ...insp, inProgress: false, fechaInicio: null } : insp
          )
        );
  
        Swal.fire({
          title: "Inspección cancelada",
          text: "La inspección ha sido cancelada con éxito.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al cancelar inspección:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cancelar la inspección.",
          icon: "error",
        });
      }
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
  
      Swal.fire({
        title: "¡Actualización exitosa!",
        text: "El link de cotización y el estado final han sido actualizados.",
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
  {true && ( //posible validacion para solo mostrar botones a usuarios con ciertos permisos, por el momento cualquier usuario
    <>
      {!inspection.inProgress ? (
        <button onClick={() => handleStartInspection(inspection.id)}>Iniciar</button>
      ) : (
        <>
          <button onClick={() => handleFinishInspection(inspection.id)}>Terminar</button>
          <button onClick={() => handleCancelInspection(inspection.id)}>Cancelar</button>
        </>
      )}
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
                  <p><strong>Fecha Inicio:</strong> {formatDate(inspection.fechaInicio) || "N/A"}</p>
                  <p><strong>Fecha Fin:</strong> {formatDate(inspection.fechaFin) || "N/A"}</p>
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
      <ToastContainer />
    </div>
  );
  
};

export default UserInspecciones;
