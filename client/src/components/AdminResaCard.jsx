import React from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

// Card résumé cliquable — toute la logique est dans AdminResaModal
const AdminResaCard = ({ resa, onClick }) => {

    // Correspondance statut -> classe CSS
    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Contre-proposition": "contre-proposition",
    }[resa.statut] || "en-attente";

    // Formatage date lisible
    const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

    return (
        <div className="resa-card" onClick={onClick}>

            {/* En-tête : type + statut */}
            <div className="resa-card__header">
                <span className="resa-card__type">{resa.type}</span>
                <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
            </div>

            <div className="resa-card__body">

                {/* Propriétaire */}
                <p className="resa-card__dates">
                    <strong>Propriétaire :</strong> {resa.owner?.pseudo || resa.owner}
                </p>

                {/* Chiens concernés */}
                <div className="resa-card__chiens">
                    {resa.dog?.map((chien, i) => (
                        <div key={i} className="resa-card__chien">
                            <img src={chien.photo || defaultDog} alt={chien.nom} />
                            <span>{chien.nom}</span>
                        </div>
                    ))}
                </div>

                {/* Dates */}
                <p className="resa-card__dates">
                    Du {formatDate(resa.dateDebut)}
                    {resa.dateFin && ` au ${formatDate(resa.dateFin)}`}
                </p>

                {/* Indication contre-proposition en cours */}
                {resa.statut === "Contre-proposition" && resa.contreProposition && (
                    <p className="resa-card__contre-prop-hint">
                        Proposition : du {formatDate(resa.contreProposition.dateDebut)}
                        {resa.contreProposition.dateFin && ` au ${formatDate(resa.contreProposition.dateFin)}`}
                    </p>
                )}

            </div>
        </div>
    );
};

export default AdminResaCard;