import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import appFirebase from '../firebaseConfig/Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Loading from '../components/Loading';
import Login from '../login/Login';
import Home from '../pages/Home';


import ProtectedRoute from './ProtectedRoute';

const auth = getAuth(appFirebase);

function Rutas() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
            setUsuario(usuarioFirebase);
            setLoading(false); // Detén el estado de carga cuando ya sabes el estado del usuario.
        });

        return () => unsubscribe(); // Limpia el listener al desmontar el componente.
    }, []);

    if (loading) {
        return <Loading />; //<div>Cargando...</div>; // Muestra algo mientras se determina el estado del usuario.
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Login />} />
                <Route path='/login' element={<Login />} />

                <Route element={<ProtectedRoute isAllowed={!!usuario} />}>
                    <Route path='/home' element={<Home />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default Rutas;
