import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';

const AdminResaCard = ({ resa }) => {
    const [statut, setStatut] = useState(resa.statut);
    const [showRefus, setShowRefus] = useState(false);
    const [motifRefus, setMotifRefus] = useState("");
    const [bilanLaura, setBilanLaura] = useState(resa.bilanLaura || "");
    const [editBilan, setEditBilan] = useState(false);
    const [evenements, setEvenements] = useState(resa.evenements || []);
    const [showFormEvenement, setShowFormEvenement] = useState(false);
    const [newEvenement, setNewEvenement] = useState({
        date: "", description: "", photo: "",
        realise: "", aFaire: "", aAmeliorer: "",
    });
    const API_URL = import.meta.env.VITE_API_URL;

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
    }[statut] || "en-attente";

    const handleValider = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}/api/reservations/${resa._id}`, {
                method: "PUT",
                body: JSON.stringify({ statut: "Validée" }),
            });
            if (!response) return;
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            setStatut("Validée");
        } catch (err) {
            console.error(err);
        }
    };

    const handleRefuser = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}/api/reservations/${resa._id}`, {
                method: "PUT",
                body: JSON.stringify({ statut: "Refusée", motifRefus }),
            });
            if (!response) return;
            if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
            setStatut("Refusée");
            setShowRefus(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBilan = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/bilan`, {
            method: "PUT",
            body: JSON.stringify({ bilanLaura }),
        });
        if (!res) return;
        setEditBilan(false);
    };

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

    const handleDeleteEvenement = async (evenementId) => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/reservations/${resa._id}/evenements/${evenementId}`, {
            method: "DELETE",
        });
        if (!res) return;
        const updated = await res.json();
        setEvenements(updated.evenements);
    };

    const isPensionOrPetSitting = resa.type === "pension" || resa.type === "pet sitting";
    const isEducation = resa.type === "education";

    return (
        <div className="resa-card">
            <div className="resa-card__header">
                <span className="resa-card__type">{resa.type}</span>
                <span className={`resa-card__statut ${statutClass}`}>{statut}</span>
            </div>
            <div className="resa-card__body">
                <p className="resa-card__dates"><strong>Propriétaire :</strong> {resa.owner?.pseudo || resa.owner}</p>
                <div className="resa-card__chiens">
                    {resa.dog?.map((chien, i) => (
                        <div key={i} className="resa-card__chien">
                            <img src={chien.photo || defaultDog} alt={chien.nom} />
                            <span>{chien.nom}</span>
                        </div>
                    ))}
                </div>
                <p className="resa-card__dates">
                    Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                    {resa.dateFin && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                </p>
                {resa.notes && <p className="resa-card__note">{resa.notes}</p>}
            </div>

            {/* Actions validation */}
            {statut === "En attente" && (
                <div className="resa-card__actions">
                    <button onClick={handleValider}>Valider</button>
                    <button onClick={() => setShowRefus(true)}>Refuser</button>
                </div>
            )}

            {/* Motif de refus */}
            {showRefus && (
                <div className="resa-card__refus">
                    <label>Motif du refus</label>
                    <textarea
                        value={motifRefus}
                        onChange={(e) => setMotifRefus(e.target.value)}
                        placeholder="Expliquez la raison du refus..."
                    />
                    <div className="btn-row">
                        <button onClick={handleRefuser}>Confirmer le refus</button>
                        <button onClick={() => setShowRefus(false)}>Annuler</button>
                    </div>
                </div>
            )}

            {/* Bilan Laura */}
            {statut === "Validée" && (
                <div className="resa-card__bilan">
                    <h5>Bilan</h5>
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
                            <p>{bilanLaura || <span className="empty">Aucun bilan</span>}</p>
                            <button onClick={() => setEditBilan(true)}>{bilanLaura ? "Modifier" : "Ajouter un bilan"}</button>
                        </>
                    )}
                </div>
            )}

            {/* Événements / Carnet de bord */}
            {(isPensionOrPetSitting || isEducation) && statut === "Validée" && (
                <div className="resa-card__evenements">
                    <h5>{isEducation ? "Comptes rendus de séances" : "Carnet de bord"}</h5>
                    {evenements.map((e) => (
                        <div key={e._id} className="evenement-admin">
                            <div className="evenement-admin__header">
                                <span>{new Date(e.date).toLocaleDateString('fr-FR')}</span>
                                <button className="btn-delete-small" onClick={() => handleDeleteEvenement(e._id)}>✕</button>
                            </div>
                            <p>{e.description}</p>
                            {isEducation && <>
                                {e.realise && <p><strong>Réalisé :</strong> {e.realise}</p>}
                                {e.aFaire && <p><strong>À faire :</strong> {e.aFaire}</p>}
                                {e.aAmeliorer && <p><strong>À améliorer :</strong> {e.aAmeliorer}</p>}
                            </>}
                            {e.photo && <img src={e.photo} alt="photo" />}
                        </div>
                    ))}

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
    );
};

export default AdminResaCard;