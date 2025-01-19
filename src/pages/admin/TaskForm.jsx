// TaskForm.jsx

import React, { useState, useEffect } from 'react';
import '../../styles/TaskForm.css';
import '../../styles/TaskList.css';

const TaskForm = ({ onSubmit, existingTask, onCancel }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: false,
    dueDate: '',
    dueTime: '',
    encargado: '',
    clientName: '',
    clientLastName: '',
    clientPhone: '',
  });

  useEffect(() => {
    if (existingTask) {
      const dueDateObj = new Date(existingTask.dueDate);
      setTask({
        title: existingTask.title,
        description: existingTask.description,
        priority: existingTask.priority,
        dueDate: dueDateObj.toISOString().split('T')[0],
        dueTime: dueDateObj.toISOString().split('T')[1].slice(0, 5),
        encargado: existingTask.encargado || '',
        clientName: existingTask.clientName || '',
        clientLastName: existingTask.clientLastName || '',
        clientPhone: existingTask.clientPhone || '',
      });
    } else {
      setTask({ title: '', description: '', priority: false, dueDate: '', dueTime: '', encargado: '', clientName: '', clientLastName: '', clientPhone: '' });
    }
  }, [existingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.title || !task.encargado || !task.clientName || !task.clientLastName || !task.clientPhone) {
      alert('Todos los campos son obligatorios');
      return;
    }
    if (!task.dueDate || !task.dueTime) {
      alert('La fecha y hora son obligatorias');
      return;
    }

    try {
      const fullDateTime = new Date($`{task.dueDate}T${task.dueTime}:00`).toISOString();
      onSubmit({ ...task, dueDate: fullDateTime });

      if (!existingTask) {
        setTask({ title: '', description: '', priority: false, dueDate: '', dueTime: '', encargado: '', clientName: '', clientLastName: '', clientPhone: '' });
      }
    } catch (error) {
      console.error('Error al procesar la fecha y hora:', error);
      alert('Ha ocurrido un error al procesar la fecha y hora. Verifique los datos ingresados.');
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{existingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
      <input type="text" placeholder="Título" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
      <textarea placeholder="Descripción" value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
      <input type="date" value={task.dueDate} onChange={(e) => setTask({ ...task, dueDate: e.target.value })} placeholder="Fecha para realizar" />
      <input type="time" value={task.dueTime} onChange={(e) => setTask({ ...task, dueTime: e.target.value })} placeholder="Hora para realizar" />
      <input type="text" placeholder="Encargado" value={task.encargado} onChange={(e) => setTask({ ...task, encargado: e.target.value })} />
      <input type="text" placeholder="Nombre del Cliente" value={task.clientName} onChange={(e) => setTask({ ...task, clientName: e.target.value })} />
      <input type="text" placeholder="Apellido del Cliente" value={task.clientLastName} onChange={(e) => setTask({ ...task, clientLastName: e.target.value })} />
      <input type="text" placeholder="Celular del Cliente" value={task.clientPhone} onChange={(e) => setTask({ ...task, clientPhone: e.target.value })} />

      <label>
        <input type="checkbox" checked={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.checked })} />
        Importante
      </label>

      <div className="form-buttons">
        <button id="myButton" type="submit">{existingTask ? 'Actualizar' : 'Agregar'}</button>
        {existingTask && <button type="button" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
};

export default TaskForm;