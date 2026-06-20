import React from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

// Card résumé cliquable — toute la logique est dans AdminUserModal
const AdminUserCard = ({ user, onClick }) => {
    return (
        <div className="admin-user-card" onClick={onClick}>
            <div className="admin-user-card__header">
                <div className="admin-user-card__identity">
                    <span className="admin-user-card__name">{user.prenom} {user.nom}</span>
                    <span className="admin-user-card__pseudo">@{user.pseudo}</span>
                </div>
                <span className="admin-user-card__email">{user.email}</span>
            </div>
            <div className="admin-user-card__footer">
                <span>{user.ville || "Ville non renseignée"}</span>
                <div className="admin-user-card__counts">
                    <span>🐶 {user.chiens?.length || 0} chien(s)</span>
                    <span>📅 {user.reservations?.length || 0} résa(s)</span>
                </div>
            </div>
        </div>
    );
};

export default AdminUserCard;