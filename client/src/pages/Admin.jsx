import React, { useEffect, useState } from 'react';
import AdminResaCard from '../components/AdminResaCard';
import AdminResaModal from '../components/AdminResaModal';
import AdminUserCard from '../components/AdminUserCard';
import AdminServiceCard from '../components/AdminServiceCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';
import AdminUserModal from '../components/AdminUserModal';

const ONGLETS_RESA = [
    { label: 'Pension', value: 'pension' },
    { label: 'Éducation', value: 'education' },
    { label: 'Pet Sitting', value: 'pet sitting' },
    { label: 'Archives', value: 'archives' },
];

const Admin = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    // --- State global ---
    const [loading, setLoading] = useState(true);
    const [onglet, setOnglet] = useState('reservations');

    // --- State réservations ---
    const [reservations, setReservations] = useState([]);
    const [ongletResa, setOngletResa] = useState('pension');
    const [resaSelectionnee, setResaSelectionnee] = useState(null);

    // --- State utilisateurs ---
    const [users, setUsers] = useState([]);
    const [userSelectionne, setUserSelectionne] = useState(null);
    const [recherche, setRecherche] = useState("");

    // --- Filtrage utilisateurs par recherche ---
    const usersFiltres = users.filter(u => {
        const q = recherche.toLowerCase();
        return (
            u.nom?.toLowerCase().includes(q) ||
            u.prenom?.toLowerCase().includes(q) ||
            u.pseudo?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.ville?.toLowerCase().includes(q) ||
            u.rue?.toLowerCase().includes(q) ||
            u.codePostal?.toLowerCase().includes(q)
        );
    });

    // --- State prestations ---
    const [services, setServices] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newService, setNewService] = useState({
        type: "", description: "", prix: "", unite: "", image: "",
    });

    // --- Fetch initial : réservations, utilisateurs, prestations ---
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

    // --- Fetch utilisateurs séparé (appelé après chaque action sur une resa) ---
    const fetchUsers = async () => {
        const res = await fetchWithAuth(`${API_URL}/api/admin/users`);
        if (!res) return;
        const data = await res.json();
        setUsers(data);
    };

    

    // --- Ajout d'une prestation ---
    const handleChangeNew = (e) => setNewService({ ...newService, [e.target.name]: e.target.value });

    const handleAdd = async () => {
        const res = await fetchWithAuth(API_URL + "/api/service", {
            method: "POST",
            body: JSON.stringify(newService)
        });
        if (!res) return;
        window.location.reload();
    };

    // --- Suppression d'une resa du state ---
        const handleDeleteResa = (resaId) => {
            setReservations(prev => prev.filter(r => r._id !== resaId));
            setResaSelectionnee(null);
        };

    // --- Mise à jour d'une resa dans le state + refresh users ---
    const handleUpdateResa = (resaMaj) => {
        setReservations(prev => prev.map(r => r._id === resaMaj._id ? resaMaj : r));
        setResaSelectionnee(resaMaj);
        fetchUsers();
    };

    // --- Filtrage des réservations par onglet ---
    const today = new Date();

    // Archives : validées passées + refusées (tous types)
    // Autres onglets : filtre par type, exclut archives
    const resasFiltrees = ongletResa === 'archives'
        ? reservations.filter(r =>
            r.statut === "Refusée" ||
            r.statut === "Annulée" ||
            (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today)
        )
        : reservations.filter(r => {
            if (r.type !== ongletResa) return false;
            if (r.statut === "Refusée") return false;
            if (r.statut === "Annulée") return false;
            if (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today) return false;
            return true;
        });

    // Sous-sections dans les onglets actifs (hors archives)
    const resasEnAttente = resasFiltrees.filter(r => r.statut === "En attente");
    const resasContreProposition = resasFiltrees.filter(r => r.statut === "Contre-proposition");
    const resasEnCours = resasFiltrees.filter(r =>
        r.statut === "Validée" &&
        new Date(r.dateDebut) <= today &&
        new Date(r.dateFin || r.dateDebut) >= today
    );
    const resasAVenir = resasFiltrees.filter(r =>
        r.statut === "Validée" && new Date(r.dateDebut) > today
    );

    // Compteur par onglet (affiché sur le bouton)
    const compterOnglet = (value) => {
        if (value === 'archives') {
            return reservations.filter(r =>
                r.statut === "Refusée" ||
                r.statut === "Annulée" ||
                (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today)
            ).length;
        }
        return reservations.filter(r => {
            if (r.type !== value) return false;
            if (r.statut === "Refusée") return false;
            if (r.statut === "Annulée") return false;
            if (r.statut === "Validée" && new Date(r.dateFin || r.dateDebut) < today) return false;
            return true;
        }).length;
    };

    if (loading) return <Loader />;

    return (
        <div className="admin">
            <h1>Panel Admin</h1>

            {/* Onglets principaux */}
            <div className="admin-tabs">
                <button className={onglet === 'reservations' ? 'active' : ''} onClick={() => setOnglet('reservations')}>Réservations</button>
                <button className={onglet === 'users' ? 'active' : ''} onClick={() => setOnglet('users')}>Utilisateurs</button>
                <button className={onglet === 'prestations' ? 'active' : ''} onClick={() => setOnglet('prestations')}>Prestations</button>
            </div>

            {/* === RÉSERVATIONS === */}
            {onglet === 'reservations' && (
                <div className="admin-list">

                    {/* Sous-onglets Pension / Éducation / Pet Sitting / Archives */}
                    <div className="admin-resa-tabs">
                        {ONGLETS_RESA.map(o => (
                            <button
                                key={o.value}
                                className={`admin-resa-tab ${ongletResa === o.value ? 'active' : ''}`}
                                onClick={() => setOngletResa(o.value)}
                            >
                                {o.label}
                                <span className="tab-count">{compterOnglet(o.value)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Onglets actifs : sous-sections par statut */}
                    {ongletResa !== 'archives' && <>
                        {resasEnAttente.length > 0 && <>
                            <h3 className="admin-section-title">En attente ({resasEnAttente.length})</h3>
                            {resasEnAttente.map(r => <AdminResaCard key={r._id} resa={r} onClick={() => setResaSelectionnee(r)} />)}
                        </>}
                        {resasContreProposition.length > 0 && <>
                            <h3 className="admin-section-title">Contre-proposition envoyée ({resasContreProposition.length})</h3>
                            {resasContreProposition.map(r => <AdminResaCard key={r._id} resa={r} onClick={() => setResaSelectionnee(r)} />)}
                        </>}
                        {resasEnCours.length > 0 && <>
                            <h3 className="admin-section-title">En cours ({resasEnCours.length})</h3>
                            {resasEnCours.map(r => <AdminResaCard key={r._id} resa={r} onClick={() => setResaSelectionnee(r)} />)}
                        </>}
                        {resasAVenir.length > 0 && <>
                            <h3 className="admin-section-title">À venir ({resasAVenir.length})</h3>
                            {resasAVenir.map(r => <AdminResaCard key={r._id} resa={r} onClick={() => setResaSelectionnee(r)} />)}
                        </>}
                        {resasFiltrees.length === 0 && (
                            <p style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '1rem' }}>Aucune réservation active.</p>
                        )}
                    </>}

                    {/* Onglet Archives */}
                    {ongletResa === 'archives' && <>
                        {resasFiltrees.length === 0
                            ? <p style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '1rem' }}>Aucune archive.</p>
                            : resasFiltrees.map(r => <AdminResaCard key={r._id} resa={r} onClick={() => setResaSelectionnee(r)} />)
                        }
                    </>}
                </div>
            )}

            {/* === UTILISATEURS === */}
            {onglet === 'users' && (
                <div className="admin-list">
                    <h2>Utilisateurs ({users.length})</h2>

                    {/* Barre de recherche */}
                    <input
                        className="admin-search"
                        type="text"
                        placeholder="Rechercher par nom, pseudo, ville..."
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                    />

                    {usersFiltres.map((user) => (
                        <AdminUserCard
                            key={user._id}
                            user={user}
                            onClick={() => setUserSelectionne(user)}
                        />
                    ))}

                    {usersFiltres.length === 0 && (
                        <p style={{ opacity: 0.5, fontSize: '0.85rem', marginTop: '1rem' }}>Aucun utilisateur trouvé.</p>
                    )}
                </div>
            )}

            {/* Modale détail utilisateur */}
            {userSelectionne && (
                <AdminUserModal
                    user={userSelectionne}
                    onClose={() => setUserSelectionne(null)}
                />
            )}  

            {/* === PRESTATIONS === */}
            {onglet === 'prestations' && (
                <div className="admin-list">
                    <h2>Prestations ({services.length})</h2>
                    <button className="admin-add-btn" onClick={() => setShowForm(!showForm)}>Ajouter une Prestation</button>
                    {showForm && (
                        <form className='admin-add-form'>
                            <label htmlFor="type">Type</label>
                            <input id='type' name='type' type="text" value={newService.type} onChange={handleChangeNew} />
                            <label htmlFor="description">Description</label>
                            <textarea id='description' name='description' value={newService.description} onChange={handleChangeNew} />
                            <label htmlFor="prix">Prix</label>
                            <input id='prix' name='prix' type="text" value={newService.prix} onChange={handleChangeNew} />
                            <label htmlFor="unite">Unité</label>
                            <input id='unite' name='unite' type="text" value={newService.unite} onChange={handleChangeNew} />
                            <label htmlFor="image">Image</label>
                            <input id='image' name='image' type="text" value={newService.image} onChange={handleChangeNew} />
                            <button type='button' onClick={handleAdd}>Enregistrer</button>
                        </form>
                    )}
                    {services.map((presta) => <AdminServiceCard key={presta._id} presta={presta} />)}
                </div>
            )}

            {/* Modale détail réservation — s'ouvre au clic sur une AdminResaCard */}
            {resaSelectionnee && (
                <AdminResaModal
                    resa={resaSelectionnee}
                    onClose={() => setResaSelectionnee(null)}
                    onUpdate={handleUpdateResa}
                    onDelete={handleDeleteResa}
                />
            )}
        </div>
    );
};

export default Admin;