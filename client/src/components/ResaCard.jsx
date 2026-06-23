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
        "Contre-proposition": "contre-proposition",
    }[resa.statut] || "en-attente";

    return (
        <>
            <div className="resa-card" onClick={() => { setShowModal(true); document.body.style.overflow = 'hidden'; }}>
                <div className="resa-card__header">
                    <span className="resa-card__type">{resa.type}</span>
                    <span className={`resa-card__statut ${statutClass}`}>{resa.statut}</span>
                </div>
                <div className="resa-card__body">
                    <p className="resa-card__dates">
                        Du {new Date(resa.dateDebut).toLocaleDateString('fr-FR')}
                        {resa.dateFin && ` au ${new Date(resa.dateFin).toLocaleDateString('fr-FR')}`}
                    </p>
                    {resa.slot && <p className="resa-card__slot">{resa.slot}</p>}
                    {resa.passagesParJour && resa.type === "pet sitting" && (
                        <p className="resa-card__slot">{resa.passagesParJour} passage{resa.passagesParJour > 1 ? 's' : ''} par jour</p>
                    )}
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
                    onClose={() => { setShowModal(false); document.body.style.overflow = ''; }}
                />
            )}
        </>
    );
};

export default ResaCard;