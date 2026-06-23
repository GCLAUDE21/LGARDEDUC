import React, { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import useUpload from '../utils/useUpload';

const AdminServiceCard = ({ presta }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [enEdition, setEnEdition] = useState(false);
    const [form, setForm] = useState({
        type: presta.type,
        description: presta.description,
        prix: presta.prix,
        unite: presta.unite,
        image: presta.image,
    });

    const { upload, uploading } = useUpload('prestations');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async () => {
        const res = await fetchWithAuth(API_URL + "/api/service/" + presta._id, {
            method: "PUT",
            body: JSON.stringify(form),
        });
        if (!res) return;
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!window.confirm("Supprimer cette prestation ?")) return;
        const res = await fetchWithAuth(API_URL + "/api/service/" + presta._id, { method: "DELETE" });
        if (!res) return;
        window.location.reload();
    };

    return (
        <section className="AdminServiceCard">
            {!enEdition && <>
                <img src={presta.image} alt={presta.type} />
                <h3>{presta.type}</h3>
                <span>{presta.description}</span>
                <span>{presta.prix} {presta.unite}</span>
                <div className="btn-row">
                    <button onClick={() => setEnEdition(true)}>Modifier</button>
                    <button onClick={handleDelete}>Supprimer</button>
                </div>
            </>}

            {enEdition && <>
                <div className="edit-form">
                    {form.image && <img src={form.image} alt={presta.type} />}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const url = await upload(e.target.files[0]);
                            if (url) setForm({ ...form, image: url });
                        }}
                        disabled={uploading}
                    />
                    {uploading && <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>Upload en cours...</p>}
                    <input name="type" value={form.type} onChange={handleChange} />
                    <textarea name="description" value={form.description} onChange={handleChange} />
                    <input name="prix" value={form.prix} onChange={handleChange} />
                    <input name="unite" value={form.unite} onChange={handleChange} />
                    <div className="btn-row">
                        <button onClick={handleSave}>Enregistrer</button>
                        <button onClick={() => setEnEdition(false)}>Annuler</button>
                    </div>
                </div>
            </>}
        </section>
    );
};

export default AdminServiceCard;