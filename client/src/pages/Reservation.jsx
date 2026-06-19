import React, { useEffect, useState } from 'react';
import ResaCard from '../components/ResaCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';

const Reservation = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [resasUser, setResasUser] = useState([]);
    const [chiensUser, setChiensUser] = useState([]);
    const [type, setType] = useState('pension');
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [notes, setNotes] = useState("");
    const [dog, setDog] = useState([]);
    const [erreurBilan, setErreurBilan] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const resaUserFetch = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/api/user/reservations`, { method: "get" });
                if (!response) return;
                if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                const data = await response.json();
                setResasUser(data);
            } catch (err) {
                console.log(err);
            } finally { setLoading(false); }
        };
        resaUserFetch();
    }, []);

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/api/user/dogs`, { method: "get" });
                if (!response) return;
                if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                const json = await response.json();
                setChiensUser(json);
            } catch (err) {
                console.log(err);
            }
        };
        fetchDogs();
    }, []);

    const today = new Date();

    const resasEnAttente = resasUser.filter(r => r.statut === "En attente");
    const resasEnCours = resasUser.filter(r =>
        r.statut === "Validée" &&
        new Date(r.dateDebut) <= today &&
        new Date(r.dateFin || r.dateDebut) >= today
    );
    const resasAVenir = resasUser.filter(r =>
        r.statut === "Validée" && new Date(r.dateDebut) > today
    );
    const resasPassees = resasUser.filter(r =>
        r.statut === "Refusée" ||
        (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today)
    );
    const resasAnnulees = resasUser.filter(r =>
         r.statut === "Annulée");

    const handleCreateResa = () => {
        if ((type === "pension" || type === "education") && dog.length === 0) {
            setErreurBilan(["Vous devez séléctionner au moins un chien"]);
            return;
        }
        if (!dateDebut) {
            setErreurBilan(["Merci de selectionner une date"]);
            return;
        }
        if ((type === "pension" || type === "pet sitting") && !dateFin) {
            setErreurBilan(["Merci de selectionner une date de fin"]);
            return;
        }
        if (type === "pension") {
            const sansBilan = dog.filter(d => !d.bilan);
            if (sansBilan.length > 0) {
                setErreurBilan(sansBilan.map(d => d.nom + " doit faire un bilan comportemental."));
                return;
            }
        }

        const resaCreateFetch = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/api/user/reservations`, {
                    method: "post",
                    body: JSON.stringify({ type, dateDebut, dateFin, notes, dog: dog.map(d => d._id) }),
                });
                if (!response) return;
                if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                const data = await response.json();
                setResasUser([...resasUser, data]);
                setDog([]);
                setNotes("");
                setErreurBilan([]);
            } catch (err) {
                console.log(err);
            }
        };
        resaCreateFetch();
    };

    if (loading) return <Loader />;
    return (
        <section className='reservations'>
            <div className="mes-reservations">
                <h2>Mes réservations</h2>
                {resasEnAttente.length > 0 && <>
                    <h3>En attente</h3>
                    {resasEnAttente.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}
                {resasEnCours.length > 0 && <>
                    <h3>En cours</h3>
                    {resasEnCours.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}
                {resasAVenir.length > 0 && <>
                    <h3>À venir</h3>
                    {resasAVenir.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}
                {resasPassees.length > 0 && <>
                    <h3>Passées / Annulés</h3>
                    {resasPassees.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}
                {resasUser.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Aucune réservation pour le moment.</p>}
            </div>
            <div className="new-reservation">
                <h2>Nouvelle réservation</h2>
                <form>
                    <label htmlFor='type'>Type de réservation</label>
                    <select id='type' onChange={(e) => setType(e.target.value)}>
                        <option value="pension">Pension</option>
                        <option value="pet sitting">Pet Sitting</option>
                        <option value="education">Education</option>
                    </select>

                    <label htmlFor="dateDebut">Date</label>
                    <input style={{ borderColor: !dateDebut ? "darkred" : "green" }} onChange={(e) => setDateDebut(e.target.value)} id='dateDebut' type="date" />

                    {(type === "pension" || type === "pet sitting") && <>
                        <label htmlFor="dateFin">Date de fin</label>
                        <input style={{ borderColor: !dateFin ? "darkred" : "green" }} onChange={(e) => setDateFin(e.target.value)} id='dateFin' type="date" min={dateDebut} />
                    </>}

                    {(type === "pension" || type === "education") && <>
                        <label htmlFor="dog">Pour</label>
                        <div className="chiensResa">
                            <select value="" onChange={(e) => {
                                const chienChoisi = chiensUser.find(c => c._id === e.target.value);
                                if (chienChoisi && !dog.find(d => d._id === chienChoisi._id)) setDog([...dog, chienChoisi]);
                            }} id="dog">
                                <option value="" disabled>Choisissez au moins un chien</option>
                                {chiensUser.map(d => <option key={d._id} value={d._id}>{d.nom}</option>)}
                            </select>
                        </div>
                        <div className="chiensChoisis">
                            {dog.map((chien, index) => (
                                <span key={index}>
                                    {chien.nom}
                                    <button type='button' onClick={() => setDog(dog.filter((_, i) => i !== index))}>x</button>
                                </span>
                            ))}
                        </div>
                    </>}

                    <label htmlFor="notes">Notes</label>
                    <textarea placeholder='Merci de donner des indications sur vos attentes' onChange={(e) => setNotes(e.target.value)} value={notes} id="notes" />

                    {erreurBilan.map((msg, index) => (
                        <p style={{ color: "red" }} key={index}>{msg}</p>
                    ))}

                    <button onClick={handleCreateResa} type='button'>Valider la demande de réservation</button>
                </form>
            </div>
        </section>
    );
};

export default Reservation;