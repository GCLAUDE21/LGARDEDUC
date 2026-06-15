import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

const AdminResaCard = ({ resa }) => {
  const [statut, setStatut] = useState(resa.statut);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const handleStatut = async (newStatut) => {
    try {
      const response = await fetch(`${API_URL}/api/reservations/${resa._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
      setStatut(newStatut);
    } catch (err) {
      console.error("Erreur lors du changement de statut", err);
    }
  };

    const statutClass = {
     "En attente": "en-attente",
     "Validée": "validee",
     "Refusée": "refusee"
      }[statut] || "en-attente";

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
      <img
        src={chien.photo ? chien.photo : defaultDog }
        alt={chien.nom}
      />
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
      <div className="resa-card__actions">
        <button onClick={() => handleStatut("Validée")}>Valider</button>
        <button onClick={() => handleStatut("Refusée")}>Refuser</button>
      </div>
    </div>
  );
};

export default AdminResaCard;