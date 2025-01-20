// AdminTareas.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig/Firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import TaskList from '../TaskList';
import TaskForm from './TaskForm';
import '../../styles/AdminTareas.css';
import AdminNavbar from './AdminNavbar';

const AdminTareas = () => {
  const [tasks, setTasks] = useState([]); // Todas las tareas (pendientes y completadas)
  const [taskToEdit, setTaskToEdit] = useState(null); // Tarea seleccionada para editar
  const [showModal, setShowModal] = useState(false); // Estado para mostrar/ocultar ventana flotante
  const [searchTerm, setSearchTerm] = useState(''); // Filtro por nombre/apellido/encargado
  const [monthFilter, setMonthFilter] = useState(''); // Filtro por mes y año

  // Obtener las tareas desde Firestore al cargar la página
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        setTasks(
          tasksSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            clientName: doc.data().clientName || '', // Valores por defecto
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

  // Función para agregar una nueva tarea
  const handleAddTask = async (task) => {
    const newTask = {
      ...task,
      completed: false,
      startDate: null,
      endDate: null,
    };
    try {
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks((prev) => [...prev, { ...newTask, id: docRef.id }]);
    } catch (error) {
      console.error('Error al agregar tarea:', error);
    }
  };

  // Función para editar una tarea existente
  const handleEditTask = async (id, updatedTask) => {
    const taskRef = doc(db, 'tasks', id);
    try {
      await updateDoc(taskRef, updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updatedTask } : task))
      );
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error al editar tarea:', error);
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      const taskRef = doc(db, 'tasks', id);
      try {
        await deleteDoc(taskRef);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  // Función para marcar una tarea como "iniciada"
  const handleStartTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    const startDate = new Date().toISOString();
    try {
      await updateDoc(taskRef, { startDate });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, startDate } : task))
      );
    } catch (error) {
      console.error('Error al iniciar tarea:', error);
    }
  };

  // Función para marcar una tarea como "completada"
  const handleCompleteTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    const endDate = new Date().toISOString();
    try {
      await updateDoc(taskRef, { endDate, completed: true });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, endDate, completed: true } : task
        )
      );
    } catch (error) {
      console.error('Error al completar tarea:', error);
    }
  };

  // Función para marcar una tarea como "cancelada"
  const handleCancelTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    try {
      await updateDoc(taskRef, { startDate: null, endDate: null, completed: false });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, startDate: null, endDate: null, completed: false }
            : task
        )
      );
    } catch (error) {
      console.error('Error al cancelar tarea:', error);
    }
  };

  // Filtrar tareas por nombre/apellido del cliente o encargado
  const filteredTasksByName = tasks.filter((task) => {
    const clientName = task.clientName ? task.clientName.toLowerCase() : '';
    const clientLastName = task.clientLastName ? task.clientLastName.toLowerCase() : '';
    const encargado = task.encargado ? task.encargado.toLowerCase() : '';
    const search = searchTerm.toLowerCase();

    return (
      clientName.includes(search) ||
      clientLastName.includes(search) ||
      encargado.includes(search)
    );
  });

  // Filtrar tareas por mes y año
  const filteredTasksByDate = filteredTasksByName.filter((task) => {
    if (!monthFilter) return true;
    const taskDate = new Date(task.dueDate);
    const [year, month] = monthFilter.split('-');
    return (
      taskDate.getFullYear() === parseInt(year, 10) &&
      taskDate.getMonth() + 1 === parseInt(month, 10)
    );
  });

  return (
    <div className="edit-page">

      <h2>Editar Tareas</h2>
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
      <button className="open-modal-button" onClick={() => setShowModal(true)}>
        Agregar Tarea
      </button>
      <TaskList
        tasks={filteredTasksByDate}
        onEdit={(task) => {
          setTaskToEdit(task);
          setShowModal(true);
        }}
        onDelete={handleDeleteTask}
        onStart={handleStartTask}
        onComplete={handleCompleteTask}
        onCancel={handleCancelTask}
      />
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              existingTask={taskToEdit}
              onSubmit={(task) => {
                if (taskToEdit) {
                  handleEditTask(taskToEdit.id, task);
                } else {
                  handleAddTask(task);
                }
                setShowModal(false);
              }}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTareas;