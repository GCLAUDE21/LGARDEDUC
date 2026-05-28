import React, { useState } from 'react';

const ResaCard = ({resa}) => {

    const [noteVisu, setNoteVisu] = useState(false);
    const [notes, setNotes] = useState(resa.notes);
    const API_URL = import.meta.env.VITE_API_URL;
    const tokenUser = localStorage.getItem("token");

    const handleNoteEdit = () => {
        if (noteVisu) {
            const fetchNote = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/reservations/${resa._id}`, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${tokenUser}`,
                        },
                        method: "PUT",
                        body: JSON.stringify({"notes": notes}),
                    });
                    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                    await response.json();
                    window.location.reload();
                } catch (err) {
                    console.error("Erreur lors de l'ajout de la note", err);
                }
            };
            fetchNote();
            setNoteVisu(false);
        } else {
            setNoteVisu(true);
        }
    };

    return (
        <div className="resa-card">
            <div className="resa-card__header">
                <span className="resa-card__type">{resa.type}</span>
                <span className="resa-card__statut">{resa.statut}</span>
            </div>
            <div className="resa-card__body">
                <div className="resa-card__chiens">
                    {resa.dog?.map((chien, i) => (
                        <div key={i} className="resa-card__chien">
                            <img src={chien.photo ? chien.photo : "https://imgs.search.brave.com/gbDWhEpbP3Vpm0zsPo7jlP-qMWr0XKniT-kYOrI9lVU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTIv/NjU3LzQxNy9zbWFs/bC9zdHlsaXNoLWJs/YWNrLWFuZC13aGl0/ZS1kb2ctaWxsdXN0/cmF0aW9uLXBuZy5w/bmc" } alt="PHOTO" />
                            <span>{chien.nom}</span>
                        </div>
                    ))}
                </div>
                <p className="resa-card__dates">
                    Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                    {resa.dateFin && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                </p>
                {resa.notes && !noteVisu && (
                    <p className="resa-card__note">{resa.notes}</p>
                )}
                {noteVisu && (
                    <textarea
                        className="resa-card__textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajouter une note..."
                    />
                )}
            </div>
            <div className="resa-card__actions">
                <button onClick={handleNoteEdit}>
                    {noteVisu ? 'Sauvegarder' : 'Ajouter / Modifier une note'}
                </button>
            </div>
        </div>
    );
};

export default ResaCard;