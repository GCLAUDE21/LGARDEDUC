import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const ConfirmerEmail = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [statut, setStatut] = useState("chargement"); // chargement | succes | erreur

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatut("erreur");
            return;
        }

        const verifier = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`, {
                    signal: AbortSignal.timeout(30000) // attend jusqu'à 30 secondes
                });
                if (response.ok) {
                    setStatut("succes");
                    setTimeout(() => navigate("/auth"), 3000);
                } else {
                    setStatut("erreur");
                }
            } catch (err) {
                if (err.name === "TimeoutError") {
                    setStatut("timeout");
                } else {
                    setStatut("erreur");
                }
            }
        };

        verifier();
    }, []);

    return (
        <section className="auth">
            <div className="connexion">
                {statut === "chargement" && <p>Vérification en cours, merci de patienter...</p>}
                {statut === "timeout" && (
                    <>
                        <h3>Délai dépassé</h3>
                        <p>Le serveur met trop de temps à répondre. Réessayez dans quelques secondes.</p>
                    </>
                )}
                {statut === "succes" && (
                    <>
                        <h3>Email confirmé !</h3>
                        <p>Votre compte est activé. Vous allez être redirigé vers la connexion...</p>
                    </>
                )}
                {statut === "erreur" && (
                    <>
                        <h3>Lien invalide</h3>
                        <p>Ce lien est invalide ou a expiré. Contactez Laura si le problème persiste.</p>
                    </>
                )}
            </div>
        </section>
    );
};

export default ConfirmerEmail;