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

  // Obtener las tareas desde Firestore al cargar la página
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        setTasks(tasksSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      }
    };
    fetchTasks();
  }, []);

  // Función para agregar una nueva tarea
  const handleAddTask = async (task) => {
    const newTask = { ...task, completed: false, startDate: null, endDate: null }; // La tarea inicia sin fechas de inicio ni fin
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

  // Función para iniciar una tarea
  const handleStartTask = async (id) => {
    const now = new Date().toISOString();
    const taskRef = doc(db, 'tasks', id);
    try {
      await updateDoc(taskRef, { startDate: now });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, startDate: now }
            : task
        )
      );
    } catch (error) {
      console.error('Error al iniciar tarea:', error);
    }
  };

  // Función para marcar una tarea como completada
  const handleCompleteTask = async (id) => {
    const now = new Date().toISOString();
    const taskRef = doc(db, 'tasks', id);
    try {
      await updateDoc(taskRef, { completed: true, endDate: now });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, completed: true, endDate: now }
            : task
        )
      );
    } catch (error) {
      console.error('Error al completar tarea:', error);
    }
  };

  return (
    <div className="edit-page">
        <AdminNavbar />
      <h2>Editar Tareas</h2>
      <button className="open-modal-button" onClick={() => setShowModal(true)}>
        Agregar Tarea
      </button>
      <TaskList
        tasks={tasks}
        onEdit={(task) => {
          setTaskToEdit(task);
          setShowModal(true);
        }}
        onDelete={handleDeleteTask}
        onStart={handleStartTask} // Nuevo botón para iniciar tarea
        onComplete={handleCompleteTask} // Botón para completar tarea
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
