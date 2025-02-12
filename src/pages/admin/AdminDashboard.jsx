import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Estilos del calendario
import { db } from "../../firebaseConfig/Firebase";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import "../../styles/AdminDashboard.css"; // Asegúrate de que los estilos sigan cargando

const localizer = momentLocalizer(moment);

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const snapshot = await getDocs(collection(db, "inspecciones"));
        const inspections = snapshot.docs.map((doc) => {
          const data = doc.data();

          const fechaProgramada = data.fechaProgramada
            ? new Date(data.fechaProgramada + "T" + (data.horaProgramada || "00:00"))
            : null;

          const fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : null;
          const fechaFin = data.fechaFin ? new Date(data.fechaFin) : null;

          return {
            id: doc.id,
            title: data.titulo,
            encargado: data.encargado,
            cliente: `${data.nombreCliente} ${data.apellidoCliente}`,
            completada: data.completada,
            inProgress: data.inProgress,
            fechaprog: fechaProgramada,
            fechaAsignacion: data.fechaAsignacion,
            start: fechaInicio || fechaProgramada, // Si hay fecha de inicio, mostrarla, sino la programada
            end: fechaFin || fechaProgramada, // Si hay fecha de fin, mostrarla, sino la programada
          };
        });

        setEvents(inspections);
      } catch (error) {
        console.error("Error al obtener inspecciones:", error);
      }
    };

    fetchInspections();
  }, []);

  const getEventStyle = (event) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaProgramada = new Date(event.start);
    fechaProgramada.setHours(0, 0, 0, 0);

    if (event.completada) {
      return { style: { backgroundColor: "green", color: "white" } }; // Completada ✅
    } else if (fechaProgramada < hoy) {
      return { style: { backgroundColor: "red", color: "white" } }; // Pasada ❌
    } else {
      return { style: { backgroundColor: "yellow", color: "black" } }; // Futura 🟡
    }
  };

  const handleEventClick = (event) => {
    Swal.fire({
      title: event.title,
      html: `
        <p><b>Encargado:</b> ${event.encargado}</p>
        <p><b>Cliente:</b> ${event.cliente}</p>
        <p><b>Fecha Asignación:</b> ${moment(event.fechaAsignacion).format("YYYY-MM-DD HH:mm")}</p>
        <p><b>fecha Programada: :</b> ${moment(event.fechaprog).format("YYYY-MM-DD HH:mm")}</p>
        ${event.completada ? `<p><b>Fecha Iniciada:</b> ${moment(event.start).format("YYYY-MM-DD HH:mm")}</p>` : ""}
        ${event.completada ? `<p><b>Fecha Finalizada:</b> ${moment(event.end).format("YYYY-MM-DD HH:mm")}</p>` : ""}
        <p><b>Completada:</b> ${event.completada ? "Sí ✅" : event.inProgress ? "En progreso ⏳" : "No ❌"}</p>
      `,
      icon: "info",
    });
  };

  return (
    <div className="dashboard-container">
      <h2>Calendario de Inspecciones</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh", margin: "20px", color: 'white' }}
        eventPropGetter={getEventStyle}
        onSelectEvent={handleEventClick}
      />
    </div>
  );
};

export default AdminDashboard;
