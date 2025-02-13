// TaskList.jsx

import React from "react";
import "../styles/TaskList.css";

const TaskList = ({ tasks, onDelete, onEdit, onStart, onComplete, onCancel }) => {
  const formatDate = (isoString) => {
    if (!isoString) return "Sin fecha";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-item ${task.priority ? "important" : ""} ${task.completed ? "completed" : ""}`}
        >
          <div>
            <h3
              style={{ textDecoration: task.completed ? "line-through" : "none" }}
            >
              {task.title}
            </h3>
            <p>{task.description}</p>
            <p>{`Fecha para realizar: ${formatDate(task.dueDate)}`}</p>
            <p>{`Encargado: ${task.encargado}`}</p>
            {(task.clientName && task.clientLastName && task.clientPhone) ? <p>{`Cliente: ${task.clientName} ${task.clientLastName}`}</p> : "Cliente: N/C"}
            {task.clientPhone && <p>{`Teléfono: ${task.clientPhone || 'N/C'}`}</p>}
            
            {task.startDate && <p>{`Fecha de inicio: ${formatDate(task.startDate)}`}</p>}
            {task.endDate && <p>{`Fecha de fin: ${formatDate(task.endDate)}`}</p>}
          </div>
          <div className="task-actions">
            {!task.startDate && onStart && (
              <button onClick={() => onStart(task.id)}>Iniciar Tarea</button>
            )}
            {task.startDate && !task.completed && onComplete && (
              <button onClick={() => onComplete(task.id)}>Terminar Tarea</button>
            )}
            {task.startDate && !task.completed && onCancel && (
              <button onClick={() => onCancel(task.id)}>Cancelar Tarea</button>
            )}
            {task.completed && <span className="completed-label">✔ Completada</span>}
            {onEdit && <button onClick={() => onEdit(task)}>Editar</button>}
            {onDelete && <button onClick={() => onDelete(task.id)}>Eliminar</button>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
