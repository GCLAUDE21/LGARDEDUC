import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import DogModal from './DogModal';

const ResaModal = ({ resa, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [notes, setNotes] = useState(resa.notes || "");
    const [editNotes, setEditNotes] = useState(false);
    const [dogSelectionne, setDogSelectionne] = useState(null);

    // --- États loading par action ---
    const [loadingChienId, setLoadingChienId] = useState(null);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [loadingAccepter, setLoadingAccepter] = useState(false);
    const [loadingRefuser, setLoadingRefuser] = useState(false);

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Annulée": "annulee",
        "Contre-proposition": "contre-proposition",
    }[resa.statut] || "en-attente";

    // --- Fetch chien complet au clic ---
    const handleClickChien = async (chien) => {
        if (loadingChienId) return;
        setLoadingChienId(chien._id);
        const res = await fetchWithAuth(`${API_URL}/api/user/dogs/${chien._id}`);
        setLoadingChienId(null);
        if (!res) return;
        const data = await res.json();
        setDogSelectionne(data);
    };

    // --- Sauvegarder les notes ---
    const handleSaveNotes = async () => {
        if (loadingNotes) return;
        setLoadingNotes(true);
        const res = await fetchWithAuth(`${API_URL}/api/user/reservations/${resa._id}`, {
            method: "PUT",
            body: JSON.stringify({ notes }),
        });
        setLoadingNotes(false);
        if (!res) return;
        setEditNotes(false);
    };

    // --- Annuler la réservation ---
    const handleCancel = async () => {
        if (!window.confirm("Annuler cette réservation ?")) return;
        if (loadingCancel) return;
        setLoadingCancel(true);
        const res = await fetchWithAuth(`${API_URL}/api/user/reservations/${resa._id}`, {
            method: "PUT",
            body: JSON.stringify({ statut: "Annulée" }),
        });
        setLoadingCancel(false);
        if (!res) return;
        onClose();
        window.location.reload();
    };

    // --- Accepter la contre-proposition ---
    const handleAccepterContreProposition = async () => {
        if (loadingAccepter) return;
        setLoadingAccepter(true);
        const res = await fetchWithAuth(`${API_URL}/api/user/reservations/${resa._id}/contre-proposition/accepter`, {
            method: "PUT",
        });
        setLoadingAccepter(false);
        if (!res) return;
        onClose();
        window.location.reload();
    };

    // --- Refuser la contre-proposition ---
    const handleRefuserContreProposition = async () => {
        if (loadingRefuser) return;
        setLoadingRefuser(true);
        const res = await fetchWithAuth(`${API_URL}/api/user/reservations/${resa._id}/contre-proposition/refuser`, {
            method: "PUT",
        });
        setLoadingRefuser(false);
        if (!res) return;
        onClose();
        window.location.reload();
    };

    return (
        <>
            <div className="resa-modal-overlay" onClick={onClose}>
                <div className="resa-modal" onClick={(e) => e.stopPropagation()}>
                    <button className="resa-modal__close" onClick={onClose}>✕</button>

                    <div className="resa-modal__header">
                        <h3>{resa.type}</h3>
                        <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                        <p className="resa-modal__dates">
                            Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                            {resa.dateFin && resa.type !== "education" && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                        </p>

                        {resa.statut === "Contre-proposition" && resa.contreProposition && (
                            <div className="resa-modal__contre-prop">
                                <p>Laura vous propose de nouvelles dates :</p>
                                <p><strong>
                                    Du {new Date(resa.contreProposition.dateDebut).toLocaleDateString('fr-FR')}
                                    {resa.contreProposition.dateFin && ` au ${new Date(resa.contreProposition.dateFin).toLocaleDateString('fr-FR')}`}
                                </strong></p>
                                {resa.contreProposition.message && <p>{resa.contreProposition.message}</p>}
                                <div className="btn-row">
                                    <button onClick={handleAccepterContreProposition} disabled={loadingAccepter || loadingRefuser}>
                                        {loadingAccepter ? "..." : "Accepter"}
                                    </button>
                                    <button onClick={handleRefuserContreProposition} disabled={loadingRefuser || loadingAccepter}>
                                        {loadingRefuser ? "..." : "Refuser"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="resa-modal__content">
                        {resa.dog?.length > 0 && <>
                            <h5 className="section-label">Chiens</h5>
                            <div className="resa-modal__chiens">
                                {resa.dog.map((chien, i) => (
                                    <div
                                        key={i}
                                        className={`resa-modal__chien clickable ${loadingChienId === chien._id ? "loading" : ""}`}
                                        onClick={() => handleClickChien(chien)}
                                        style={{ opacity: loadingChienId && loadingChienId !== chien._id ? 0.5 : 1 }}
                                    >
                                        <div className="chien-img-wrapper">
                                            <img src={chien.photo || defaultDog} alt={chien.nom} />
                                            {loadingChienId === chien._id && (
                                                <div className="chien-loading-overlay">🐾</div>
                                            )}
                                        </div>
                                        <span>{chien.nom}</span>
                                    </div>
                                ))}
                            </div>
                        </>}

                        <h5 className="section-label">Vos notes</h5>
                        {editNotes ? (
                            <>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vos remarques, attentes..." />
                                <div className="btn-row">
                                    <button onClick={handleSaveNotes} disabled={loadingNotes}>
                                        {loadingNotes ? "..." : "Enregistrer"}
                                    </button>
                                    <button onClick={() => setEditNotes(false)} disabled={loadingNotes}>
                                        Annuler
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="notes-text">{notes || <span className="empty">Aucune note</span>}</p>
                                <button className="btn-small" onClick={() => setEditNotes(true)}>
                                    {notes ? "Modifier" : "Ajouter une note"}
                                </button>
                            </>
                        )}

                        {resa.bilanLaura && <>
                            <h5 className="section-label">Bilan de Laura</h5>
                            <p className="notes-text">{resa.bilanLaura}</p>
                        </>}

                        {(resa.statut === "Refusée" || resa.statut === "Annulée") && resa.motifRefus && <>
                            <h5 className="section-label">
                                {resa.statut === "Annulée" ? "Motif de l'annulation" : "Motif du refus"}
                            </h5>
                            <p className="notes-text">{resa.motifRefus}</p>
                        </>}

                        {resa.evenements?.length > 0 && <>
                            <h5 className="section-label">
                                {resa.type === "education" ? "Comptes rendus de séances" : "Carnet de bord"}
                            </h5>
                            <div className="resa-modal__evenements">
                                {[...resa.evenements]
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .map((e, i) => (
                                        <div key={i} className="evenement">
                                            <span className="evenement__date">{new Date(e.date).toLocaleDateString('fr-FR')}</span>
                                            {e.photo && <img src={e.photo} alt="photo" className="evenement__photo" />}
                                            <p className="evenement__desc">{e.description}</p>
                                            {resa.type === "education" && <>
                                                {e.realise && <div className="evenement__row"><span>Réalisé</span><p>{e.realise}</p></div>}
                                                {e.aFaire && <div className="evenement__row"><span>À faire</span><p>{e.aFaire}</p></div>}
                                                {e.aAmeliorer && <div className="evenement__row"><span>À améliorer</span><p>{e.aAmeliorer}</p></div>}
                                            </>}
                                        </div>
                                    ))
                                }
                            </div>
                        </>}

                        {resa.statut === "En attente" && (
                            <button className="btn-danger" onClick={handleCancel} disabled={loadingCancel}>
                                {loadingCancel ? "Annulation..." : "Annuler la réservation"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {dogSelectionne && (
                <DogModal
                    dog={dogSelectionne}
                    onClose={() => setDogSelectionne(null)}
                    onUpdate={(dogMaj) => setDogSelectionne(dogMaj)}
                    onDelete={() => setDogSelectionne(null)}
                />
            )}
        </>
    );
};

export default ResaModal;