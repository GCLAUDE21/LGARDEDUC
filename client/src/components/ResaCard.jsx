import React, { useState } from 'react';

const ResaCard = ({resa}) => {

    const [noteVisu, setNoteVisu] = useState(false);
    const [notes, setNotes] = useState(resa.notes);
    const API_URL = import.meta.env.VITE_API_URL;
    const tokenUser = localStorage.getItem("token");


    const handleNoteEdit = (e) => {
        if (noteVisu) {

            

            const fetchNote = async () => {
                try {
            const response = await fetch (`${API_URL}/api/reservations/${resa._id}`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,},
                    method: "PUT",
                    body: JSON.stringify({"notes": notes}),
                    
                });
                if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            window.location.reload()
                } catch (err) {
                console.error("Erreur lors de l'ajout de la note", err)
            } 
            };
            fetchNote();
            setNotes(notes);
            setNoteVisu(false);
        
        } else {

            setNoteVisu(true);
        }
    }


    return (
        <div className="resas">
            <div className="chien">
                <h4>{resa.dog.map(d => d.nom).join(' & ')}</h4>
                <img src={resa.dog[0].photo} alt={resa.dog[0].nom} />
            </div>
            <div className="infos">
                <h3>{resa.type}</h3>
            <span>Du {new Date(resa.dateDebut).toLocaleDateString("fr-FR")} au {new Date(resa.dateFin).toLocaleDateString("fr-FR")}</span>
            <span>{resa.statut}</span>
            {(noteVisu || notes) && <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter une note..."/>}
            {noteVisu ? <button onClick={() => handleNoteEdit()} type='button'>Enregistrer la note</button> : <button onClick={() => handleNoteEdit()} type='button'>Ajouter/Modifier une note</button> }
            </div>
            


        </div>
    );
};

export default ResaCard;