import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import DogModal from './DogModal';
import AdminUserModal from './AdminUserModal';

const AdminResaModal = ({ resa, onClose, onUpdate, onDelete }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [showRefus, setShowRefus] = useState(false);
    const [motifRefus, setMotifRefus] = useState(resa.motifRefus || "");
    const [showContreProposition, setShowContreProposition] = useState(false);
    const [contreProposition, setContreProposition] = useState({
        dateDebut: resa.contreProposition?.dateDebut?.slice(0, 10) || "",
        dateFin: resa.contreProposition?.dateFin?.slice(0, 10) || "",
        message: resa.contreProposition?.message || "",
        heuresPassages: resa.contreProposition?.heuresPassages || resa.heuresPassages || [],
    });
    const [showAnnulation, setShowAnnulation] = useState(false);
    const [userSelectionne, setUserSelectionne] = useState(null);
    const [dogSelectionne, setDogSelectionne] = useState(null);
    const [bilanLaura, setBilanLaura] = useState(resa.bilanLaura || "");
    const [editBilan, setEditBilan] = useState(false);
    const [evenements, setEvenements] = useState(resa.evenements || []);
    const [showFormEvenement, setShowFormEvenement] = useState(false);
    const [newEvenement, setNewEvenement] = useState({
        date: "", heure: "", description: "", photo: "",
        realise: "", aFaire: "", aAmeliorer: "",
    });

    // --- États loading ---
    const [loadingProprietaire, setLoadingProprietaire] = useState(false);
    const [loadingChienId, setLoadingChienId] = useState(null);
    const [loadingValider, setLoadingValider] = useState(false);
    const [loadingRefuser, setLoadingRefuser] = useState(false);
    const [loadingContreProposition, setLoadingContreProposition] = useState(false);
    const [loadingAnnuler, setLoadingAnnuler] = useState(false);
    const [loadingBilan, setLoadingBilan] = useState(false);
    const [loadingAddEvenement, setLoadingAddEvenement] = useState(false);
    const [loadingDeleteEvenementId, setLoadingDeleteEvenementId] = useState(null);
    const [loadingSupprimer, setLoadingSupprimer] = useState(false);
    const [loadingValiderEssai, setLoadingValiderEssai] = useState(false);
    const [essaiValide, setEssaiValide] = useState(false);  

    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');
    const isEducation = resa.type === "education" || resa.type === "journée d'essai";

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Contre-proposition": "contre-proposition",
    }[resa.statut] || "en-attente";

    const handleClickProprietaire = async () => {
        if (loadingProprietaire) return;
        setLoadingProprietaire(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/users`);
        setLoadingProprietaire(false);
        if (!res) return;
        const users = await res.json();
        const userComplet = users.find(u => u._id === resa.owner._id);
        if (userComplet) setUserSelectionne(userComplet);
    };

    const handleClickChien = async (chien) => {
        if (loadingChienId) return;
        setLoadingChienId(chien._id);
        const res = await fetchWithAuth(`${API_URL}/api/dogs/${chien._id}`);
        setLoadingChienId(null);
        if (!res) return;
        const data = await res.json();
        setDogSelectionne(data);
    };

    const handleValider = async () => {
        if (loadingValider) return;
        setLoadingValider(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/valider`, { method: "PUT" });
        setLoadingValider(false);
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
    };

    const handleValiderJourneeEssai = async () => {
        if (loadingValiderEssai || essaiValide) return;
        setLoadingValiderEssai(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/valider-journee-essai`, {
            method: "PUT",
        });
        setLoadingValiderEssai(false);
        if (!res) return;
        setEssaiValide(true);
    };

    const handleRefuser = async () => {
        if (!motifRefus || loadingRefuser) return;
        setLoadingRefuser(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/refuser`, {
            method: "PUT",
            body: JSON.stringify({ motifRefus }),
        });
        setLoadingRefuser(false);
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowRefus(false);
    };

    const handleContreProposition = async () => {
        if (!contreProposition.dateDebut || loadingContreProposition) return;
        setLoadingContreProposition(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/contre-proposition`, {
            method: "PUT",
            body: JSON.stringify(contreProposition),
        });
        setLoadingContreProposition(false);
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowContreProposition(false);
    };

    const handleAnnuler = async () => {
        if (!motifRefus || loadingAnnuler) return;
        setLoadingAnnuler(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/annuler`, {
            method: "PUT",
            body: JSON.stringify({ motifRefus }),
        });
        setLoadingAnnuler(false);
        if (!res) return;
        const data = await res.json();
        onUpdate(data);
        setShowAnnulation(false);
    };

    const handleSaveBilan = async () => {
        if (loadingBilan) return;
        setLoadingBilan(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/bilan`, {
            method: "PUT",
            body: JSON.stringify({ bilanLaura }),
        });
        setLoadingBilan(false);
        if (!res) return;
        setEditBilan(false);
    };

    const handleAddEvenement = async () => {
        if (!newEvenement.date || !newEvenement.description || loadingAddEvenement) return;
        setLoadingAddEvenement(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/evenements`, {
            method: "POST",
            body: JSON.stringify(newEvenement),
        });
        setLoadingAddEvenement(false);
        if (!res) return;
        const updated = await res.json();
        setEvenements(updated.evenements);
        setNewEvenement({ date: "", heure: "", description: "", photo: "", realise: "", aFaire: "", aAmeliorer: "" });
        setShowFormEvenement(false);
    };

    const handleDeleteEvenement = async (evenementId) => {
        if (loadingDeleteEvenementId) return;
        setLoadingDeleteEvenementId(evenementId);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/evenements/${evenementId}`, {
            method: "DELETE",
        });
        setLoadingDeleteEvenementId(null);
        if (!res) return;
        const updated = await res.json();
        setEvenements(updated.evenements);
    };

    const handleSupprimer = async () => {
        if (!window.confirm("Supprimer définitivement cette réservation ?")) return;
        if (loadingSupprimer) return;
        setLoadingSupprimer(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}`, {
            method: "DELETE",
        });
        setLoadingSupprimer(false);
        if (!res) return;
        onDelete(resa._id);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                    <button className="modal-close" onClick={onClose}>×</button>

                    <div className="modal-resa-header">
                        <h2>{resa.type}</h2>
                        <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                    </div>

                    {/* Propriétaire cliquable */}
                    <div className="modal-resa-section">
                        <h4>Propriétaire</h4>
                        <p
                            className="clickable-link"
                            onClick={handleClickProprietaire}
                            style={{ opacity: loadingProprietaire ? 0.5 : 1 }}
                        >
                            {loadingProprietaire ? "Chargement..." : resa.owner?.pseudo}
                        </p>
                        <p>{resa.owner?.email}</p>
                    </div>

                    {/* Chiens cliquables */}
                    {resa.dog?.length > 0 && (
                        <div className="modal-resa-section">
                            <h4>Chien(s)</h4>
                            <div className="resa-card__chiens">
                                {resa.dog.map((chien, i) => (
                                    <div
                                        key={i}
                                        className={`resa-card__chien clickable ${loadingChienId === chien._id ? "loading" : ""}`}
                                        onClick={() => handleClickChien(chien)}
                                        style={{ opacity: loadingChienId && loadingChienId !== chien._id ? 0.5 : 1 }}
                                    >
                                        <img src={chien.photo || defaultDog} alt={chien.nom} />
                                        <span>{loadingChienId === chien._id ? "🐾" : chien.nom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                        <div className="modal-resa-section">
                            <h4>Dates demandées</h4>
                            <p>Du {formatDate(resa.dateDebut)}{resa.dateFin && !isEducation && ` au ${formatDate(resa.dateFin)}`}</p>
                            {resa.type === "pet sitting" && resa.passagesParJour && (
                                <p>{resa.passagesParJour} passage{resa.passagesParJour > 1 ? 's' : ''} par jour</p>
                            )}
                            {resa.type === "pet sitting" && resa.heuresPassages?.length > 0 && (
                                <div>
                                    <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '0.4rem' }}>Heures souhaitées :</p>
                                    {resa.heuresPassages.map((h, i) => (
                                        <span key={i} style={{ marginRight: '0.5rem', color: 'var(--color-gold)' }}>🕐 {h}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                    {/* Contre-proposition en cours */}
                    {resa.statut === "Contre-proposition" && resa.contreProposition && (
                        <div className="modal-resa-section modal-resa-section--highlight">
                            <h4>Contre-proposition envoyée</h4>
                            <p>Du {formatDate(resa.contreProposition.dateDebut)}
                                {resa.contreProposition.dateFin && ` au ${formatDate(resa.contreProposition.dateFin)}`}
                            </p>
                            {resa.contreProposition.heuresPassages?.length > 0 && (
                                <div>
                                    <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Heures proposées :</p>
                                    {resa.contreProposition.heuresPassages.map((h, i) => (
                                        <span key={i} style={{ marginRight: '0.5rem', color: 'var(--color-gold)' }}>🕐 {h}</span>
                                    ))}
                                </div>
                            )}
                            {resa.contreProposition.message && <p>{resa.contreProposition.message}</p>}
                        </div>
                    )}

                    {resa.notes && (
                        <div className="modal-resa-section">
                            <h4>Notes de l'utilisateur</h4>
                            <p>{resa.notes}</p>
                        </div>
                    )}

                    {(resa.statut === "Refusée" || resa.statut === "Annulée") && resa.motifRefus && (
                        <div className="modal-resa-section modal-resa-section--danger">
                            <h4>{resa.statut === "Annulée" ? "Motif de l'annulation" : "Motif du refus"}</h4>
                            <p>{resa.motifRefus}</p>
                        </div>
                    )}

                    {/* Actions : En attente / Contre-proposition */}
                    {(resa.statut === "En attente" || resa.statut === "Contre-proposition") && (
                        <div className="modal-resa-section">
                            <h4>Actions</h4>
                            <div className="resa-card__actions">
                                <button className="btn-valider" onClick={handleValider} disabled={loadingValider}>
                                    {loadingValider ? "..." : "Valider"}
                                </button>
                                <button className="btn-refuser" onClick={() => { setShowRefus(true); setShowContreProposition(false); setShowAnnulation(false); }}>
                                    Refuser
                                </button>
                                <button className="btn-contre-prop" onClick={() => { setShowContreProposition(true); setShowRefus(false); setShowAnnulation(false); }}>
                                    Contre-proposition
                                </button>
                            </div>

                            {showRefus && (
                                <div className="resa-card__refus">
                                    <label>Motif du refus</label>
                                    <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder="Expliquez la raison du refus..." />
                                    <div className="btn-row">
                                        <button onClick={handleRefuser} disabled={loadingRefuser}>
                                            {loadingRefuser ? "..." : "Confirmer le refus"}
                                        </button>
                                        <button onClick={() => setShowRefus(false)} disabled={loadingRefuser}>Annuler</button>
                                    </div>
                                </div>
                            )}

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
                                        {resa.type === "pet sitting" && resa.passagesParJour && (
                                            <>
                                                <label>Heures de passage</label>
                                                {Array.from({ length: resa.passagesParJour }).map((_, i) => (
                                                    <div key={i}>
                                                        <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Passage {i + 1}</label>
                                                        <input
                                                            type="time"
                                                            value={contreProposition.heuresPassages[i] || ""}
                                                            onChange={(e) => {
                                                                const maj = [...(contreProposition.heuresPassages || [])];
                                                                maj[i] = e.target.value;
                                                                setContreProposition({ ...contreProposition, heuresPassages: maj });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    <div className="btn-row">
                                        <button onClick={handleContreProposition} disabled={loadingContreProposition}>
                                            {loadingContreProposition ? "..." : "Envoyer"}
                                        </button>
                                        <button onClick={() => setShowContreProposition(false)} disabled={loadingContreProposition}>Annuler</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions : Validée */}
                    {resa.statut === "Validée" && (
                        <div className="modal-resa-section">
                            <h4>Actions</h4>
                            <div className="resa-card__actions">
                                <button className="btn-contre-prop" onClick={() => { setShowContreProposition(true); setShowAnnulation(false); }}>
                                    Modifier les dates
                                </button>
                                {resa.type === "journée d'essai" && (
                                    <button
                                        className="btn-valider"
                                        onClick={handleValiderJourneeEssai}
                                        disabled={loadingValiderEssai || essaiValide}
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        {essaiValide ? "Pension débloquée ✓" : loadingValiderEssai ? "..." : "Valider la journée d'essai"}
                                    </button>
                                )}
                                <button className="btn-refuser" onClick={() => { setShowAnnulation(true); setShowContreProposition(false); }}>
                                    Annuler la réservation
                                </button>
                            </div>

                            {showContreProposition && (
                                <div className="resa-card__refus">
                                    <label>Nouvelle date de début</label>
                                    <input type="date" value={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateDebut: e.target.value })} />
                                    {!isEducation && <>
                                        <label>Nouvelle date de fin</label>
                                        <input type="date" value={contreProposition.dateFin} min={contreProposition.dateDebut} onChange={(e) => setContreProposition({ ...contreProposition, dateFin: e.target.value })} />
                                    </>}
                                    {resa.type === "pet sitting" && resa.passagesParJour && (
                                        <>
                                            <label>Heures de passage</label>
                                            {Array.from({ length: resa.passagesParJour }).map((_, i) => (
                                                <div key={i}>
                                                    <label style={{ fontSize: '0.75rem', opacity: 0.7 }}>Passage {i + 1}</label>
                                                    <input
                                                        type="time"
                                                        value={contreProposition.heuresPassages[i] || ""}
                                                        onChange={(e) => {
                                                            const maj = [...(contreProposition.heuresPassages || [])];
                                                            maj[i] = e.target.value;
                                                            setContreProposition({ ...contreProposition, heuresPassages: maj });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <label>Message</label>
                                    <textarea value={contreProposition.message} onChange={(e) => setContreProposition({ ...contreProposition, message: e.target.value })} placeholder="Expliquez la modification..." />
                                    <div className="btn-row">
                                        <button onClick={handleContreProposition} disabled={loadingContreProposition}>
                                            {loadingContreProposition ? "..." : "Envoyer"}
                                        </button>
                                        <button onClick={() => setShowContreProposition(false)} disabled={loadingContreProposition}>Annuler</button>
                                    </div>
                                </div>
                            )}

                            {showAnnulation && (
                                <div className="resa-card__refus">
                                    <label>Motif de l'annulation</label>
                                    <textarea value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} placeholder="Expliquez la raison de l'annulation..." />
                                    <div className="btn-row">
                                        <button onClick={handleAnnuler} disabled={loadingAnnuler}>
                                            {loadingAnnuler ? "..." : "Confirmer l'annulation"}
                                        </button>
                                        <button onClick={() => setShowAnnulation(false)} disabled={loadingAnnuler}>Annuler</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Suppression définitive */}
                    {(resa.statut === "Refusée" || resa.statut === "Annulée") && (
                        <div className="modal-resa-section">
                            <h4>Zone de danger</h4>
                            <button className="btn-refuser" onClick={handleSupprimer} disabled={loadingSupprimer}>
                                {loadingSupprimer ? "Suppression..." : "Supprimer définitivement"}
                            </button>
                        </div>
                    )}

                    {/* Bilan */}
                    {resa.statut === "Validée" && !isEducation && (
                        <div className="modal-resa-section">
                            <h4>Bilan</h4>
                            {editBilan ? (
                                <>
                                    <textarea value={bilanLaura} onChange={(e) => setBilanLaura(e.target.value)} placeholder="Bilan du séjour..." />
                                    <div className="btn-row">
                                        <button onClick={handleSaveBilan} disabled={loadingBilan}>
                                            {loadingBilan ? "..." : "Enregistrer"}
                                        </button>
                                        <button onClick={() => setEditBilan(false)} disabled={loadingBilan}>Annuler</button>
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

                    {/* Événements / comptes rendus */}
                    {resa.statut === "Validée" && (
                        <div className="modal-resa-section">
                            <h4>{isEducation ? "Comptes rendus de séances" : "Carnet de bord"}</h4>

                            {evenements.map((e) => (
                                <div key={e._id} className="evenement-admin">
                                    <div className="evenement-admin__header">
                                        <span>{formatDate(e.date)}{e.heure && ` - ${e.heure}`}</span>
                                        <button
                                            className="btn-delete-small"
                                            onClick={() => handleDeleteEvenement(e._id)}
                                            disabled={loadingDeleteEvenementId === e._id}
                                        >
                                            {loadingDeleteEvenementId === e._id ? "..." : "✕"}
                                        </button>
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

                                    {resa.type === "pet sitting" && <>
                                        <label>Heure</label>
                                        <input type="time" value={newEvenement.heure || ""} onChange={(e) => setNewEvenement({ ...newEvenement, heure: e.target.value })} />
                                    </>}

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
                                        <button onClick={handleAddEvenement} disabled={loadingAddEvenement}>
                                            {loadingAddEvenement ? "..." : "Ajouter"}
                                        </button>
                                        <button onClick={() => setShowFormEvenement(false)} disabled={loadingAddEvenement}>Annuler</button>
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

            {userSelectionne && (
                <AdminUserModal
                    user={userSelectionne}
                    onClose={() => setUserSelectionne(null)}
                />
            )}

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