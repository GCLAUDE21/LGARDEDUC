import React, { useEffect, useState } from 'react';
import AdminResaCard from '../components/AdminResaCard';

const Admin = () => {
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);
    const [onglet, setOnglet] = useState('reservations');
    const token = localStorage.getItem("token");
    const API_URL = import.meta.env.VITE_API_URL;
    const [filtre, setFiltre] = useState('tous');

    // réservations filtrées
        const resasFiltrees = filtre === 'tous'
         ? reservations
         : reservations.filter(r => r.statut === filtre);        

    useEffect(() => {
        fetch(`${API_URL}/api/admin/reservations`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => setReservations(data));

        fetch(`${API_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => setUsers(data));
    }, []);

    return (
        <div className="admin">
            <h1>Panel Admin</h1>

            <div className="admin-tabs">
                <button
                    className={onglet === 'reservations' ? 'active' : ''}
                    onClick={() => setOnglet('reservations')}
                >
                    Réservations
                </button>
                <button
                    className={onglet === 'users' ? 'active' : ''}
                    onClick={() => setOnglet('users')}
                >
                    Utilisateurs
                </button>
            </div>

            {onglet === 'reservations' && (
                 <div className="admin-list">
                 <h2>Réservations ({reservations.length})</h2>
                 <select
                      className="admin-filtre"
                       value={filtre}
                      onChange={(e) => setFiltre(e.target.value)}
                 >
                <option value="tous">Toutes</option>
                <option value="En attente">En attente</option>
                <option value="Validée">Validée</option>
                <option value="Refusée">Refusée</option>
                </select>
                {resasFiltrees.map((resa) => (
                    <AdminResaCard key={resa._id} resa={resa} />
                ))}
                    </div>
            )}

            {onglet === 'users' && (
                <div className="admin-list">
                    <h2>Utilisateurs ({users.length})</h2>
                    {users.map((user) => (
                        <div key={user._id} className="admin-user-card">
                            <span className="admin-user-card__pseudo">{user.pseudo}</span>
                            <span className="admin-user-card__email">{user.email}</span>
                            <span className="admin-user-card__badge">
                                {user.admin ? 'Admin' : 'User'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;