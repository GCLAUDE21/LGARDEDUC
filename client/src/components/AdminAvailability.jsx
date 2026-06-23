import React, { useEffect, useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import AdminResaModal from './AdminResaModal';

const TYPE_LABELS = {
    pension: '🏠 Pension',
    education: '🎓 Éducation',
    'pet sitting': '🐾 Pet Sitting',
    tous: '🔒 Tous',
};

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS_DESKTOP = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_MOBILE  = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const AdminAvailability = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [blocages, setBlocages] = useState([]);
    const [resasValidees, setResasValidees] = useState([]);
    const [capaciteMax, setCapaciteMax] = useState(4);
    const [capaciteInput, setCapaciteInput] = useState(4);
    const [loading, setLoading] = useState(true);
    const [jourSelectionne, setJourSelectionne] = useState(null);
    const [resaSelectionnee, setResaSelectionnee] = useState(null);

    const today = new Date();
    const [moisActif, setMoisActif] = useState(today.getMonth());
    const [anneeActive, setAnneeActive] = useState(today.getFullYear());

    const [form, setForm] = useState({
        type: 'pension',
        dateDebut: '',
        dateFin: '',
        slot: '',
        motif: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resDispo, resSettings] = await Promise.all([
                    fetch(`${API_URL}/api/availability`),
                    fetchWithAuth(`${API_URL}/api/availability/settings`),
                ]);
                const dispo = await resDispo.json();
                const settings = await resSettings.json();
                setBlocages(dispo.blocages);
                setResasValidees(dispo.resasValidees);
                setCapaciteMax(settings.capaciteMaxPension);
                setCapaciteInput(settings.capaciteMaxPension);
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

        const resasPension = resasValidees.filter(r => {
            if (r.type !== 'pension') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(r.dateFin || r.dateDebut); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });

        const resasPetSitting = resasValidees.filter(r => {
            if (r.type !== 'pet sitting') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(r.dateFin || r.dateDebut); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });

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

        return { blocagesJour, resasPension, resasPetSitting, slotMatinOccupe, slotAmOccupe };
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
        setJourSelectionne(null);
    };

    const handleAjouter = async () => {
        if (!form.dateDebut || !form.dateFin) {
            alert("Merci de renseigner les deux dates");
            return;
        }
        const body = {
            type: form.type,
            dateDebut: form.dateDebut,
            dateFin: form.dateFin,
            motif: form.motif,
            slot: (form.type === 'education' || form.type === 'pet sitting') && form.slot ? form.slot : null,
        };
        const res = await fetchWithAuth(`${API_URL}/api/availability`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (!res) return;
        const nouveau = await res.json();
        setBlocages([...blocages, nouveau]);
        setForm({ type: 'pension', dateDebut: '', dateFin: '', slot: '', motif: '' });
        alert("Période bloquée avec succès ✓");
    };

    const handleSupprimer = async (id) => {
        if (!window.confirm('Supprimer ce blocage ?')) return;
        const res = await fetchWithAuth(`${API_URL}/api/availability/${id}`, { method: 'DELETE' });
        if (!res) return;
        setBlocages(blocages.filter(b => b._id !== id));
    };

    const handleSaveCapacite = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/availability/settings`, {
            method: 'PUT',
            body: JSON.stringify({ capaciteMaxPension: capaciteInput }),
        });
        if (!res) return;
        setCapaciteMax(capaciteInput);
        alert("Capacité mise à jour ✓");
    };

    if (loading) return <p>Chargement...</p>;

    const infoJourSelectionne = jourSelectionne ? getInfosJour(jourSelectionne) : null;

    return (
        <div className="admin-availability">

            <div className="availability-settings">
                <h3>Capacité max pension</h3>
                <p>Nombre de chiens acceptés simultanément : <strong>{capaciteMax}</strong></p>
                <div className="btn-row">
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={capaciteInput}
                        onChange={(e) => setCapaciteInput(Number(e.target.value))}
                    />
                    <button onClick={handleSaveCapacite}>Enregistrer</button>
                </div>
            </div>

            <div className="availability-calendar">
                <div className="calendar-nav">
                    <button onClick={() => naviguerMois(-1)}>‹</button>
                    <h3>{MOIS[moisActif]} {anneeActive}</h3>
                    <button onClick={() => naviguerMois(1)}>›</button>
                </div>

                <div className="calendar-legend">
                    <span><span className="legend-dot" style={{ background: '#c9922a' }} />Pension</span>
                    <span><span className="legend-dot" style={{ background: '#5b8a6e' }} />Laura dispo</span>
                    <span><span className="legend-dot" style={{ background: '#c0392b' }} />Indisponible</span>
                    <span><span className="legend-dot" style={{ background: '#4a6fa5' }} />Pet Sitting</span>
                </div>

                <div className="calendar-grid">
                    {JOURS_DESKTOP.map((j, i) => (
                        <div key={j + i} className="calendar-header-cell">
                            <span className="cal-jour-desktop">{j}</span>
                            <span className="cal-jour-mobile">{JOURS_MOBILE[i]}</span>
                        </div>
                    ))}

                    {jours.map((jour, i) => {
                        if (!jour) return <div key={`empty-${i}`} className="calendar-cell empty" />;

                        const { blocagesJour, resasPension, resasPetSitting, slotMatinOccupe, slotAmOccupe } = getInfosJour(jour);
                        const estAujourdhui = jour.toDateString() === today.toDateString();
                        const estPasse = jour < today && !estAujourdhui;
                        const estSelectionne = jourSelectionne?.toDateString() === jour.toDateString();
                        const blocageTous = blocagesJour.find(b => b.type === 'tous');
                        const blocagePension = blocagesJour.find(b => b.type === 'pension');
                        const placesOccupees = resasPension.length + (blocagePension ? capaciteMax : 0);
                        const placesDispo = Math.max(0, capaciteMax - placesOccupees);
                        const totalPassages = resasPetSitting.reduce((acc, r) => acc + (r.passagesParJour || 1), 0);

                        return (
                            <div
                                key={jour.toISOString()}
                                className={`calendar-cell ${estAujourdhui ? 'today' : ''} ${estPasse ? 'past' : ''} ${blocageTous ? 'blocked-all' : ''} ${estSelectionne ? 'selected' : ''}`}
                                onClick={() => setJourSelectionne(estSelectionne ? null : jour)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="calendar-day-number">{jour.getDate()}</span>

                                {!blocageTous && (
                                    <>
                                        <span
                                            className="calendar-tag"
                                            style={{ background: placesDispo === 0 ? '#c0392b' : '#c9922a' }}
                                        >
                                            {placesDispo === 0 ? 'Complet' : `${placesDispo}/${capaciteMax}`}
                                        </span>

                                        <span className="calendar-tag-slots">
                                            <span style={{ background: slotMatinOccupe ? '#c0392b' : '#5b8a6e' }}>M</span>
                                            <span style={{ background: slotAmOccupe ? '#c0392b' : '#5b8a6e' }}>AM</span>
                                        </span>

                                        {totalPassages > 0 && (
                                            <span className="calendar-tag" style={{ background: '#4a6fa5' }}>
                                                🐾 {totalPassages}p
                                            </span>
                                        )}
                                    </>
                                )}

                                {blocageTous && (
                                    <span className="calendar-tag" style={{ background: '#c0392b' }}>Fermé</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {jourSelectionne && infoJourSelectionne && (
                    <div className="calendar-day-detail">
                        <div className="calendar-day-detail__header">
                            <h4>{jourSelectionne.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                            <button onClick={() => setJourSelectionne(null)}>✕</button>
                        </div>

                        {infoJourSelectionne.resasPetSitting.length > 0 && (
                            <div className="calendar-day-detail__section">
                                <p className="calendar-day-detail__label">🐾 Pet Sitting</p>
                                {infoJourSelectionne.resasPetSitting.map((r, i) => (
                                    <div
                                        key={i}
                                        className="calendar-day-detail__item"
                                        onClick={() => setResaSelectionnee(r)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>{r.passagesParJour || 1} passage{(r.passagesParJour || 1) > 1 ? 's' : ''}</span>
                                        {r.heuresPassages?.length > 0 && (
                                            <span className="calendar-day-detail__heures">
                                                {r.heuresPassages.join(' / ')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {infoJourSelectionne.resasPension.length > 0 && (
                            <div className="calendar-day-detail__section">
                                <p className="calendar-day-detail__label">🏠 Pension</p>
                                {infoJourSelectionne.resasPension.map((r, i) => (
                                    <div
                                        key={i}
                                        className="calendar-day-detail__item"
                                        onClick={() => setResaSelectionnee(r)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span>{r.dog?.map(d => d.nom).join(', ') || '1 chien'}</span>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>{r.owner?.pseudo}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {infoJourSelectionne.resasPetSitting.length === 0 && infoJourSelectionne.resasPension.length === 0 && (
                            <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Aucune réservation ce jour.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="availability-form">
                <h3>Bloquer une période</h3>
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, slot: '' })}>
                    <option value="pension">Pension</option>
                    <option value="education">Éducation</option>
                    <option value="pet sitting">Pet Sitting</option>
                    <option value="tous">Tous</option>
                </select>
                <label>Date de début</label>
                <input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
                <label>Date de fin</label>
                <input type="date" min={form.dateDebut} value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
                {(form.type === 'education' || form.type === 'pet sitting') && (
                    <>
                        <label>Demi-journée (optionnel)</label>
                        <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
                            <option value="">Toute la journée</option>
                            <option value="matin">Matin</option>
                            <option value="apres-midi">Après-midi</option>
                        </select>
                    </>
                )}
                <label>Motif (optionnel)</label>
                <input type="text" placeholder="Ex : Congés, Complet..." value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
                <button onClick={handleAjouter}>Ajouter le blocage</button>
            </div>

            <div className="availability-list">
                <h3>Périodes bloquées ({blocages.length})</h3>
                {blocages.length === 0 && (
                    <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>Aucune période bloquée.</p>
                )}
                {blocages.map(b => (
                    <div key={b._id} className="availability-card">
                        <span className="availability-type">{TYPE_LABELS[b.type]}</span>
                        <span className="availability-dates">
                            {new Date(b.dateDebut).toLocaleDateString('fr-FR')} au {new Date(b.dateFin).toLocaleDateString('fr-FR')}
                        </span>
                        {b.slot && <span className="availability-slot">{b.slot}</span>}
                        {b.motif && <span className="availability-motif">{b.motif}</span>}
                        <button onClick={() => handleSupprimer(b._id)}>Supprimer</button>
                    </div>
                ))}
            </div>

            {resaSelectionnee && (
                <AdminResaModal
                    resa={resaSelectionnee}
                    onClose={() => setResaSelectionnee(null)}
                    onUpdate={(resaMaj) => {
                        setResaSelectionnee(resaMaj);
                        setResasValidees(prev => prev.map(r => r._id === resaMaj._id ? resaMaj : r));
                    }}
                    onDelete={(id) => {
                        setResaSelectionnee(null);
                        setResasValidees(prev => prev.filter(r => r._id !== id));
                    }}
                />
            )}
        </div>
    );
};

export default AdminAvailability;