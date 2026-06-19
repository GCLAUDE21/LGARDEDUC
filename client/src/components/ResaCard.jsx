import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import ResaModal from './ResaModal';

const ResaCard = ({ resa }) => {
    const [showModal, setShowModal] = useState(false);

    const statutClass = {
        "En attente": "en-attente",
        "Validée": "validee",
        "Refusée": "refusee",
        "Annulée": "annulee",
    }[resa.statut] || "en-attente";

    return (
        <>
            <div className="resa-card" onClick={() => setShowModal(true)}>
                <div className="resa-card__header">
                    <span className="resa-card__type">{resa.type}</span>
                    <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                </div>
                <div className="resa-card__body">
                    <p className="resa-card__dates">
                        Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                        {resa.dateFin && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                    </p>
                    <div className="resa-card__chiens">
                        {resa.dog?.map((chien, i) => (
                            <div key={i} className="resa-card__chien">
                                <img src={chien.photo || defaultDog} alt={chien.nom} />
                                <span>{chien.nom}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {showModal && (
                <ResaModal
                    resa={resa}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default ResaCard;