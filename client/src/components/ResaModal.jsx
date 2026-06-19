import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';

const ResaModal = ({ resa, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [notes, setNotes] = useState(resa.notes || "");
    const [editNotes, setEditNotes] = useState(false);

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Annulée": "annulee",
    }[resa.statut] || "en-attente";

    const handleSaveNotes = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/reservations/${resa._id}`, {
            method: "PUT",
            body: JSON.stringify({ notes }),
        });
        if (!res) return;
        setEditNotes(false);
    };

    const handleCancel = async () => {
    if (!window.confirm("Annuler cette réservation ?")) return;
    const res = await fetchWithAuth(`${API_URL}/api/reservations/${resa._id}`, {
        method: "PUT",
        body: JSON.stringify({ statut: "Annulée" }),
    });
    if (!res) return;
    onClose();
    window.location.reload();
};

    return (
        <div className="resa-modal-overlay" onClick={onClose}>
            <div className="resa-modal" onClick={(e) => e.stopPropagation()}>
                <button className="resa-modal__close" onClick={onClose}>✕</button>

                <div className="resa-modal__header">
                    <h3>{resa.type}</h3>
                    <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                    <p className="resa-modal__dates">
                        Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                        {resa.dateFin && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                    </p>
                </div>

                <div className="resa-modal__content">

                    {resa.dog?.length > 0 && <>
                        <h5 className="section-label">Chiens</h5>
                        <div className="resa-modal__chiens">
                            {resa.dog.map((chien, i) => (
                                <div key={i} className="resa-modal__chien">
                                    <img src={chien.photo || defaultDog} alt={chien.nom} />
                                    <span>{chien.nom}</span>
                                </div>
                            ))}
                                
                        </div>
                    </>}

                    <h5 className="section-label">Vos notes</h5>
                    {editNotes ? (
                        <>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Vos remarques, attentes..."
                            />
                            <div className="btn-row">
                                <button onClick={handleSaveNotes}>Enregistrer</button>
                                <button onClick={() => setEditNotes(false)}>Annuler</button>
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

                    {resa.evenements?.length > 0 && <>
                        <h5 className="section-label">
                            {resa.type === "education" ? "Comptes rendus de séances" : "Carnet de bord"}
                        </h5>
                        <div className="resa-modal__evenements">
                            {[...resa.evenements]
                                .sort((a, b) => new Date(a.date) - new Date(b.date))
                                .map((e, i) => (
                                    <div key={i} className="evenement">
                                        <span className="evenement__date">
                                            {new Date(e.date).toLocaleDateString('fr-FR')}
                                        </span>
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
                                    <button className="btn-danger" onClick={handleCancel}>
                                        Annuler la réservation
                                    </button>
                                )}

                </div>
            </div>
        </div>
    );
};

export default ResaModal;