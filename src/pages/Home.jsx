
import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signOut } from "firebase/auth";

import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig/Firebase';
import { collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import TaskList from "./TaskList";
import '../styles/Home.css';
import Navbar from "./NavBar";

const auth = getAuth(appFirebase);

const HomePage = ({role, name}) => {
  const [tasks, setTasks] = useState([]);
  console.log(name);
  
  // Obtener tareas en tiempo real desde Firebase
  useEffect(() => {
    const tasksCollection = collection(db, 'tasks');
    const unsubscribe = onSnapshot(
      tasksCollection,
      (snapshot) => {
        const tasksArray = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTasks(tasksArray);
      },
      (error) => {
        console.error('Error al obtener las tareas:', error);
      }
    );

    // Limpia el listener al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Completar tarea: actualiza estado local y Firebase
  const handleCompleteTask = async (id) => {
    try {
      const now = new Date().toISOString(); // Fecha y hora actual
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { completed: true, endDate: now }); // Actualiza en Firebase
    } catch (error) {
      console.error('Error al completar la tarea:', error);
    }
  };

  // Filtrar tareas
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="home-page">
        <Navbar role={role}/>
      <h2>Tareas Pendientes</h2>
      {pendingTasks.length > 0 ? (
        <TaskList tasks={pendingTasks} onComplete={handleCompleteTask} />
      ) : (
        <p className="no-tasks-message">No hay tareas pendientes.</p>
      )}

      <h2>Tareas Completadas</h2>
      {completedTasks.length > 0 ? (
        <TaskList tasks={completedTasks} />
      ) : (
        <p className="no-tasks-message">No hay tareas completadas.</p>
      )}
    </div>
  );
};

export default HomePage;
