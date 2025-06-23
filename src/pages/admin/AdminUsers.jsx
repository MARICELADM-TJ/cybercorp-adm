import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig/Firebase";
import "../../styles/AdminUsers.css";
import Swal from "sweetalert2";
import { FaCog } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Definición de permisos disponibles
  const availablePermissions = [
    { id: 'view_inspections', label: 'Ver Inspecciones' },
    { id: 'manage_tasks', label: 'Administrar Tareas' },
    { id: 'manage_inspections', label: 'Administrar Inspecciones' },
    { id: 'view_calendar', label: 'Ver Calendario' },
    { id: 'manage_sales', label: 'Administrar Ventas' }
  ];

  // Roles disponibles
  const availableRoles = [
    { value: 'invitado', label: 'Invitado' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'contabilidad', label: 'Contabilidad' }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          permissions: doc.data().permissions || []
        }));
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los usuarios: ", error);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleActive = async (userId, isActive) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { active: !isActive });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, active: !isActive } : user
        )
      );
      
      Swal.fire({
        icon: "success",
        title: `Usuario ${!isActive ? 'activado' : 'desactivado'} exitosamente`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del usuario"
      });
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handlePermissionsUpdate = async () => {
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, {
        permissions: selectedUser.permissions,
        role: selectedUser.role
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );

      setShowPermissionsModal(false);
      
      Swal.fire({
        icon: "success",
        title: "Permisos actualizados",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron actualizar los permisos"
      });
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleRoleChange = (newRole) => {
    setSelectedUser(prev => ({
      ...prev,
      role: newRole
    }));
  };

  const filteredUsers = users.filter(
    (user) => 
      user.role !== "admin" && 
      `${user.nombre} ${user.apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const admins = users.filter((user) => user.role === "admin");
  const regularUsers = filteredUsers;

  return (
    <div className="admin-users">
      <h1>Gestión de Usuarios</h1>

      <h2>Administradores</h2>
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Celular</th>
              <th>Último acceso</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.nombre}</td>
                <td>{admin.apellido}</td>
                <td>{admin.email}</td>
                <td>{admin.celular || "No disponible"}</td>
                <td>{admin.lastLoginAt || "No disponible"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Usuarios</h2>
      <input
        type="text"
        placeholder="Buscar por nombre y apellido"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Celular</th>
            <th>Último acceso</th>
            <th>Estado</th>
            <th>Permisos</th>
          </tr>
        </thead>
        <tbody>
          {regularUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.celular || "No disponible"}</td>
              <td>{user.lastLoginAt || "No disponible"}</td>
              <td>
                <button
                  className={`toggle-button ${user.active ? "active" : "inactive"}`}
                  onClick={() => handleToggleActive(user.id, user.active)}
                >
                  {user.active ? "Desactivar" : "Activar"}
                </button>
              </td>
              <td>
                <button
                  className="permissions-button"
                  onClick={() => openPermissionsModal(user)}
                >
                  <FaCog /> Permisos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPermissionsModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content permissions-modal">
            <h3>Gestionar Permisos y Rol</h3>
            
            <div className="role-section">
              <h4>Rol del Usuario</h4>
              <select
                value={selectedUser.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="role-select"
              >
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="permissions-section">
              <h4>Permisos</h4>
              {availablePermissions.map(permission => (
                <div key={permission.id} className="permission-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                    />
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button onClick={handlePermissionsUpdate} className="save-button">
                Guardar
              </button>
              <button 
                onClick={() => setShowPermissionsModal(false)} 
                className="cancel-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;