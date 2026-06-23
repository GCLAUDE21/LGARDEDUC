import React, { useState, useEffect } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import ResaModal from './ResaModal';
import useUpload from '../utils/useUpload';

const DogModal = ({ dog, onClose, onDelete, onUpdate }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [enEdition, setEnEdition] = useState(false);
    const [newVaccin, setNewVaccin] = useState({ nom: "", date: "" });

    const anneeNaissance = new Date(dog.dateDeNaissance).getFullYear();
    const anneeActuelle = new Date().getFullYear();
    const age = anneeActuelle - anneeNaissance;
    const [resaSelectionnee, setResaSelectionnee] = useState(null);
    const { upload, uploading } = useUpload('chiens');

    const [form, setForm] = useState({
        nom: dog.nom || "",
        dateDeNaissance: dog.dateDeNaissance ? dog.dateDeNaissance.slice(0, 10) : "",
        race: dog.race || "",
        photo: dog.photo || "",
        vaccins: dog.vaccins || [],
        sterilise: dog.sterilise || false,
        allergies: dog.allergies || "",
        veterinaire: {
            nom: dog.veterinaire?.nom || "",
            telephone: dog.veterinaire?.telephone || "",
        },
        traitement: dog.traitement || "",
        alimentation: {
            marque: dog.alimentation?.marque || "",
            quantite: dog.alimentation?.quantite || "",
            frequence: dog.alimentation?.frequence || "",
        },
        ententeChiens: dog.ententeChiens || "",
        ententeChats: dog.ententeChats || "",
        particularites: dog.particularites || "",
        notesProprietaire: dog.notesProprietaire || "",
    });
    // State resas liées à ce chien
    const [resasChien, setResasChien] = useState([]);

    // Fetch resas au montage, filtrées par ce chien
    useEffect(() => {
        const fetchResas = async () => {
            const res = await fetchWithAuth(`${API_URL}/api/user/reservations`);
            if (!res) return;
            const data = await res.json();
            // On garde uniquement les resas qui contiennent ce chien
            const filtrees = data.filter(r => r.dog?.some(d => d._id === dog._id));
            setResasChien(filtrees);
        };
        fetchResas();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleChangeVeto = (e) => setForm({ ...form, veterinaire: { ...form.veterinaire, [e.target.name]: e.target.value } });
    const handleChangeAlim = (e) => setForm({ ...form, alimentation: { ...form.alimentation, [e.target.name]: e.target.value } });

    const handleAddVaccin = () => {
        if (!newVaccin.nom) return;
        setForm({ ...form, vaccins: [...form.vaccins, newVaccin] });
        setNewVaccin({ nom: "", date: "" });
    };

    const handleDeleteVaccin = (index) => {
        setForm({ ...form, vaccins: form.vaccins.filter((_, i) => i !== index) });
    };

    const handleSave = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/dogs/${dog._id}`, {
            method: "PUT",
            body: JSON.stringify(form),
        });
        if (!res) return;
        if (!res.ok) { console.error("Erreur mise à jour"); return; }
        const updated = await res.json();
        onUpdate(updated);
        setEnEdition(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Supprimer ${dog.nom} ?`)) return;
        const res = await fetchWithAuth(`${API_URL}/api/dogs/${dog._id}`, { method: "DELETE" });
        if (!res) return;
        onDelete(dog._id);
        onClose();
    };

    return (
        <div className="dog-modal-overlay" onClick={onClose}>
            <div className="dog-modal" onClick={(e) => e.stopPropagation()}>
                <button className="dog-modal__close" onClick={onClose}>✕</button>

                <div className="dog-modal__header">
                    <img src={form.photo || defaultDog} alt={form.nom} />
                    <h3>{dog.nom}</h3>
                    <span>{dog.race} - {age} ans</span>
                    {dog.sterilise && <span className="badge">Stérilisé(e)</span>}
                </div>

                {!enEdition ? (
                    <div className="dog-modal__content">
                        <h5 className="section-label">Vaccins</h5>
                        {dog.vaccins.length === 0 ? <span className="empty">Aucun vaccin renseigné</span> :
                            dog.vaccins.map((v, i) => (
                                <div key={i} className="info-row">
                                    <span>{v.nom}</span>
                                    <span>{v.date ? new Date(v.date).toLocaleDateString('fr-FR') : "-"}</span>
                                </div>
                            ))
                        }

                        <h5 className="section-label">Santé</h5>
                        <div className="info-row"><span>Allergies</span><span>{dog.allergies || "-"}</span></div>
                        <div className="info-row"><span>Traitement</span><span>{dog.traitement || "-"}</span></div>
                        <div className="info-row"><span>Vétérinaire</span><span>{dog.veterinaire?.nom || "-"}</span></div>
                        <div className="info-row"><span>Téléphone</span><span>{dog.veterinaire?.telephone || "-"}</span></div>

                        <h5 className="section-label">Alimentation</h5>
                        <div className="info-row"><span>Marque</span><span>{dog.alimentation?.marque || "-"}</span></div>
                        <div className="info-row"><span>Quantité</span><span>{dog.alimentation?.quantite || "-"}</span></div>
                        <div className="info-row"><span>Fréquence</span><span>{dog.alimentation?.frequence || "-"}</span></div>

                        <h5 className="section-label">Comportement</h5>
                        <div className="info-row"><span>Avec les chiens</span><span>{dog.ententeChiens || "-"}</span></div>
                        <div className="info-row"><span>Avec les chats</span><span>{dog.ententeChats || "-"}</span></div>
                        {dog.particularites && <>
                            <h5 className="section-label">Particularités</h5>
                            <p className="notes-text">{dog.particularites}</p>
                        </>}

                        {dog.notesProprietaire && <>
                            <h5 className="section-label">Notes</h5>
                            <p className="notes-text">{dog.notesProprietaire}</p>
                        </>}

                        {/* Historique des réservations liées à ce chien */}
                            {resasChien.length > 0 && <>
                                <h5 className="section-label">Historique des réservations</h5>
                                {resasChien.map((r, i) => (
                                    <div key={i} className="info-row clickable" onClick={() => setResaSelectionnee(r)}>
                                        <span style={{ textTransform: 'capitalize' }}>{r.type}</span>
                                        <span>{new Date(r.dateDebut).toLocaleDateString('fr-FR')}{r.dateFin && ` - ${new Date(r.dateFin).toLocaleDateString('fr-FR')}`}</span>
                                        <span className={`resa-card__statut ${
                                            { "En attente": "en-attente", "Validée": "validee", "Refusée": "refusee", "Annulée": "refusee", "Contre-proposition": "contre-proposition" }[r.statut]
                                        }`}>{r.statut}</span>
                                    </div>
                                ))}
                            </>}


                        <div className="dog-modal__actions">
                            <button onClick={() => setEnEdition(true)}>Modifier</button>
                            <button className="btn-danger" onClick={handleDelete}>Supprimer ce chien</button>
                        </div>
                    </div>
                ) : (
                    <div className="dog-modal__content">
                        <h5 className="section-label">Infos de base</h5>
                        <label>Nom</label>
                        <input name="nom" value={form.nom} onChange={handleChange} />
                        <label>Race</label>
                        <input name="race" value={form.race} onChange={handleChange} />
                        <label>Date de naissance</label>
                        <input name="dateDeNaissance" type="date" value={form.dateDeNaissance} onChange={handleChange} />
                        <label>Photo</label>
                            {form.photo && <img src={form.photo} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }} />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const url = await upload(e.target.files[0]);
                                    if (url) setForm({ ...form, photo: url });
                                }}
                                disabled={uploading}
                            />
                            {uploading && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Upload en cours...</p>}

                        <h5 className="section-label">Vaccins</h5>
                        {form.vaccins.map((v, i) => (
                            <div key={i} className="vaccin-item">
                                <span>{v.nom} {v.date ? `- ${new Date(v.date).toLocaleDateString('fr-FR')}` : ""}</span>
                                <button type="button" onClick={() => handleDeleteVaccin(i)}>✕</button>
                            </div>
                        ))}
                        <div className="vaccin-add">
                            <input placeholder="Vaccin" value={newVaccin.nom} onChange={(e) => setNewVaccin({ ...newVaccin, nom: e.target.value })} />
                            <input type="date" value={newVaccin.date} onChange={(e) => setNewVaccin({ ...newVaccin, date: e.target.value })} />
                            <button type="button" onClick={handleAddVaccin}>+</button>
                        </div>

                        <h5 className="section-label">Santé</h5>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.sterilise} onChange={(e) => setForm({ ...form, sterilise: e.target.checked })} />
                            Stérilisé(e)
                        </label>
                        <label>Allergies</label>
                        <input name="allergies" value={form.allergies} onChange={handleChange} />
                        <label>Traitement</label>
                        <input name="traitement" value={form.traitement} onChange={handleChange} />
                        <label>Vétérinaire</label>
                        <input name="nom" value={form.veterinaire.nom} onChange={handleChangeVeto} placeholder="Nom" />
                        <input name="telephone" value={form.veterinaire.telephone} onChange={handleChangeVeto} placeholder="Téléphone" />

                        <h5 className="section-label">Alimentation</h5>
                        <label>Marque</label>
                        <input name="marque" value={form.alimentation.marque} onChange={handleChangeAlim} />
                        <label>Quantité</label>
                        <input name="quantite" value={form.alimentation.quantite} onChange={handleChangeAlim} />
                        <label>Fréquence</label>
                        <input name="frequence" value={form.alimentation.frequence} onChange={handleChangeAlim} />

                        <h5 className="section-label">Comportement</h5>
                        <label>Avec les chiens</label>
                        <input name="ententeChiens" value={form.ententeChiens} onChange={handleChange} />
                        <label>Avec les chats</label>
                        <input name="ententeChats" value={form.ententeChats} onChange={handleChange} />
                        <label>Particularités</label>
                        <textarea name="particularites" value={form.particularites} onChange={handleChange} />

                        <h5 className="section-label">Notes</h5>
                        <textarea name="notesProprietaire" value={form.notesProprietaire} onChange={handleChange} />

                        <div className="dog-modal__actions">
                            <button onClick={handleSave}>Enregistrer</button>
                            <button onClick={() => setEnEdition(false)}>Annuler</button>
                        </div>
                    </div>
                )}
            </div>
            {resaSelectionnee && (
                <ResaModal
                    resa={resaSelectionnee}
                    onClose={() => setResaSelectionnee(null)}
                />
            )}
        </div>
    );
};

export default DogModal;