import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import DogModal from './DogModal';
import AdminUserModal from './AdminUserModal';

const AdminResaModal = ({ resa, onClose, onUpdate, onDelete }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    // --- State actions ---
    const [showRefus, setShowRefus] = useState(false);
    const [motifRefus, setMotifRefus] = useState(resa.motifRefus || "");
    const [showContreProposition, setShowContreProposition] = useState(false);
    const [contreProposition, setContreProposition] = useState({
        dateDebut: resa.contreProposition?.dateDebut?.slice(0, 10) || "",
        dateFin: resa.contreProposition?.dateFin?.slice(0, 10) || "",
        message: resa.contreProposition?.message || "",
    });
    const [showAnnulation, setShowAnnulation] = useState(false);

    // --- State modales par dessus ---
    const [userSelectionne, setUserSelectionne] = useState(null);
    const [dogSelectionne, setDogSelectionne] = useState(null);

    // --- State bilan ---
    const [bilanLaura, setBilanLaura] = useState(resa.bilanLaura || "");
    const [editBilan, setEditBilan] = useState(false);

    // --- State événements ---
    const [evenements, setEvenements] = useState(resa.evenements || []);
    const [showFormEvenement, setShowFormEvenement] = useState(false);
    const [newEvenement, setNewEvenement] = useState({
        date: "", description: "", photo: "",
        realise: "", aFaire: "", aAmeliorer: "",
    });

    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
    const isEducation = resa.type === "education";

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Contre-proposition": "contre-proposition",
    }[resa.statut] || "en-attente";

    // --- Fetch user complet au clic sur le proprio ---
    const handleClickProprietaire = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/users`);
        if (!res) return;
        const users = await res.json();
        const userComplet = users.find(u => u._id === resa.owner._id);
        if (userComplet) setUserSelectionne(userComplet);
    };

    // --- Fetch chien complet au clic ---
    const handleClickChien = async (chien) => {
        const res = await fetchWithAuth(`${API_URL}/api/dogs/${chien._id}`);
        if (!res) return;
        const data = await res.json();
        setDogSelectionne(data);
    };

    // --- Valider la réservation ---
    const handleValider = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/valider`, { method: "PUT" });
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
    };

    // --- Refuser la réservation ---
    const handleRefuser = async () => {
        if (!motifRefus) return;
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/refuser`, {
            method: "PUT",
            body: JSON.stringify({ motifRefus }),
        });
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowRefus(false);
    };

    // --- Envoyer une contre-proposition ---
    const handleContreProposition = async () => {
        if (!contreProposition.dateDebut) return;
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/contre-proposition`, {
            method: "PUT",
            body: JSON.stringify(contreProposition),
        });
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowContreProposition(false);
    };

    // --- Annuler une réservation validée ---
    const handleAnnuler = async () => {
        if (!motifRefus) return;
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/annuler`, {
            method: "PUT",
            body: JSON.stringify({ motifRefus }),
        });
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowAnnulation(false);
    };

    // --- Sauvegarder le bilan ---
    const handleSaveBilan = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/bilan`, {
            method: "PUT",
            body: JSON.stringify({ bilanLaura }),
        });
        if (!res) return;
        setEditBilan(false);
    };

    // --- Ajouter un événement / compte rendu ---
    const handleAddEvenement = async () => {
        if (!newEvenement.date || !newEvenement.description) return;
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/evenements`, {
            method: "POST",
            body: JSON.stringify(newEvenement),
        });
        if (!res) return;
        const updated = await res.json();
        setEvenements(updated.evenements);
        setNewEvenement({ date: "", description: "", photo: "", realise: "", aFaire: "", aAmeliorer: "" });
        setShowFormEvenement(false);
    };

    // --- Supprimer un événement ---
    const handleDeleteEvenement = async (evenementId) => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/evenements/${evenementId}`, {
            method: "DELETE",
        });
        if (!res) return;
        const updated = await res.json();
        setEvenements(updated.evenements);
    };

    // --- Supprimer définitivement une réservation (archives uniquement) ---
        const handleSupprimer = async () => {
            if (!window.confirm("Supprimer définitivement cette réservation ?")) return;
            const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}`, {
                method: "DELETE",
            });
            if (!res) return;
            onDelete(resa._id);
        };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                    {/* Bouton fermeture */}
                    <button className="modal-close" onClick={onClose}>×</button>

                    {/* En-tête : type + statut */}
                    <div className="modal-resa-header">
                        <h2>{resa.type}</h2>
                        <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                    </div>

                    {/* Propriétaire cliquable — fetche le user complet */}
                    <div className="modal-resa-section">
                        <h4>Propriétaire</h4>
                        <p className="clickable-link" onClick={handleClickProprietaire}>
                            {resa.owner?.pseudo}
                        </p>
                        <p>{resa.owner?.email}</p>
                    </div>

                    {/* Chiens concernés — cliquables */}
                    {resa.dog?.length > 0 && (
                        <div className="modal-resa-section">
                            <h4>Chien(s)</h4>
                            <div className="resa-card__chiens">
                                {resa.dog.map((chien, i) => (
                                    <div
                                        key={i}
                                        className="resa-card__chien clickable"
                                        onClick={() => handleClickChien(chien)}
                                    >
                                        <img src={chien.photo || defaultDog} alt={chien.nom} />
                                        <span>{chien.nom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dates demandées */}
                    <div className="modal-resa-section">
                        <h4>Dates demandées</h4>
                        <p>Du {formatDate(resa.dateDebut)}{resa.dateFin && !isEducation && ` au ${formatDate(resa.dateFin)}`}</p>
                    </div>

                    {/* Contre-proposition en cours */}
                    {resa.statut === "Contre-proposition" && resa.contreProposition && (
                        <div className="modal-resa-section modal-resa-section--highlight">
                            <h4>Contre-proposition envoyée</h4>
                            <p>Du {formatDate(resa.contreProposition.dateDebut)}
                                {resa.contreProposition.dateFin && ` au ${formatDate(resa.contreProposition.dateFin)}`}
                            </p>
                            {resa.contreProposition.message && <p>{resa.contreProposition.message}</p>}
                        </div>
                    )}

                    {/* Notes de l'utilisateur */}
                    {resa.notes && (
                        <div className="modal-resa-section">
                            <h4>Notes de l'utilisateur</h4>
                            <p>{resa.notes}</p>
                        </div>
                    )}

                    {/* Motif de refus / annulation */}
                    {(resa.statut === "Refusée" || resa.statut === "Annulée") && resa.motifRefus && (
                        <div className="modal-resa-section modal-resa-section--danger">
                            <h4>{resa.statut === "Annulée" ? "Motif de l'annulation" : "Motif du refus"}</h4>
                            <p>{resa.motifRefus}</p>
                        </div>
                    )}

                    {/* === ACTIONS : En attente ou Contre-proposition === */}
                    {(resa.statut === "En attente" || resa.statut === "Contre-proposition") && (
                        <div className="modal-resa-section">
                            <h4>Actions</h4>
                            <div className="resa-card__actions">
                                <button className="btn-valider" onClick={handleValider}>Valider</button>
                                <button className="btn-refuser" onClick={() => { setShowRefus(true); setShowContreProposition(false); setShowAnnulation(false); }}>Refuser</button>
                                <button className="btn-contre-prop" onClick={() => { setShowContreProposition(true); setShowRefus(false); setShowAnnulation(false); }}>Contre-proposition</button>
                            </div>

                            {/* Formulaire refus */}
                            {showRefus && (
                                <div className="resa-card__refus">
                                    <label>Motif du refus</label>
                                    <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder="Expliquez la raison du refus..." />
                                    <div className="btn-row">
                                        <button onClick={handleRefuser}>Confirmer le refus</button>
                                        <button onClick={() => setShowRefus(false)}>Annuler</button>
                                    </div>
                                </div>
                            )}

                            {/* Formulaire contre-proposition */}
                            {showContreProposition && (
                                <div className="resa-card__refus">
                                    <label>Nouvelle date de début</label>
                                    <input type="date" value={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateDebut: e.target.value })} />
                                    {!isEducation && <>
                                        <label>Nouvelle date de fin</label>
                                        <input type="date" value={contreProposition.dateFin} min={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateFin: e.target.value })} />
                                    </>}
                                    <label>Message</label>
                                    <textarea value={contreProposition.message} onChange={(e) => setContreProposition({ ...contreProposition, message: e.target.value })} placeholder="Expliquez la proposition..." />
                                    <div className="btn-row">
                                        <button onClick={handleContreProposition}>Envoyer</button>
                                        <button onClick={() => setShowContreProposition(false)}>Annuler</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* === ACTIONS : Validée === */}
                    {resa.statut === "Validée" && (
                        <div className="modal-resa-section">
                            <h4>Actions</h4>
                            <div className="resa-card__actions">
                                <button className="btn-contre-prop" onClick={() => { setShowContreProposition(true); setShowAnnulation(false); }}>Modifier les dates</button>
                                <button className="btn-refuser" onClick={() => { setShowAnnulation(true); setShowContreProposition(false); }}>Annuler la réservation</button>
                            </div>

                            {/* Formulaire modification dates */}
                            {showContreProposition && (
                                <div className="resa-card__refus">
                                    <label>Nouvelle date de début</label>
                                    <input type="date" value={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateDebut: e.target.value })} />
                                    {!isEducation && <>
                                        <label>Nouvelle date de fin</label>
                                        <input type="date" value={contreProposition.dateFin} min={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateFin: e.target.value })} />
                                    </>}
                                    <label>Message</label>
                                    <textarea value={contreProposition.message} onChange={(e) => setContreProposition({ ...contreProposition, message: e.target.value })} placeholder="Expliquez la modification..." />
                                    <div className="btn-row">
                                        <button onClick={handleContreProposition}>Envoyer</button>
                                        <button onClick={() => setShowContreProposition(false)}>Annuler</button>
                                    </div>
                                </div>
                            )}

                            {/* Formulaire annulation */}
                            {showAnnulation && (
                                <div className="resa-card__refus">
                                    <label>Motif de l'annulation</label>
                                    <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder="Expliquez la raison de l'annulation..." />
                                    <div className="btn-row">
                                        <button onClick={handleAnnuler}>Confirmer l'annulation</button>
                                        <button onClick={() => setShowAnnulation(false)}>Annuler</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suppression définitive (archives uniquement) */}
                        {(resa.statut === "Refusée" || resa.statut === "Annulée") && (
                            <div className="modal-resa-section">
                                <h4>Zone de danger</h4>
                                <button className="btn-refuser" onClick={handleSupprimer}>
                                    Supprimer définitivement
                                </button>
                            </div>
                        )}

                    {/* === BILAN (pension et pet sitting validés uniquement) === */}
                    {resa.statut === "Validée" && !isEducation && (
                        <div className="modal-resa-section">
                            <h4>Bilan</h4>
                            {editBilan ? (
                                <>
                                    <textarea value={bilanLaura} onChange={(e) => setBilanLaura(e.target.value)} placeholder="Bilan du séjour..." />
                                    <div className="btn-row">
                                        <button onClick={handleSaveBilan}>Enregistrer</button>
                                        <button onClick={() => setEditBilan(false)}>Annuler</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p>{bilanLaura || <span className="empty">Aucun bilan pour le moment.</span>}</p>
                                    <button onClick={() => setEditBilan(true)}>{bilanLaura ? "Modifier" : "Ajouter un bilan"}</button>
                                </>
                            )}
                        </div>
                    )}

                    {/* === ÉVÉNEMENTS / COMPTES RENDUS (réservations validées) === */}
                    {resa.statut === "Validée" && (
                        <div className="modal-resa-section">
                            <h4>{isEducation ? "Comptes rendus de séances" : "Carnet de bord"}</h4>

                            {evenements.map((e) => (
                                <div key={e._id} className="evenement-admin">
                                    <div className="evenement-admin__header">
                                        <span>{formatDate(e.date)}</span>
                                        <button className="btn-delete-small" onClick={() => handleDeleteEvenement(e._id)}>✕</button>
                                    </div>
                                    <p>{e.description}</p>
                                    {isEducation && <>
                                        {e.realise && <p><strong>Réalisé :</strong> {e.realise}</p>}
                                        {e.aFaire && <p><strong>À faire :</strong> {e.aFaire}</p>}
                                        {e.aAmeliorer && <p><strong>À améliorer :</strong> {e.aAmeliorer}</p>}
                                    </>}
                                    {e.photo && <img src={e.photo} alt="photo séance" />}
                                </div>
                            ))}

                            {evenements.length === 0 && <p className="empty">Aucune entrée pour le moment.</p>}

                            {showFormEvenement ? (
                                <div className="evenement-form">
                                    <label>Date</label>
                                    <input type="date" value={newEvenement.date} onChange={(e) => setNewEvenement({ ...newEvenement, date: e.target.value })} />
                                    <label>Description</label>
                                    <textarea value={newEvenement.description} onChange={(e) => setNewEvenement({ ...newEvenement, description: e.target.value })} placeholder="Ce qui s'est passé..." />
                                    <label>Photo (URL)</label>
                                    <input value={newEvenement.photo} onChange={(e) => setNewEvenement({ ...newEvenement, photo: e.target.value })} placeholder="URL photo" />
                                    {isEducation && <>
                                        <label>Réalisé</label>
                                        <textarea value={newEvenement.realise} onChange={(e) => setNewEvenement({ ...newEvenement, realise: e.target.value })} />
                                        <label>À faire</label>
                                        <textarea value={newEvenement.aFaire} onChange={(e) => setNewEvenement({ ...newEvenement, aFaire: e.target.value })} />
                                        <label>À améliorer</label>
                                        <textarea value={newEvenement.aAmeliorer} onChange={(e) => setNewEvenement({ ...newEvenement, aAmeliorer: e.target.value })} />
                                    </>}
                                    <div className="btn-row">
                                        <button onClick={handleAddEvenement}>Ajouter</button>
                                        <button onClick={() => setShowFormEvenement(false)}>Annuler</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowFormEvenement(true)}>
                                    {isEducation ? "+ Ajouter un compte rendu" : "+ Ajouter une entrée"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modale user par dessus */}
            {userSelectionne && (
                <AdminUserModal
                    user={userSelectionne}
                    onClose={() => setUserSelectionne(null)}
                />
            )}

            {/* Modale chien par dessus */}
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

export default AdminResaModal;