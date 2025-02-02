// Home.jsx
import appFirebase from "../firebaseConfig/Firebase";
import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig/Firebase";
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore";
import TaskList from "./TaskList";
import "../styles/Home.css";
import { ToastContainer, toast } from "react-toastify";

const auth = getAuth(appFirebase);

const HomePage = ({ role, name }) => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState({ month: "", year: "" });

  useEffect(() => {
    const tasksCollection = collection(db, "tasks");
    const unsubscribe = onSnapshot(
      tasksCollection,
      (snapshot) => {
        const tasksArray = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          clientName: doc.data().clientName || "", 
          clientLastName: doc.data().clientLastName || "",
          encargado: doc.data().encargado || "",
          dueDate: doc.data().dueDate || null,
        }));
        setTasks(tasksArray);
      },
      (error) => {
        toast.error("Error al obtener las tareas");
        console.error("Error al obtener las tareas:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCompleteTask = async (id) => {
    try {
      const now = new Date().toISOString();
      const taskRef = doc(db, "tasks", id);
      await updateDoc(taskRef, { completed: true, endDate: now });
      toast.success("Tarea completada");
    } catch (error) {
      console.error("Error al completar la tarea:", error);
      toast.error("Error al completar la tarea");
    }
  };

  const handleStartTask = async (id) => {
    const now = new Date().toISOString();
    const taskRef = doc(db, "tasks", id);
    try {
      await updateDoc(taskRef, { startDate: now });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, startDate: now } : task
        )
      );
      toast.success("Tarea iniciada");
    } catch (error) {
      console.error("Error al iniciar tarea:", error);
      toast.error("Error al iniciar tarea");
    }
  };

  const handleCancelTask = async (id) => {
    const taskRef = doc(db, "tasks", id);
    try {
      await updateDoc(taskRef, { startDate: null });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, startDate: null } : task
        )
      );
      toast.warn("Tarea cancelada");
    } catch (error) {
      console.error("Error al cancelar la tarea:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesText =
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.clientLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.encargado.toLowerCase().includes(searchTerm.toLowerCase());

    const taskDate = task.dueDate ? new Date(task.dueDate) : null;
    const matchesDate =
      (!searchDate.month || (taskDate && taskDate.getMonth() + 1 === Number(searchDate.month))) &&
      (!searchDate.year || (taskDate && taskDate.getFullYear() === Number(searchDate.year)));

    return matchesText && matchesDate;
  });

  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  return (
    <div className="home-page">

      <div className="search-filters">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o encargado"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="date-filters">
          <input
            type="number"
            placeholder="Mes (1-12)"
            min="1"
            max="12"
            value={searchDate.month}
            onChange={(e) =>
              setSearchDate((prev) => ({ ...prev, month: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Año"
            min="2000"
            max="2100"
            value={searchDate.year}
            onChange={(e) =>
              setSearchDate((prev) => ({ ...prev, year: e.target.value }))
            }
          />
        </div>
      </div>

      <h2>Tareas Pendientes</h2>
      {pendingTasks.length > 0 ? (
        <TaskList
          tasks={pendingTasks}
          onComplete={handleCompleteTask}
          onStart={handleStartTask}
          onCancel={handleCancelTask}
        />
      ) : (
        <p className="no-tasks-message">No hay tareas pendientes.</p>
      )}

      <h2>Tareas Completadas</h2>
      {completedTasks.length > 0 ? (
        <TaskList tasks={completedTasks} />
      ) : (
        <p className="no-tasks-message">No hay tareas completadas.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default HomePage;