import React, { useEffect, useState } from 'react';
import ResaCard from '../components/ResaCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';
import DispoCalendar from '../components/DispoCalendar';

const ONGLETS = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'Pension', value: 'pension' },
    { label: 'Éducation', value: 'education' },
    { label: 'Pet Sitting', value: 'pet sitting' },
];

const Reservation = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [resasUser, setResasUser] = useState([]);
    const [chiensUser, setChiensUser] = useState([]);
    const [ongletActif, setOngletActif] = useState('toutes');
    const [showModal, setShowModal] = useState(false);
    const [slot, setSlot] = useState("matin");

    const [type, setType] = useState('pension');
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [notes, setNotes] = useState("");
    const [dog, setDog] = useState([]);
    const [erreurBilan, setErreurBilan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [passagesParJour, setPassagesParJour] = useState(1);
    const [heuresPassages, setHeuresPassages] = useState([""]);

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

    const resasFiltrees = ongletActif === 'toutes'
        ? resasUser
        : ongletActif === 'pension'
            ? resasUser.filter(r => r.type === 'pension' || r.type === "journée d'essai")
            : resasUser.filter(r => r.type === ongletActif);

    const resasAVenir = resasFiltrees.filter(r =>
        r.statut === "Validée" && new Date(r.dateDebut) > today
    );
    const resasEnCours = resasFiltrees.filter(r =>
        r.statut === "Validée" &&
        new Date(r.dateDebut) <= today &&
        new Date(r.dateFin || r.dateDebut) >= today
    );
    const resasEnAttente = resasFiltrees.filter(r => r.statut === "En attente");
    const resasContreProposition = resasFiltrees.filter(r => r.statut === "Contre-proposition");
    const resasPassees = resasFiltrees.filter(r =>
        r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today
    );
    const resasRefusees = resasFiltrees.filter(r =>
        r.statut === "Refusée" || r.statut === "Annulée"
    );

    const aUneResaEnAttente = resasUser.some(r =>
        r.statut === "En attente" || r.statut === "Contre-proposition"
    );

    // Chiens autorisés pension
    const chiensPensionOk = chiensUser.filter(c => c.pensionAutorisee);
    // Chiens sans journée d'essai validée (pas encore pensionAutorisee)
    const chiensEssaiDispo = chiensUser.filter(c => !c.pensionAutorisee);

    const handleOuvrirModal = () => {
        if (aUneResaEnAttente) return;
        const t = ongletActif === 'toutes' ? 'pension' : ongletActif;
        setType(t);
        setHeuresPassages(t === 'pet sitting' ? [""] : []);
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
        setPassagesParJour(1);
        setHeuresPassages([]);
    };

    // Quand passagesParJour change, adapter le tableau :
        const handlePassagesChange = (nb) => {
            setPassagesParJour(nb);
            setHeuresPassages(Array(nb).fill(""));
        };


    const handleCreateResa = () => {
        setErreurBilan([]);

        if (type === "pension") {
            if (dog.length === 0) { setErreurBilan(["Vous devez sélectionner au moins un chien"]); return; }
            const nonAutorises = dog.filter(d => !d.pensionAutorisee);
            if (nonAutorises.length > 0) {
                setErreurBilan(nonAutorises.map(d => `${d.nom} n'a pas encore fait sa journée d'essai validée.`));
                return;
            }
        }

        if (type === "education") {
            if (dog.length === 0) { setErreurBilan(["Vous devez sélectionner au moins un chien"]); return; }
        }

        if (type === "journée d'essai") {
            if (dog.length === 0) { setErreurBilan(["Vous devez sélectionner au moins un chien"]); return; }
            const dejaAutorises = dog.filter(d => d.pensionAutorisee);
            if (dejaAutorises.length > 0) {
                setErreurBilan(dejaAutorises.map(d => `${d.nom} est déjà autorisé en pension.`));
                return;
            }
        }

        if (!dateDebut) { setErreurBilan(["Merci de sélectionner une date"]); return; }
        if (type === "pension" && !dateFin) {
        setErreurBilan(["Merci de sélectionner une date de fin"]);
        return;
    }

        const resaCreateFetch = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/api/user/reservations`, {
                    method: "post",
                    body: JSON.stringify({
                        type,
                        dateDebut,
                        dateFin,
                        notes,
                        slot: type === "education"  ? slot : null,
                        dog: dog.map(d => d._id),
                        passagesParJour: type === "pet sitting" ? passagesParJour : null,
                        heuresPassages: type === "pet sitting" && heuresPassages.some(h => h) ? heuresPassages.filter(h => h) : [],
                    }),
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

    // Chiens à afficher selon le type sélectionné dans le form
    const chiensDisposPourType = () => {
        if (type === "pension") return chiensPensionOk;
        if (type === "journée d'essai") return chiensEssaiDispo;
        return chiensUser;
    };

    if (loading) return <Loader />;

    return (
        <section className='reservations'>
            <div className="reservations-intro">
                <h2>Mes réservations</h2>
                <p>
                    Bienvenue sur votre espace réservations. Vous pouvez ici suivre l'historique de vos réservations et en créer de nouvelles selon vos besoins.
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
                    <div className="intro-type">
                        <h4>🐶 Journée d'essai</h4>
                        <p>Une journée pour évaluer votre chien avant toute pension. Obligatoire pour accéder à la pension.</p>
                    </div>
                </div>
                <p className="reservations-intro-notice">
                    Toute demande est examinée par Laura, qui peut la <strong>confirmer</strong>, la <strong>refuser</strong>,
                    ou vous faire une <strong>contre-proposition</strong>. Veuillez noter qu'<strong>une seule demande en attente est autorisée
                    à la fois</strong>.
                </p>
            </div>

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

            <div className="mes-reservations">
                {resasContreProposition.length > 0 && <>
                    <h3 className="section-contre-prop">⚡ Action requise ({resasContreProposition.length})</h3>
                    {resasContreProposition.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasAVenir.length > 0 && <>
                    <h3>À venir ({resasAVenir.length})</h3>
                    {resasAVenir.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasEnCours.length > 0 && <>
                    <h3>En cours ({resasEnCours.length})</h3>
                    {resasEnCours.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasEnAttente.length > 0 && <>
                    <h3>En attente ({resasEnAttente.length})</h3>
                    {resasEnAttente.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasPassees.length > 0 && <>
                    <h3>Passées ({resasPassees.length})</h3>
                    {resasPassees.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasRefusees.length > 0 && <>
                    <h3>Annulées / Refusées ({resasRefusees.length})</h3>
                    {resasRefusees.map(r => <ResaCard key={r._id} resa={r} />)}
                </>}

                {resasFiltrees.length === 0 && (
                    <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Aucune réservation pour le moment.</p>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={handleFermerModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleFermerModal}>×</button>
                        <h2>Nouvelle réservation</h2>
                        <div className="new-reservation-form">
                            {type !== "pet sitting" && (
                                <DispoCalendar type={type === "journée d'essai" ? "pension" : type} />
                            )}

                            <label htmlFor='type'>Type de réservation</label>
                            <select id='type' value={type} onChange={(e) => {const t = e.target.value;
                                                                            setType(t);
                                                                            setDog([]);
                                                                            setErreurBilan([]);
                                                                            setHeuresPassages(t === 'pet sitting' ? [""] : []);
                                                                        }}>
                                <option value="pension">Pension</option>
                                <option value="education">Éducation</option>
                                <option value="pet sitting">Pet Sitting</option>
                                <option value="journée d'essai">Journée d'essai</option>
                            </select>

                            <label htmlFor="dateDebut">Date</label>
                            <input
                                style={{ borderColor: !dateDebut ? "darkred" : "green" }}
                                onChange={(e) => setDateDebut(e.target.value)}
                                id='dateDebut'
                                type="date"
                                value={dateDebut}
                            />

                            {(type === "education") && <>
                                <label htmlFor="slot">Demi-journée</label>
                                <select id="slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
                                    <option value="matin">Matin</option>
                                    <option value="apres-midi">Après-midi</option>
                                </select>
                            </>}

                            {(type === "pension" || type === "pet sitting") && <>
                                <label htmlFor="dateFin">
                                    Date de fin {type === "pet sitting" && <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(optionnelle)</span>}
                                </label>
                                <input
                                    style={{ borderColor: !dateFin && type !== "pet sitting" ? "darkred" : dateFin ? "green" : "" }}
                                    onChange={(e) => setDateFin(e.target.value)}
                                    id='dateFin'
                                    type="date"
                                    min={dateDebut}
                                    value={dateFin}
                                />
                            </>}

                            {type === "pet sitting" && <>
                                <label htmlFor="passages">Passages par jour</label>
                                <select id="passages" value={passagesParJour} onChange={(e) => handlePassagesChange(Number(e.target.value))}>
                                    <option value={1}>1 passage</option>
                                    <option value={2}>2 passages</option>
                                    <option value={3}>3 passages</option>
                                </select>

                                {heuresPassages.map((h, i) => (
                                    <div key={i}>
                                        <label>Heure passage {i + 1} (optionnel)</label>
                                        <input
                                            type="time"
                                            value={h}
                                            onChange={(e) => {
                                                const maj = [...heuresPassages];
                                                maj[i] = e.target.value;
                                                setHeuresPassages(maj);
                                            }}
                                        />
                                    </div>
                                ))}
                            </>}

                            {(type === "pension" || type === "education" || type === "journée d'essai") && <>
                                <label htmlFor="dog">
                                    {type === "pension" && "Chien(s) autorisés en pension"}
                                    {type === "education" && "Pour quel chien"}
                                    {type === "journée d'essai" && "Chien à évaluer"}
                                </label>
                                <div className="chiensResa">
                                    <select value="" onChange={(e) => {
                                        const chienChoisi = chiensDisposPourType().find(c => c._id === e.target.value);
                                        if (chienChoisi && !dog.find(d => d._id === chienChoisi._id)) setDog([...dog, chienChoisi]);
                                    }} id="dog">
                                        <option value="" disabled>
                                            {chiensDisposPourType().length === 0
                                                ? type === "pension"
                                                    ? "Aucun chien autorisé en pension"
                                                    : "Aucun chien disponible"
                                                : "Choisissez un chien"
                                            }
                                        </option>
                                        {chiensDisposPourType().map(d => (
                                            <option key={d._id} value={d._id}>{d.nom}</option>
                                        ))}
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
                                {type === "pension" && chiensPensionOk.length === 0 && (
                                    <p style={{ fontSize: '0.8rem', color: '#c9922a', marginTop: '0.25rem' }}>
                                        Aucun de vos chiens n'a encore effectué sa journée d'essai. Commencez par réserver une journée d'essai.
                                    </p>
                                )}
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