import React, { useEffect, useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';

const TYPE_LABELS = {
    pension: '🏠 Pension',
    education: '🎓 Éducation',
    'pet sitting': '🐾 Pet Sitting',
    tous: '🔒 Tous',
};

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const AdminAvailability = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const [blocages, setBlocages] = useState([]);
    const [resasValidees, setResasValidees] = useState([]);
    const [capaciteMax, setCapaciteMax] = useState(4);
    const [capaciteInput, setCapaciteInput] = useState(4);
    const [loading, setLoading] = useState(true);

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

    // --- Calcul des infos d'un jour donné ---
    const getInfosJour = (date) => {
        const d = new Date(date);
        d.setHours(12, 0, 0, 0);

        // Blocages manuels couvrant ce jour
        const blocagesJour = blocages.filter(b => {
            const debut = new Date(b.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(b.dateFin); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });

        // Resas pension couvrant ce jour
        const resasPension = resasValidees.filter(r => {
            if (r.type !== 'pension') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            const fin = new Date(r.dateFin || r.dateDebut); fin.setHours(23, 59, 59, 999);
            return d >= debut && d <= fin;
        });

        // Resas Laura (éducation + pet sitting) sur ce jour exact
        // Les deux types partagent les mêmes slots, on les fusionne
        const resasLaura = resasValidees.filter(r => {
            if (r.type !== 'education' && r.type !== 'pet sitting') return false;
            const debut = new Date(r.dateDebut); debut.setHours(0, 0, 0, 0);
            return d.toDateString() === debut.toDateString();
        });

        // Blocages manuels Laura (éducation ou pet sitting) sur ce jour
        const blocagesLaura = blocagesJour.filter(b =>
            b.type === 'education' || b.type === 'pet sitting'
        );

        // Calcul slots Laura
        const slotMatinOccupe =
            resasLaura.some(r => r.slot === 'matin') ||
            blocagesLaura.some(b => b.slot === 'matin' || !b.slot);

        const slotAmOccupe =
            resasLaura.some(r => r.slot === 'apres-midi') ||
            blocagesLaura.some(b => b.slot === 'apres-midi' || !b.slot);

        return { blocagesJour, resasPension, slotMatinOccupe, slotAmOccupe };
    };

    // --- Génération des jours du mois ---
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

    return (
        <div className="admin-availability">

            {/* Capacité max pension */}
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

            {/* Calendrier visuel */}
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
                </div>

                <div className="calendar-grid">
                    {JOURS.map(j => (
                        <div key={j} className="calendar-header-cell">{j}</div>
                    ))}

                    {jours.map((jour, i) => {
                        if (!jour) return <div key={`empty-${i}`} className="calendar-cell empty" />;

                        const { blocagesJour, resasPension, slotMatinOccupe, slotAmOccupe } = getInfosJour(jour);
                        const estAujourdhui = jour.toDateString() === today.toDateString();
                        const estPasse = jour < today && !estAujourdhui;
                        const blocageTous = blocagesJour.find(b => b.type === 'tous');
                        const blocagePension = blocagesJour.find(b => b.type === 'pension');
                        const placesOccupees = resasPension.length + (blocagePension ? capaciteMax : 0);
                        const placesDispo = Math.max(0, capaciteMax - placesOccupees);

                        return (
                            <div
                                key={jour.toISOString()}
                                className={`calendar-cell ${estAujourdhui ? 'today' : ''} ${estPasse ? 'past' : ''} ${blocageTous ? 'blocked-all' : ''}`}
                            >
                                <span className="calendar-day-number">{jour.getDate()}</span>

                                {!blocageTous && (
                                    <>
                                        {/* Pension */}
                                        <span
                                            className="calendar-tag"
                                            style={{ background: placesDispo === 0 ? '#c0392b' : '#c9922a' }}
                                            title={`Pension : ${placesDispo}/${capaciteMax} places`}
                                        >
                                            🏠 {placesDispo}/{capaciteMax}
                                        </span>

                                        {/* Laura : slots fusionnés éduc + pet sitting */}
                                        <span className="calendar-tag-slots" title="Disponibilités Laura">
                                            👩
                                            <span style={{ background: slotMatinOccupe ? '#c0392b' : '#5b8a6e' }}>M</span>
                                            <span style={{ background: slotAmOccupe ? '#c0392b' : '#5b8a6e' }}>AM</span>
                                        </span>
                                    </>
                                )}

                                {blocageTous && (
                                    <span className="calendar-tag" style={{ background: '#c0392b' }}>🔒 Fermé</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Formulaire ajout blocage */}
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
                <input
                    type="date"
                    value={form.dateDebut}
                    onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                />

                <label>Date de fin</label>
                <input
                    type="date"
                    min={form.dateDebut}
                    value={form.dateFin}
                    onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                />

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
                <input
                    type="text"
                    placeholder="Ex : Congés, Complet..."
                    value={form.motif}
                    onChange={(e) => setForm({ ...form, motif: e.target.value })}
                />

                <button onClick={handleAjouter}>Ajouter le blocage</button>
            </div>

            {/* Liste des blocages */}
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
        </div>
    );
};

export default AdminAvailability;