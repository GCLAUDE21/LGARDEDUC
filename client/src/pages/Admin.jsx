import React, { useEffect, useState } from 'react';
import AdminResaCard from '../components/AdminResaCard';
import AdminUserCard from '../components/AdminUserCard';
import AdminServiceCard from '../components/AdminServiceCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';

const Admin = () => {
    const [reservations, setReservations] = useState([]);
    const [users, setUsers] = useState([]);
    const [onglet, setOnglet] = useState('reservations');
    const API_URL = import.meta.env.VITE_API_URL;
    const [filtre, setFiltre] = useState('tous');
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [newService, setNewService] = useState({
            type: "",
            description: "",
            prix: "",
            unite: "",
            image: "",
        });

        const handleChangeNew = (e) => {
        setNewService({ ...newService, [e.target.name]: e.target.value })
        }

    // FETCH AJOUT SERVICE
    const handleAdd = async () => {
    const res = await fetchWithAuth(API_URL + "/api/service", {
        method: "POST",
        body: JSON.stringify(newService)
    });
    if (!res) return;
    window.location.reload();
};

    // réservations filtrées
    const resasFiltrees = filtre === 'tous'
         ? reservations
         : reservations.filter(r => r.statut === filtre);        


useEffect(() => {
    const fetchAll = async () => {
        try {
            const [resResas, resUsers, resServices] = await Promise.all([
                fetchWithAuth(`${API_URL}/api/admin/reservations`),
                fetchWithAuth(`${API_URL}/api/admin/users`),
                fetchWithAuth(`${API_URL}/api/service`),
            ]);
            if (!resResas || !resUsers || !resServices) return;
            const [resas, users, services] = await Promise.all([
                resResas.json(),
                resUsers.json(),
                resServices.json(),
            ]);
            setReservations(resas);
            setUsers(users);
            setServices(services);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    fetchAll();
}, []);

    if (loading) return <Loader />;
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
                <button
                    className={onglet === 'prestations' ? 'active' : ''}
                    onClick={() => setOnglet('prestations')}
                >
                    Prestations
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
                        < AdminUserCard key={user._id} user={user} />
                    ))}
                </div>
            )}
            
            {onglet === 'prestations' && (
                <div className="admin-list">
                    <h2>Prestations ({services.length})</h2>
                    <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>Ajouter une Prestation</button>
                    {showForm && <form className='admin-add-form'>
                        <label htmlFor="type">Type</label>
                        <input id='type' name='type' type="text" value={newService.type} onChange={handleChangeNew} />
        
                        <label htmlFor="description">Description</label>
                        <textarea id='description' name='description' type="text" value={newService.description} onChange={handleChangeNew} />

                        <label htmlFor="prix">Prix</label>
                        <input id='prix' name='prix' type="text" value={newService.prix} onChange={handleChangeNew} />

                        <label htmlFor="unite">Unité</label>
                        <input id='unite' name='unite' type="text" value={newService.unite} onChange={handleChangeNew} />
                        
                        <label htmlFor="image">Image</label>
                        <input id='image' name='image' type="text" value={newService.image} onChange={handleChangeNew} />

                        <button type='button' onClick={handleAdd}>Enregistrer</button>

                    </form> }
                    {services.map((presta) => (
                        < AdminServiceCard key={presta._id} presta={presta} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;