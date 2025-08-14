import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Importar locale español para moment
import "react-big-calendar/lib/css/react-big-calendar.css";
import { db } from "../../firebaseConfig/Firebase";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import "../../styles/AdminDashboard.css"; // Mantiene los estilos

// Configurar moment en español
moment.locale('es');

const localizer = momentLocalizer(moment);

// Mensajes personalizados en español para React Big Calendar
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango.',
  showMore: total => `+ Ver más (${total})`
};

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
            start: fechaInicio || fechaProgramada,
            end: fechaFin || fechaProgramada,
          };
        });

        setEvents(inspections);
      } catch (error) {
        console.error("Error al obtener inspecciones/instalaciones:", error);
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
      return { 
        className: "event-completed",
        style: { background: "rgba(72, 187, 120, 0.9)", borderColor: "rgba(72, 187, 120, 0.2)" }
      };
    } else if (fechaProgramada < hoy) {
      return { 
        className: "event-overdue",
        style: { background: "rgba(245, 101, 101, 0.9)", borderColor: "rgba(245, 101, 101, 0.2)" }
      };
    } else {
      return { 
        className: "event-upcoming",
        style: { background: "rgba(236, 201, 75, 0.9)", borderColor: "rgba(236, 201, 75, 0.2)" }
      };
    }
  };

  // Personalización de SweetAlert
  const customSwal = Swal.mixin({
    background: "#1a1a2e",
    color: "#f0f0f0",
    confirmButtonColor: "#00ffff",
  });

  const handleEventClick = (event) => {
    customSwal.fire({
      title: event.title,
      html: `
        <div style="text-align: left; color: #f0f0f0;">
          <p><b style="color: #00ffff;">Encargado:</b> ${event.encargado}</p>
          <p><b style="color: #00ffff;">Cliente:</b> ${event.cliente}</p>
          <p><b style="color: #00ffff;">Fecha Asignación:</b> ${moment(event.fechaAsignacion).format("DD/MM/YYYY HH:mm")}</p>
          <p><b style="color: #00ffff;">Fecha Programada:</b> ${moment(event.fechaprog).format("DD/MM/YYYY HH:mm")}</p>
          ${event.completada ? `<p><b style="color: #00ffff;">Fecha Iniciada:</b> ${moment(event.start).format("DD/MM/YYYY HH:mm")}</p>` : ""}
          ${event.completada ? `<p><b style="color: #00ffff;">Fecha Finalizada:</b> ${moment(event.end).format("DD/MM/YYYY HH:mm")}</p>` : ""}
          <p><b style="color: #00ffff;">Estado:</b> ${
            event.completada 
              ? '<span style="color: #48bb78">Completada ✅</span>' 
              : event.inProgress 
                ? '<span style="color: #ecc94b">En progreso ⏳</span>' 
                : '<span style="color: #f56565">Pendiente ❌</span>'
          }</p>
        </div>
      `,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Cerrar",
      backdrop: `rgba(26, 26, 46, 0.8)`,
    });
  };

  // Función para cambiar la altura de los días con varias inspecciones
  const dayPropGetter = (date) => {
    const eventCount = events.filter(event =>
      moment(event.start).isSame(date, "day")
    ).length;

    if (eventCount > 1) {
      return {
        className: "day-multiple-events",
        style: {
          minHeight: `${50 + eventCount * 15}px`, // Aumenta la altura según la cantidad de eventos
        }
      };
    }

    return {};
  };

  return (
    <div className="dashboard-container">
      <h2>Calendario de Inspecciones/Instalaciones</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100vh", margin: "20px", color: "white" }}
        eventPropGetter={getEventStyle}
        onSelectEvent={handleEventClick}
        dayPropGetter={dayPropGetter}
        messages={messages} // Aplicar mensajes en español
        culture="es" // Establecer cultura española
      />
    </div>
  );
};

export default AdminDashboard;