import React from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

const AdminUserCard = ({user}) => {

 const aujourd_hui = new Date();

    const passees = (user.reservations || []).filter(r => aujourd_hui > new Date(r.dateFin));
    const enCours = (user.reservations || []).filter(r => aujourd_hui > new Date(r.dateDebut) && aujourd_hui < new Date(r.dateFin));
    const aVenir = (user.reservations || []).filter(r => aujourd_hui < new Date(r.dateDebut));


    return (
        <div className="admin-user-card">
            <section>
                <h3>Infos Persos</h3>
                <span>{user.pseudo}</span>
                <span>{user.email}</span>
                <span>{user.telephone}</span>
                <span>{user.adresse}</span>
            </section>
            <section>
                <h3>Réservations</h3>
                <h4>En cours ({enCours.length})</h4>
                    {enCours.map((r) => (
                    <div key={r._id} className="resa-item">
                    <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')} </span>
                    </div>
                    ))}
                <h4>A Venir ({aVenir.length})</h4>
                    {aVenir.map((r) => (
                    <div key={r._id} className="resa-item">
                    <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')}</span>
                    </div>
                    ))}
                <h4>Passées ({passees.length})</h4>
                    {passees.map((r) => (
                    <div key={r._id} className="resa-item">
                     <span>{r.type} du {new Date(r.dateDebut).toLocaleDateString('fr-FR')} au {new Date(r.dateFin).toLocaleDateString('fr-FR')} </span>
                    </div>
                    ))}
            </section>
            <section>
                <h3>Chiens</h3>
                <div className="chiens-grid">
                {user.chiens.map((dog) => (
                <div key={dog._id} className="chien-item">
                <img src={dog.photo || defaultDog } alt={dog.nom} />
                <span>{dog.nom}</span>
                </div>
                 ))}
                </div>
            </section>
        </div>
    );
};

export default AdminUserCard;