import React, { useEffect, useState } from 'react';
import ResaCard from '../components/ResaCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';
import DispoCalendar from '../components/DispoCalendar';

const ONGLETS = [
    { label: 'Pension', value: 'pension' },
    { label: 'Éducation', value: 'education' },
    { label: 'Pet Sitting', value: 'pet sitting' },
];

const Reservation = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [resasUser, setResasUser] = useState([]);
    const [chiensUser, setChiensUser] = useState([]);
    const [ongletActif, setOngletActif] = useState('pension');
    const [showModal, setShowModal] = useState(false);
    const [slot, setSlot] = useState("matin");

    // états du form
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

    // réservations filtrées par onglet
    const resasFiltrees = resasUser.filter(r => r.type === ongletActif);

    const resasEnAttente = resasFiltrees.filter(r => r.statut === "En attente");
    // Contre-proposition : Laura a proposé de nouvelles dates, l'user doit répondre
    const resasContreProposition = resasFiltrees.filter(r => r.statut === "Contre-proposition");
    const resasEnCours = resasFiltrees.filter(r =>
        r.statut === "Validée" &&
        new Date(r.dateDebut) <= today &&
        new Date(r.dateFin || r.dateDebut) >= today
    );
    const resasAVenir = resasFiltrees.filter(r =>
        r.statut === "Validée" && new Date(r.dateDebut) > today
    );
    const resasPassees = resasFiltrees.filter(r =>
        r.statut === "Refusée" || r.statut === "Annulée" ||
        (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today)
    );

    // bloquer si une resa en attente ou contre-proposition existe
    const aUneResaEnAttente = resasUser.some(r =>
        r.statut === "En attente" || r.statut === "Contre-proposition"
    );

    const handleOuvrirModal = () => {
        if (aUneResaEnAttente) return;
        setType(ongletActif);
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };  

    const handleFermerModal = () => {
        setShowModal(false);
        setDog([]);
        setNotes("");
        setDateDebut("");
        setDateFin("");
        setErreurBilan([]);
        setSlot("matin");
        document.body.style.overflow = '';
    };

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
                    body: JSON.stringify({ type, dateDebut, dateFin, notes, slot: (type === "education" || type === "pet sitting") ? slot : null, dog: dog.map(d => d._id) }),
                });
                if (!response) return;
                if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                const data = await response.json();
                setResasUser([...resasUser, data]);
                handleFermerModal();
            } catch (err) {
                console.log(err);
            }
        };
        resaCreateFetch();
    };

    if (loading) return <Loader />;

    return (
        <section className='reservations'>
            <div className="reservations-intro">
                <h2>Mes réservations</h2>
                <p>
                    Bienvenue sur votre espace réservations. Vous pouvez ici suivre l'historique de vos reservations et en créer de nouvelles selon vos besoins.
                </p>
                <div className="reservations-intro-types">
                    <div className="intro-type">
                        <h4>🏠 Pension</h4>
                        <p>Votre chien est hébergé chez Laura pour une durée déterminée. Idéal pour vos absences.</p>
                    </div>
                    <div className="intro-type">
                        <h4>🎓 Éducation</h4>
                        <p>Des séances de travail individuelles pour accompagner votre chien dans son apprentissage.</p>
                    </div>
                    <div className="intro-type">
                        <h4>🐾 Pet Sitting</h4>
                        <p>Laura se déplace à votre domicile pour s'occuper de vos animaux pendant votre absence.</p>
                    </div>
                </div>
                <p className="reservations-intro-notice">
                    Toute demande est examinée par Laura, qui peut la <strong>confirmer</strong>, la <strong>refuser</strong>,
                    ou vous faire une <strong>contre-proposition</strong> avec par exemple un horaire ou une date différente.
                    Dans ce cas, vous recevrez une notification et devrez accepter ou refuser la nouvelle proposition
                    pour finaliser votre réservation. Veuillez noter qu'<strong>une seule demande en attente est autorisée
                    à la fois</strong> : vous pourrez en soumettre une nouvelle une fois votre demande traitée par Laura.
                </p>
            </div>

            {/* Header avec onglets et bouton */}
            <div className="reservations-header">
                <div className="onglets">
                    {ONGLETS.map(o => (
                        <button
                            key={o.value}
                            className={`onglet ${ongletActif === o.value ? 'actif' : ''}`}
                            onClick={() => setOngletActif(o.value)}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
                <button
                    className={`btn-nouvelle-resa ${aUneResaEnAttente ? 'disabled' : ''}`}
                    onClick={handleOuvrirModal}
                    title={aUneResaEnAttente ? "Une demande est déjà en cours de traitement" : "Nouvelle demande"}
                >
                    + Nouvelle demande
                </button>
            </div>

            {/* Liste des réservations filtrées */}
            <div className="mes-reservations">

                {/* Contre-proposition : action requise de l'user */}
                {resasContreProposition.length > 0 && <>
                    <h3 className="section-contre-prop">⚡ Action requise</h3>
                    {resasContreProposition.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

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
                    <h3>Passées / Refusées</h3>
                    {resasPassees.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasFiltrees.length === 0 && (
                    <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                        Aucune réservation pour le moment.
                    </p>
                )}
            </div>

            {/* Modale nouvelle réservation */}
            {showModal && (
                <div className="modal-overlay" onClick={handleFermerModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleFermerModal}>×</button>
                        <h2>Nouvelle réservation</h2>
                        <div className="new-reservation-form">
                            <DispoCalendar type={type} />
                            <label htmlFor='type'>Type de réservation</label>
                            <select id='type' value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="pension">Pension</option>
                                <option value="pet sitting">Pet Sitting</option>
                                <option value="education">Education</option>
                            </select>

                            <label htmlFor="dateDebut">Date</label>
                            <input
                                style={{ borderColor: !dateDebut ? "darkred" : "green" }}
                                onChange={(e) => setDateDebut(e.target.value)}
                                id='dateDebut'
                                type="date"
                                value={dateDebut}
                            />

                            {(type === "education" || type === "pet sitting") && <>
                                <label htmlFor="slot">Demi-journée</label>
                                <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
                                    <option value="matin">Matin</option>
                                    <option value="apres-midi">Après-midi</option>
                                </select>
                            </>}

                            {(type === "pension" || type === "pet sitting") && <>
                                <label htmlFor="dateFin">Date de fin</label>
                                <input
                                    style={{ borderColor: !dateFin ? "darkred" : "green" }}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    id='dateFin'
                                    type="date"
                                    min={dateDebut}
                                    value={dateFin}
                                />
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
                            <textarea
                                placeholder='Merci de donner des indications sur vos attentes'
                                onChange={(e) => setNotes(e.target.value)}
                                value={notes}
                                id="notes"
                            />

                            {erreurBilan.map((msg, index) => (
                                <p style={{ color: "red" }} key={index}>{msg}</p>
                            ))}

                            <button onClick={handleCreateResa} type='button'>Valider la demande</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Reservation;