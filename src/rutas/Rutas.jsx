import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig/Firebase"; // Asegúrate de exportar `db` correctamente

import Loading from "../components/Loading";
import Login from "../login/Login";
import Home from "../pages/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminTareas from "../pages/admin/AdminTareas";
import CreateUser from "../pages/admin/CreateUser";

const auth = getAuth(appFirebase);

function Rutas() {
  const [usuario, setUsuario] = useState(null);
  const [role, setRole] = useState(null); // Almacena el rol del usuario
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);

        try {
          // Obtén el rol del usuario desde Firestore
          const userDoc = doc(db, "users", usuarioFirebase.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userRole = userSnap.data().role;
            setRole(userRole); // Actualiza el estado del rol
          } else {
            console.error("El documento del usuario no existe.");
            setRole(null); // En caso de que no exista el documento
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error);
          setRole(null); // Maneja el error estableciendo el rol como null
        }
      } else {
        setUsuario(null);
        setRole(null);
      }
      setLoading(false); // Detén la pantalla de carga
    });

    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, []);

  if (loading) {
    return <Loading />; // Pantalla de carga mientras se determina el rol
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas para roles específicos */}
        <Route element={<ProtectedRoute isAllowed={!!usuario && role === "admin"} redirectPath="/home" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard role={role} />} />
          <Route path="/admin-users" element = { <AdminUsers /> } />
          <Route path="/admin-tareas" element = { <AdminTareas /> } />
          <Route path="/admin-createUser" element = { <CreateUser /> } />
        </Route>

        <Route element={<ProtectedRoute isAllowed={!!usuario} />}>
          <Route path="/home" element={<Home role={role} name={usuario} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Rutas;
