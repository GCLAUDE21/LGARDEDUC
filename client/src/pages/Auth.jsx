import { useState } from "react";
import {useNavigate} from "react-router-dom"

const Auth = () => {

    const [mailCo, setMailCo] = useState("");
    const [passCo, setPasseCo] = useState("");

    const [pseudoIn, setPseudoIn] = useState("");
    const [mailIn, setMailIn] = useState("");
    const [passIn, setPasseIn] = useState("");
    const [passCon, setPasseCon] = useState("");

    const navigate = useNavigate()

        const handleCo = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;

                const response = await fetch (`${API_URL}/api/auth/signin`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",},
                    method: "POST",
                    body: JSON.stringify({"email": mailCo, "password": passCo}),
                });
                if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();

            localStorage.setItem('token', data.token)
            navigate('/profil')

            } catch (err) {
                console.error("Erreur de connexion", err)
            } 
            };

        const handleIn = async () => {
            if (passIn === passCon) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL;
    
                    const response = await fetch (`${API_URL}/api/auth/signup`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",},
                        method: "POST",
                        body: JSON.stringify({"pseudo": pseudoIn, "email": mailIn, "password": passIn}),
                    });
                    if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                const data = await response.text();
                console.log(data)
                
    
                } catch (err) {
                    console.error("Erreur lors de l'envoi de la requête :", err)
                } 
                } else {
                    console.log("Les mots de passes doivent être identique");
                    
                };
            }


    return (
        <section className="auth">
            <div className="connexion">
                <h3> Espace Connexion</h3>
                <form action="">
                    <label id='email-connexion' >Email</label>
                    <input onChange={(e) => setMailCo(e.target.value)} type="text" placeholder='Entrez votre email' id='email-connexion' />
                    <label id='motdepasse-connexion' >Mot de Passe</label>
                    <input onChange={(e) => setPasseCo(e.target.value)} type="password" placeholder='Entrez votre mot de passe' id='motdepasse-connexion' />
                    <button type="button" onClick={() => handleCo()}>Se connecter</button>

                </form>
            </div>
            <div className="inscription">
                 <h3> Pas encore inscris ?</h3>
                <form action="">
                    <label id='pseudo' >Pseudo</label>
                    <input onChange={(e) => setPseudoIn(e.target.value)}  type="text" placeholder='Entrez un pseudo' id='pseudo' />
                    <label id='email-inscription' >Email</label>
                    <input onChange={(e) => setMailIn(e.target.value)} type="text" placeholder='Entrez votre email' id='email-inscription' />
                    <label id='motdepasse-inscription' >Choisissez un mot de passe</label>
                    <input onChange={(e) => setPasseIn(e.target.value)} type="password" placeholder='Entrez votre mot de passe' id='motdepasse-inscription' />
                    <label id='motdepasse-validation' >Confirmez le mot de passe</label>
                    <input onChange={(e) => setPasseCon(e.target.value)} type="password" placeholder='Entrez votre mot de passe' id='motdepasse-validation' />
                    <button type="button" onClick={() => handleIn()}>S'inscrire</button>

                </form>

            </div>
        </section>
    );
};

export default Auth;