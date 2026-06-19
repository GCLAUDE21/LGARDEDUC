import React, { useState } from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';
import fetchWithAuth from '../utils/fetchWithAuth';
import DogModal from './DogModal';

const DogCard = ({ dog, onDelete, onUpdate }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [showModal, setShowModal] = useState(false);

    const anneeNaissance = new Date(dog.dateDeNaissance).getFullYear();
    const anneeActuelle = new Date().getFullYear();
    const age = anneeActuelle - anneeNaissance;

    const handleDelete = async () => {
        if (!window.confirm(`Supprimer ${dog.nom} ?`)) return;
        const res = await fetchWithAuth(`${API_URL}/api/dogs/${dog._id}`, { method: "DELETE" });
        if (!res) return;
        onDelete(dog._id);
    };

    return (
        <>
            <div className="dogcard">
                <div className="photo">
                    <img src={dog.photo || defaultDog} alt={dog.nom} />
                </div>
                <div className="infodog">
                    <h4 className="dog-name" onClick={() => setShowModal(true)}>{dog.nom}</h4>
                    <label>Race</label>
                    <span>{dog.race}</span>
                    <label>Age</label>
                    <span>{age} ans</span>
                </div>
            </div>
            {showModal && (
                <DogModal
                    dog={dog}
                    onClose={() => setShowModal(false)}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default DogCard;