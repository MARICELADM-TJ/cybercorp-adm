import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig/Firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import TaskList from '../TaskList';
import '../../styles/AdminTareas.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";

const AdminTareas = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        setTasks(
          tasksSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            clientName: doc.data().clientName || '',
            clientLastName: doc.data().clientLastName || '',
            encargado: doc.data().encargado || '',
          }))
        );
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      }
    };
    fetchTasks();
  }, []);

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
