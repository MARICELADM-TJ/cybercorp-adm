import React from 'react'

import Rutas from './rutas/Rutas';

function App() {
  return (
    <div>
      <Rutas />
    </div>
  )
}

export default App;


/*
const [usuario, setUsuario] = useState(null);
  onAuthStateChanged(auth, (usuarioFirebase) => {
    if(usuarioFirebase){
       setUsuario(usuarioFirebase);
     }
     else{
       setUsuario(null);
     }
   });
*/