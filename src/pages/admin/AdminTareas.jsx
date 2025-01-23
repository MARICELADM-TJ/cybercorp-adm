import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig/Firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import TaskList from '../TaskList';
import '../../styles/AdminTareas.css';
import { useNavigate } from 'react-router-dom';

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
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      const taskRef = doc(db, 'tasks', id);
      try {
        await deleteDoc(taskRef);
        setTasks((prev) => prev.filter((task) => task.id !== id));
        alert('Tarea eliminada con éxito.');
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
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
    </div>
  );
};

export default AdminTareas;
