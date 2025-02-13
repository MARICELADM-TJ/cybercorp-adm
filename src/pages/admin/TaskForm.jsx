import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig/Firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/TaskForm.css';
import { toast, ToastContainer } from 'react-toastify';

const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const taskToEdit = location.state?.task;

  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    encargado: '',
    clientName: '',
    clientLastName: '',
    clientPhone: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      // Extraer fecha y hora del dueDate
      const dueDateTime = new Date(taskToEdit.dueDate);
      const date = dueDateTime.toISOString().split('T')[0];
      const time = dueDateTime.toTimeString().slice(0, 5); // Obtiene HH:MM

      setTask({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        dueDate: date,
        dueTime: time,
        encargado: taskToEdit.encargado || '',
        clientName: taskToEdit.clientName || taskToEdit.nombreCliente || '',
        clientLastName: taskToEdit.clientLastName || taskToEdit.apellidoCliente || '',
        clientPhone: taskToEdit.clientPhone || taskToEdit.celularCliente || '',
      });
    }
  }, [taskToEdit]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!task.title || !task.description || !task.dueDate || !task.dueTime || !task.encargado) {
      let message = 'Los campos ';
      if (!task.title) message += 'Título, ';
      if (!task.description) message += 'Descripción, ';
      if (!task.dueDate) message += 'Fecha, ';
      if (!task.dueTime) message += 'Hora, ';
      if (!task.encargado) message += 'Encargado, ';

      message = message.slice(0, -2) + ' son obligatorios.';
      toast.warn(message);
      return;
    }

    // Crear una fecha correcta combinando fecha y hora
    const dueDate = new Date(`${task.dueDate}T${task.dueTime}`).toISOString();

    const taskData = {
      title: task.title,
      description: task.description,
      dueDate: dueDate,
      dueTime: task.dueTime,
      encargado: task.encargado,
      // Guardar la información del cliente con nombres de campo consistentes
      clientName: task.clientName || '',
      clientLastName: task.clientLastName || '',
      clientPhone: task.clientPhone || '',
      // También guardar con los nombres alternativos para compatibilidad
      nombreCliente: task.clientName || '',
      apellidoCliente: task.clientLastName || '',
      celularCliente: task.clientPhone || '',
    };

    try {
      if (taskToEdit) {
        const taskRef = doc(db, 'tasks', taskToEdit.id);
        await updateDoc(taskRef, taskData);
        Swal.fire({
          icon: "success",
          title: "Tarea actualizada correctamente",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: false,
          timer: 1000,
          willClose: () => {
            navigate('/admin-tareas');
          },
        });
      } else {
        await addDoc(collection(db, 'tasks'), { 
          ...taskData,
          completed: false 
        });
        Swal.fire({
          icon: "success",
          title: "Tarea creada correctamente",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: false,
          timer: 1000,
          willClose: () => {
            navigate('/admin-tareas');
          },
        });
      }
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar la tarea",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOut",
        },
        showConfirmButton: false,
        timer: 1000,
      });
    }
  };

  return (
    <div className="task-form-view">
      <h2>{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
      <form className="task-form" onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Título"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
        />
        <textarea
          placeholder="Descripción"
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
        <input
          type="date"
          value={task.dueDate}
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
        />
        <input
          type="time"
          value={task.dueTime}
          onChange={(e) => setTask({ ...task, dueTime: e.target.value })}
        />
        <input
          type="text"
          placeholder="Encargado"
          value={task.encargado}
          onChange={(e) => setTask({ ...task, encargado: e.target.value })}
        />
        <input
          type="text"
          placeholder="Nombre del Cliente (opcional)"
          value={task.clientName}
          onChange={(e) => setTask({ ...task, clientName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Apellido del Cliente (opcional)"
          value={task.clientLastName}
          onChange={(e) => setTask({ ...task, clientLastName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Celular del Cliente (opcional)"
          value={task.clientPhone}
          onChange={(e) => setTask({ ...task, clientPhone: e.target.value })}
        />
        <div className="buttons">
          <button type="submit">Guardar</button>
          <button type="button" onClick={() => navigate('/admin-tareas')}>
            Cancelar
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default TaskForm;