import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import DogModal from './DogModal';
import AdminResaModal from './AdminResaModal';

const AdminUserModal = ({ user, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [note, setNote] = useState(user.notes || "");
    const [noteSaved, setNoteSaved] = useState(false);
    const [dogSelectionne, setDogSelectionne] = useState(null);
    const [resaSelectionnee, setResaSelectionnee] = useState(null);
    const [chiens, setChiens] = useState(user.chiens || []);

    // --- États loading ---
    const [loadingNote, setLoadingNote] = useState(false);

    const today = new Date();

    const resasEnAttente = (user.reservations || []).filter(r => r.statut === "En attente");
    const resasEnCours = (user.reservations || []).filter(r =>
        r.statut === "Validée" &&
        new Date(r.dateDebut) <= today &&
        new Date(r.dateFin || r.dateDebut) >= today
    );
    const resasAVenir = (user.reservations || []).filter(r =>
        r.statut === "Validée" && new Date(r.dateDebut) > today
    );
    const resasPassees = (user.reservations || []).filter(r =>
        r.statut === "Refusée" || r.statut === "Annulée" ||
        (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today)
    );

    const handleSaveNote = async () => {
        if (loadingNote) return;
        setLoadingNote(true);
        const res = await fetchWithAuth(`${API_URL}/api/admin/users/${user._id}/notes`, {
            method: "PUT",
            body: JSON.stringify({ notes: note }),
        });
        setLoadingNote(false);
        if (!res) return;
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
    };

     const handleClickDog = (dog) => {
        setDogSelectionne(dog);
    };

    const handleClickResa = (resa) => {
        setResaSelectionnee(resa);
    };

    const handleUpdateDog = (dogMaj) => {
        setChiens(prev => prev.map(d => d._id === dogMaj._id ? dogMaj : d));
        setDogSelectionne(dogMaj);
    };

    const handleDeleteDog = (dogId) => {
        setChiens(prev => prev.filter(d => d._id !== dogId));
        setDogSelectionne(null);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

    const labelStyle = {
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--color-gold)',
        marginBottom: '0.25rem',
        marginTop: '0.5rem'
    };

    const ResaItem = ({ resa }) => (
        <div className="resa-item clickable" onClick={() => handleClickResa(resa)}>
            <span className="resa-item__type">{resa.type}</span>
            <span className="resa-item__date">
                {formatDate(resa.dateDebut)}
                {resa.dateFin && ` - ${formatDate(resa.dateFin)}`}
            </span>
            <span className={`resa-card__statut ${
                { "En attente": "en-attente", "Validée": "validee", "Refusée": "refusee", "Annulée": "refusee", "Contre-proposition": "contre-proposition" }[resa.statut]
            }`}>
                {resa.statut}
            </span>
        </div>
    );

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close" onClick={onClose}>×</button>

                    <div className="modal-resa-header">
                        <div>
                            <h2>{user.prenom} {user.nom}</h2>
                            <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>@{user.pseudo}</span>
                        </div>
                        {user.createdAt && (
                            <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>
                                Inscrit le {formatDate(user.createdAt)}
                            </span>
                        )}
                    </div>

                    <div className="modal-resa-section">
                        <h4>Contact</h4>
                        <p>{user.email}</p>
                        {user.telephone && <p>{user.telephone}</p>}
                        {user.rue && <p>{user.rue}, {user.codePostal} {user.ville}</p>}
                    </div>

                    {/* Chiens cliquables */}
                    <div className="modal-resa-section">
                        <h4>Chiens ({chiens.length})</h4>
                        {chiens.length === 0
                            ? <p className="empty">Aucun chien enregistré.</p>
                            : (
                                <div className="chiens-grid">
                                    {chiens.map((dog) => (
                                        <div
                                            key={dog._id}
                                            className="chien-item clickable"
                                            onClick={() => handleClickDog(dog)}
                                        >
                                            <img src={dog.photo || defaultDog} alt={dog.nom} />
                                            <span>{dog.nom}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>

                    {/* Réservations */}
                    <div className="modal-resa-section">
                        <h4>Réservations</h4>

                        {resasEnAttente.length > 0 && <>
                            <p style={labelStyle}>En attente</p>
                            {resasEnAttente.map(r => <ResaItem key={r._id} resa={r} />)}
                        </>}

                        {resasEnCours.length > 0 && <>
                            <p style={labelStyle}>En cours</p>
                            {resasEnCours.map(r => <ResaItem key={r._id} resa={r} />)}
                        </>}

                        {resasAVenir.length > 0 && <>
                            <p style={labelStyle}>À venir</p>
                            {resasAVenir.map(r => <ResaItem key={r._id} resa={r} />)}
                        </>}

                        {resasPassees.length > 0 && <>
                            <p style={labelStyle}>Passées / Annulées</p>
                            {resasPassees.map(r => <ResaItem key={r._id} resa={r} />)}
                        </>}

                        {user.reservations?.length === 0 && (
                            <p className="empty">Aucune réservation.</p>
                        )}
                    </div>

                    {/* Notes internes */}
                    <div className="modal-resa-section">
                        <h4>Notes internes</h4>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Notes visibles uniquement par Laura..."
                        />
                        <button onClick={handleSaveNote} disabled={loadingNote}>
                            {noteSaved ? "Enregistré !" : loadingNote ? "..." : "Enregistrer la note"}
                        </button>
                    </div>
                </div>
            </div>

            {dogSelectionne && (
                <DogModal
                    dog={dogSelectionne}
                    onClose={() => setDogSelectionne(null)}
                    onUpdate={handleUpdateDog}
                    onDelete={handleDeleteDog}
                />
            )}

            {resaSelectionnee && (
                <AdminResaModal
                    resa={resaSelectionnee}
                    onClose={() => setResaSelectionnee(null)}
                    onUpdate={(resaMaj) => setResaSelectionnee(resaMaj)}
                />
            )}
        </>
    );
};

export default AdminUserModal;