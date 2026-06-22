import React, { useEffect, useState } from 'react';

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS_DESKTOP = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_MOBILE = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const DispoCalendar = ({ type }) => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [blocages, setBlocages] = useState([]);
    const [resasValidees, setResasValidees] = useState([]);
    const [capaciteMax, setCapaciteMax] = useState(4);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const [moisActif, setMoisActif] = useState(today.getMonth());
    const [anneeActive, setAnneeActive] = useState(today.getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/availability`);
                const data = await res.json();
                setBlocages(data.blocages);
                setResasValidees(data.resasValidees);
                setCapaciteMax(data.capaciteMaxPension);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getInfosJour = (date) => {
        const d = new Date(date);
        d.setHours(12, 0, 0, 0);

        const blocagesJour = blocages.filter(b => {
            const debut = new Date(b.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(b.dateFin); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });

        const blocageTous = blocagesJour.find(b => b.type === 'tous');

        // Pension
        const resasPension = resasValidees.filter(r => {
            if (r.type !== 'pension') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(r.dateFin || r.dateDebut); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });
        const blocagePension = blocagesJour.find(b => b.type === 'pension');
        const placesOccupees = resasPension.length + (blocagePension ? capaciteMax : 0);
        const placesDispo = Math.max(0, capaciteMax - placesOccupees);

        // Laura : éduc + pet sitting fusionnés
        const resasLaura = resasValidees.filter(r => {
            if (r.type !== 'education' && r.type !== 'pet sitting') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            return d.toDateString() === debut.toDateString();
        });
        const blocagesLaura = blocagesJour.filter(b =>
            b.type === 'education' || b.type === 'pet sitting'
        );
        const slotMatinOccupe =
            resasLaura.some(r => r.slot === 'matin') ||
            blocagesLaura.some(b => b.slot === 'matin' || !b.slot);
        const slotAmOccupe =
            resasLaura.some(r => r.slot === 'apres-midi') ||
            blocagesLaura.some(b => b.slot === 'apres-midi' || !b.slot);

        return { blocageTous, placesDispo, slotMatinOccupe, slotAmOccupe };
    };

    const genererJoursMois = (mois, annee) => {
        const premierJour = new Date(annee, mois, 1);
        const dernierJour = new Date(annee, mois + 1, 0);
        const joursVides = (premierJour.getDay() + 6) % 7;
        const jours = [];
        for (let i = 0; i < joursVides; i++) jours.push(null);
        for (let i = 1; i <= dernierJour.getDate(); i++) jours.push(new Date(annee, mois, i));
        return jours;
    };

    const jours = genererJoursMois(moisActif, anneeActive);

    const naviguerMois = (direction) => {
        let m = moisActif + direction;
        let a = anneeActive;
        if (m > 11) { m = 0; a++; }
        if (m < 0) { m = 11; a--; }
        setMoisActif(m);
        setAnneeActive(a);
    };

    if (loading) return <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Chargement des disponibilités...</p>;

    return (
        <div className="dispo-calendar">
            <h4>Disponibilités</h4>

            <div className="dispo-calendar__nav">
                <button type="button" onClick={() => naviguerMois(-1)}>‹</button>
                <span>{MOIS[moisActif]} {anneeActive}</span>
                <button type="button" onClick={() => naviguerMois(1)}>›</button>
            </div>

            {/* Légende */}
            <div className="dispo-calendar__legend">
                {type === 'pension' && <>
                    <span><span className="dispo-dot" style={{ background: '#c9922a' }} />Places dispo</span>
                    <span><span className="dispo-dot" style={{ background: '#c0392b' }} />Complet</span>
                </>}
                {(type === 'education' || type === 'pet sitting') && <>
                    <span><span className="dispo-dot" style={{ background: '#5b8a6e' }} />Dispo</span>
                    <span><span className="dispo-dot" style={{ background: '#c0392b' }} />Indisponible</span>
                </>}
            </div>

            <div className="dispo-calendar__grid">
                {JOURS_DESKTOP.map((j, i) => (
                    <div key={j + i} className="dispo-header-cell">
                        <span className="dispo-jour-desktop">{j}</span>
                        <span className="dispo-jour-mobile">{JOURS_MOBILE[i]}</span>
                    </div>
                ))}

                {jours.map((jour, i) => {
                    if (!jour) return <div key={`empty-${i}`} className="dispo-cell empty" />;

                    const { blocageTous, placesDispo, slotMatinOccupe, slotAmOccupe } = getInfosJour(jour);
                    const estPasse = jour < today && jour.toDateString() !== today.toDateString();
                    const estAujourdhui = jour.toDateString() === today.toDateString();

                    // Couleur de fond selon dispo
                    let bgColor = 'transparent';
                    if (blocageTous) bgColor = 'rgba(192,57,43,0.15)';
                    else if (type === 'pension' && placesDispo === 0) bgColor = 'rgba(192,57,43,0.15)';
                    else if ((type === 'education' || type === 'pet sitting') && slotMatinOccupe && slotAmOccupe) bgColor = 'rgba(192,57,43,0.15)';

                    return (
                        <div
                            key={jour.toISOString()}
                            className={`dispo-cell ${estPasse ? 'past' : ''} ${estAujourdhui ? 'today' : ''}`}
                            style={{ background: bgColor }}
                        >
                            <span className="dispo-day-number">{jour.getDate()}</span>

                            {!estPasse && !blocageTous && (
                                <>
                                    {type === 'pension' && (
                                        <span
                                            className="dispo-tag"
                                            style={{ color: placesDispo === 0 ? '#e07070' : '#c9922a' }}
                                        >
                                            {placesDispo === 0 ? 'Complet' : `${placesDispo}/${capaciteMax}`}
                                        </span>
                                    )}

                                    {(type === 'education' || type === 'pet sitting') && (
                                        <span className="dispo-slots">
                                            <span style={{ background: slotMatinOccupe ? '#c0392b' : '#5b8a6e' }}>M</span>
                                            <span style={{ background: slotAmOccupe ? '#c0392b' : '#5b8a6e' }}>AM</span>
                                        </span>
                                    )}
                                </>
                            )}

                            {!estPasse && blocageTous && (
                                <span className="dispo-tag" style={{ color: '#e07070' }}>Fermé</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DispoCalendar;