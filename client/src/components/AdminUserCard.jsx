import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

const AdminUserCard = ({user}) => {
    const aujourd_hui = new Date();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const [note, setNote] = useState(user.notes || "");

    const passees = (user.reservations || []).filter(r => aujourd_hui > new Date(r.dateFin));
    const enCours = (user.reservations || []).filter(r => aujourd_hui > new Date(r.dateDebut) && aujourd_hui < new Date(r.dateFin));
    const aVenir = (user.reservations || []).filter(r => aujourd_hui < new Date(r.dateDebut));

    const handleSaveNote = () => {
        fetch(`${API_URL}/api/admin/users/${user._id}/notes`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ notes: note }),
        }).then(() => alert("Note sauvegardée"));
    };

    return (
        <div className="admin-user-card">
            <section>
                <h3>Infos Persos</h3>
                <span>{user.prenom} {user.nom}</span>
                <span>{user.pseudo}</span>
                <span>{user.email}</span>
                <span>{user.telephone}</span>
                <span>{user.rue}, {user.codePostal} {user.ville}</span>
                {user.createdAt && !isNaN(new Date(user.createdAt)) &&
                    <span>Inscrit le : {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                }
            </section>
            <section>
                <h3>Réservations</h3>
                <h4>En cours ({enCours.length})</h4>
                {enCours.map((r) => (
                    <div key={r._id} className="resa-item">
                        <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')}</span>
                    </div>
                ))}
                <h4>A Venir ({aVenir.length})</h4>
                {aVenir.map((r) => (
                    <div key={r._id} className="resa-item">
                        <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')}</span>
                    </div>
                ))}
                <h4>Passées ({passees.length})</h4>
                {passees.map((r) => (
                    <div key={r._id} className="resa-item">
                        <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')}</span>
                    </div>
                ))}
            </section>
            <section>
                <h3>Chiens</h3>
                <div className="chiens-grid">
                {user.chiens.map((dog) => (
                    <div key={dog._id} className="chien-item">
                        <img src={dog.photo || defaultDog} alt={dog.nom} />
                        <span>{dog.nom}</span>
                    </div>
                ))}
                </div>
            </section>
            <section>
                <h3>Notes</h3>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes internes sur ce client..." />
                <button type="button" onClick={handleSaveNote}>Enregistrer la note</button>
            </section>
        </div>
    );
};

export default AdminUserCard;