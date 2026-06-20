import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [mailCo, setMailCo] = useState("");
    const [passCo, setPasseCo] = useState("");
    const [erreurCo, setErreurCo] = useState("");

    const [pseudoIn, setPseudoIn] = useState("");
    const [mailIn, setMailIn] = useState("");
    const [passIn, setPasseIn] = useState("");
    const [passCon, setPasseCon] = useState("");
    const [erreurIn, setErreurIn] = useState("");
    const [successIn, setSuccessIn] = useState("");

    const handleCo = async () => {
        setErreurCo("");
        try {
            const response = await fetch(`${API_URL}/api/auth/signin`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ email: mailCo, password: passCo }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErreurCo(data.message || "Erreur de connexion");
                return;
            }

            localStorage.setItem("token", data.token);
            navigate("/profil");
        } catch (err) {
            setErreurCo("Une erreur est survenue, réessayez.");
            console.error("Erreur de connexion", err);
        }
    };

    const handleIn = async () => {
        setErreurIn("");
        setSuccessIn("");

        if (passIn !== passCon) {
            setErreurIn("Les mots de passe doivent être identiques.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ pseudo: pseudoIn, email: mailIn, password: passIn }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErreurIn(data.message || "Erreur lors de l'inscription");
                return;
            }

            setSuccessIn("Inscription réussie ! Vérifiez votre email pour activer votre compte.");
            setPseudoIn("");
            setMailIn("");
            setPasseIn("");
            setPasseCon("");
        } catch (err) {
            setErreurIn("Une erreur est survenue, réessayez.");
            console.error("Erreur inscription", err);
        }
    };

    return (
        <section className="auth">
            <div className="connexion">
                <h3>Espace Connexion</h3>
                <form action="">
                    <label>Email</label>
                    <input onChange={(e) => setMailCo(e.target.value)} type="text" placeholder="Entrez votre email" />
                    <label>Mot de passe</label>
                    <input onChange={(e) => setPasseCo(e.target.value)} type="password" placeholder="Entrez votre mot de passe" />
                    {erreurCo && <p className="auth__error">{erreurCo}</p>}
                    <button type="button" onClick={handleCo}>Se connecter</button>
                </form>
            </div>

            <div className="inscription">
                <h3>Pas encore inscrit ?</h3>
                <form action="">
                    <label>Pseudo</label>
                    <input value={pseudoIn} onChange={(e) => setPseudoIn(e.target.value)} type="text" placeholder="Choisissez votre pseudo" />
                    <label>Email</label>
                    <input value={mailIn} onChange={(e) => setMailIn(e.target.value)} type="text" placeholder="Entrez votre email" />
                    <label>Mot de passe</label>
                    <input value={passIn} onChange={(e) => setPasseIn(e.target.value)} type="password" placeholder="Entrez votre mot de passe" />
                    <label>Confirmez le mot de passe</label>
                    <input value={passCon} onChange={(e) => setPasseCon(e.target.value)} type="password" placeholder="Confirmez votre mot de passe" />
                    {erreurIn && <p className="auth__error">{erreurIn}</p>}
                    {successIn && <p className="auth__success">{successIn}</p>}
                    <button type="button" onClick={handleIn}>S'inscrire</button>
                </form>
            </div>
        </section>
    );
};

export default Auth;