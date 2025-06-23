import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig/Firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import TaskList from '../TaskList';
import '../../styles/AdminTareas.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminTareas = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [reportYear, setReportYear] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        setTasks(
          tasksSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            // Unificar los campos del cliente usando los nuevos nombres
            clientName: doc.data().nombreCliente || doc.data().clientName || '',
            clientLastName: doc.data().apellidoCliente || doc.data().clientLastName || '',
            clientPhone: doc.data().celularCliente || doc.data().clientPhone || '',
            encargado: doc.data().encargado || '',
          }))
        );
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      }
    };
    fetchTasks();
  }, []);

  // Resto del código permanece igual...

  const handleDeleteTask = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta tarea?",
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
        await deleteDoc(doc(db, "tasks", id));
        setTasks((prev) => prev.filter((task) => task.id !== id));
        Swal.fire({
          title: "Eliminado",
          text: "La tarea ha sido eliminada correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al eliminar tarea:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la tarea. Inténtalo de nuevo.",
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "Cancelado",
        text: "La tarea no fue eliminada.",
        icon: "info",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };


  const filteredTasks = tasks
    .filter((task) => {
      const search = searchTerm.toLowerCase();
      const clientName = task.clientName ? task.clientName.toLowerCase() : '';
      const clientLastName = task.clientLastName ? task.clientLastName.toLowerCase() : '';
      const encargado = task.encargado ? task.encargado.toLowerCase() : '';
      return (
        clientName.includes(search) ||
        clientLastName.includes(search) ||
        encargado.includes(search)
      );
    })
    .filter((task) => {
      if (!monthFilter) return true;
      const taskDate = new Date(task.dueDate);
      const [year, month] = monthFilter.split('-');
      return (
        taskDate.getFullYear() === parseInt(year, 10) &&
        taskDate.getMonth() + 1 === parseInt(month, 10)
      );
    });

  const pendingTasks = filteredTasks
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const completedTasks = filteredTasks.filter((task) => task.completed);
  // Generar reporte en PDF
  const generatePDFReport = () => {
    if (!reportYear || !reportMonth) {
      toast.error("Debe seleccionar año y mes para generar el reporte");
      return;
    }

    const reportTasks = tasks.filter(tasks => {
      const taskDate = new Date(tasks.dueDate);
      return (
        taskDate.getFullYear() === parseInt(reportYear) &&
        taskDate.getMonth() === parseInt(reportMonth) - 1
      );
    });

    if (reportTasks.length === 0) {
      toast.info("No hay tareas para el mes y año seleccionados");
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

    doc.text(`Reporte de Tareas - ${reportMonth}/${reportYear}`, 14, 22);

    const tableColumn = [
      "Título",
      "Descripción",
      "Fecha Programada",
      "Hora Programada",
      "Encargado",
      "Cliente",
      "Celular del Cliente",
      "Fecha Completada",
      "Completada",
    ];

    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const tableRows = reportTasks.map(task => [
      task.title,
      task.description,
      formatDate(task.dueDate),
      task.dueTime,
      task.encargado,
      `${task.clientName} ${task.clientLastName}`,
      task.clientPhone,
      formatDate(task.endDate),
      task.completed ? 'Si' : 'No',
    ]);


    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    doc.save(`Reporte_Tareas_${reportMonth}_${reportYear}.pdf`);
  };
  return (
    <div className="edit-page">
      <h2>Administrar Tareas</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o encargado"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        />
      </div>
      <button
        className="open-modal-button"
        onClick={() => navigate('/admin-taskForm')}
      >
        Agregar Tarea
      </button>
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
      <h3>Tareas Pendientes</h3>
      <TaskList
        tasks={pendingTasks}
        onEdit={(task) => navigate('/admin-taskForm', { state: { task } })}
        onDelete={handleDeleteTask}
      />
      <h3>Tareas Completadas</h3>
      <TaskList
        tasks={completedTasks}
        onEdit={(task) => navigate('/admin-taskForm', { state: { task } })}
        onDelete={handleDeleteTask}
      />
      <ToastContainer />
    </div>
  );
};

export default AdminTareas;
