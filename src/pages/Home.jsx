import React from "react";
import appFirebase from "../firebaseConfig/Firebase";
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth(appFirebase);

const Home = () => {

    return(
        <div>
            <h1>
                page Home user
            </h1>
            <button onClick={() => signOut(auth)} > cerrar sesion</button>
        </div>
    )
}

export default Home;