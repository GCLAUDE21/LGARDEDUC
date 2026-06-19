import React, { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';

const AdminServiceCard = ({presta}) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [enEdition, SetEnEdition] = useState(false);
    const [form, setForm] = useState({
        type: presta.type,
        description: presta.description,
        prix: presta.prix,
        unite: presta.unite,
        image: presta.image,
    })

    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    }

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
        const res = await fetchWithAuth(API_URL + "/api/service/" + presta._id, {
             method: "DELETE",
        });
        if (!res) return;
        window.location.reload();
    }

    return (
        <section className="AdminServiceCard">
            {enEdition === false && <> <img src={presta.image} alt={presta.type} />
            <h3>{presta.type}</h3>
            <span>{presta.description}</span>
            <span>{presta.prix} {presta.unite}</span>
            <div className="btn-row">
            <button onClick={() => SetEnEdition(true)}>Modifier</button> <button onClick={handleDelete}>Supprimer</button></div> </> }
            
            {enEdition === true && <> <div className="edit-form"><img src={form.image} alt={presta.type}  /> <input name="image" value={form.image} onChange={handleChange} />
            <input name="type" value={form.type} onChange={handleChange} />
             <textarea name="description" value={form.description} onChange={handleChange} />
            <input name="prix" value={form.prix} onChange={handleChange} /> <input name="unite" value={form.unite} onChange={handleChange} />
            <div className="btn-row">
            <button onClick={handleSave}>Enregistrer</button> <button onClick={() => SetEnEdition(false)}>Annuler</button></div> </div></> }
            
        </section>
    );
};

export default AdminServiceCard;