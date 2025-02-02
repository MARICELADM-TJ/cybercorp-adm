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
    nombreCliente: '',
    apellidoCliente: '',
    celularCliente: '',
  });

  useEffect(() => {
    if (taskToEdit) {
      const [date, timeWithSeconds] = (taskToEdit.dueDate || '').split('T');

      setTask({
        title: taskToEdit.title,
        description: taskToEdit.description,
        dueDate: date || '',
        dueTime: taskToEdit.dueTime || '',
        encargado: taskToEdit.encargado,
        nombreCliente: taskToEdit.clientName || '',
        apellidoCliente: taskToEdit.clientLastName || '',
        celularCliente: taskToEdit.clientPhone || '',
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

      message += 'son obligatorios.';

      toast.warn(message);
      return;
    }

    const dueDate = `${task.dueDate}T${task.dueTime}:00`;

    try {
      if (taskToEdit) {
        const taskRef = doc(db, 'tasks', taskToEdit.id);
        await updateDoc(taskRef, { ...task, dueDate });
        //toast.success('Tarea actualizada con éxito.');
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
        await addDoc(collection(db, 'tasks'), { ...task, dueDate, completed: false });
        //toast.success('Tarea agregada con éxito.');
        Swal.fire({
          icon: "success",
          title: "tarea creada correctamente",
          showClass: {
            popup: "animate__animated animate__zoomIn", 
          },
          hideClass: {
            popup: "animate__animated animate__fadeOut",
          },
          showConfirmButton: false,
          timer: 1000,
          willClose: () => {
            navigate("/admin-tareas");
          },
        });
      }
      navigate('/admin-tareas');
    } catch (error) {
      console.error('Error al guardar tarea:', error);
      //toast.error('Error al guardar la tarea.');
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
        willClose: () => {
          navigate('/admin-tareas');
        },
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
          value={task.nombreCliente}
          onChange={(e) => setTask({ ...task, nombreCliente: e.target.value })}
        />
        <input
          type="text"
          placeholder="Apellido del Cliente (opcional)"
          value={task.apellidoCliente}
          onChange={(e) => setTask({ ...task, apellidoCliente: e.target.value })}
        />
        <input
          type="text"
          placeholder="Celular del Cliente (opcional)"
          value={task.celularCliente}
          onChange={(e) => setTask({ ...task, celularCliente: e.target.value })}
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