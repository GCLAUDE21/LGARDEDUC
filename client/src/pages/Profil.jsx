import React, { useEffect, useState } from 'react';
import DogCard from '../components/DogCard';
import Loader from '../components/Loader';
import fetchWithAuth from '../utils/fetchWithAuth';

const Profil = () => {

    const [addDog, setAddDog] = useState(false)
    const [dataUser, setDataUser] = useState({})
    const [chiensUser, setChiensUser] = useState([])
    const API_URL = import.meta.env.VITE_API_URL;

    const [nameDog, setNameDog] = useState("");
    const [datDog, setDateDog] = useState("");
    const [raceDog, setRaceDog] = useState("");
    const [photoDog, setPhotoDog] = useState("");
    const [loading, setLoading] = useState(true);
    const [enEdition, setEnEdition] = useState(false);
    const [erreurProfil, setErreurProfil] = useState("");
    const [form, setForm] = useState({
    pseudo: "",
    nom: "",
    prenom: "",
    email: "",
    rue: "",
    codePostal: "",
    ville: "",
    dateDeNaissance: "",
    telephone: "",
    inscription: "",
    }); 

    const handleAddDog = async () => {
        try {
            const response = await fetchWithAuth (`${API_URL}/api/dogs`, {
                    method: "POST",
                    body: JSON.stringify({"nom": nameDog, "dateDeNaissance": datDog, "race": raceDog, "photo": photoDog}),
                    
                });
                if (!response) return;
                if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            window.location.reload()
                } catch (err) {
                console.error("Erreur lors de l'ajout du chien", err)
            } 
            };

    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })}

    const handleSaveProfil = async () => {
        setErreurProfil("");
        fetchWithAuth(API_URL + "/api/user/profil", {
            method: "PUT",
            body: JSON.stringify(form),
        }).then(async (res) => {
            if (!res) return;
            if (!res.ok) {
                const data = await res.json();
                setErreurProfil(data.message);
                return;
            }
            window.location.reload();
        });
    };

    useEffect( () => {
        const fetchUser = async () => {
            try {
                const response = await fetchWithAuth (`${API_URL}/api/user/profil`, {
                    method: "get",
                    });
                    if (!response) return;
                    if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                } 
                const json = await response.json()
                setDataUser(json);
                setForm({
                    pseudo: json.pseudo || "",
                    nom: json.nom || "",
                    prenom: json.prenom || "",
                    email: json.email || "",
                    rue: json.rue || "",
                    codePostal: json.codePostal || "",
                    ville: json.ville || "",
                    dateDeNaissance: json.dateDeNaissance || "",
                    telephone: json.telephone || "",
                });

            } catch (err) {
                console.log(err);
                
            } finally {setLoading(false);
                }
        }

        fetchUser()

    }, [])

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/api/user/dogs`, {
                    method: "get",
                    });
                    if (!response) return;
                    if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                } 
                const json = await response.json()
                setChiensUser(json);  
                  
            } catch (err) {
                console.log(err)
            } finally {setLoading(false);
                }

        }
        fetchDogs()
    }, [])

    if (loading) return <Loader />;
    return (
        <section className='profil'>
            {/* Intro profil */}
            <div className="profil-intro">
                <h2>Mon profil</h2>
                <p>
                    Bienvenue sur votre espace personnel. Vous pouvez ici gérer vos informations et celles de vos chiens.
                </p>
                <div className="profil-intro-notices">
                    <div className="intro-notice">
                        <h4>👤 Vos informations</h4>
                        <p>Un profil complet permet à Laura de mieux vous connaître et de personnaliser ses services. Pensez à renseigner votre adresse et votre numéro de téléphone pour faciliter la prise de contact.</p>
                    </div>
                    <div className="intro-notice">
                        <h4>🐶 Votre chien</h4>
                        <p>Plus la fiche de votre chien est complète, mieux Laura pourra s'en occuper. Renseignez ses vaccins, son alimentation, son comportement et ses éventuelles particularités pour assurer son bien-être.</p>
                    </div>
                </div>
                <p className="profil-intro-notice">
                    Ces informations sont <strong>confidentielles</strong> et utilisées uniquement par Laura dans le cadre de la prise en charge de votre chien.
                </p>
            </div>

            <div className="entete">
                {enEdition === true && 
                <div className="editForm">
                    <label>Pseudo</label>
                    <input placeholder='Pseudo' name="pseudo" value={form.pseudo} onChange={handleChange} />
                    <label>Nom</label>
                    <input placeholder='Nom' name="nom" value={form.nom} onChange={handleChange} />
                    <label>Prénom</label>
                    <input placeholder='Prénom' name="prenom" value={form.prenom} onChange={handleChange} />
                    <label>Email</label>
                    <input placeholder='Email' name="email" value={form.email} onChange={handleChange} />
                    <label>Rue</label>
                    <input placeholder='21 rue de la Paix' name="rue" value={form.rue} onChange={handleChange} />
                    <label>Code postal</label>
                    <input placeholder='59000' name="codePostal" value={form.codePostal} onChange={handleChange} />
                    <label>Ville</label>
                    <input placeholder='Valenciennes' name="ville" value={form.ville} onChange={handleChange} />
                    <label>Date de naissance</label>
                    <input type='date' name="dateDeNaissance" value={form.dateDeNaissance} onChange={handleChange} />
                    <label>Téléphone</label>
                    <input placeholder='06XXXXXXXX' name="telephone" value={form.telephone} onChange={handleChange} />

                    {erreurProfil && <p className="erreur-profil">{erreurProfil}</p>}

                    <div className="btn-row">
                        <button onClick={handleSaveProfil}>Enregistrer</button>
                        <button onClick={() => { setEnEdition(false); setErreurProfil(""); }}>Annuler</button>
                    </div>
                </div>
                }

                {enEdition === false &&
                <div className="basicForm">
                <h2>Informations personelles</h2>
                <h3>{dataUser.pseudo}</h3>
                <span>{dataUser.prenom} {dataUser.nom}</span>
                <span>{dataUser.dateDeNaissance && <span>{new Date(dataUser.dateDeNaissance).toLocaleDateString('fr-FR')}</span>}</span>
                <span>{dataUser.email}</span>
                <span>{dataUser.telephone}</span>
                <span>{dataUser.rue}, {dataUser.codePostal} {dataUser.ville}</span> 
                <button onClick={() => setEnEdition(true)}>Modifier le profil</button>
                </div>               
                }
            </div>
            <div className="chiens">
            <h3> {chiensUser.length > 1 ? "Mes chiens" : "Mon chien"}</h3>
            {chiensUser.map((dog) => (
                < DogCard key={dog._id} dog={dog}
                onDelete={(id) => setChiensUser(chiensUser.filter(d => d._id !== id))} 
                onUpdate={(updated) => setChiensUser(chiensUser.map(d => d._id === updated._id ? updated : d))}  />
            ))}
            </div>
            {addDog ? <button onClick={() => setAddDog(false)}>Masquer le formulaire</button>  : <button onClick={() => setAddDog(true)}>Ajouter un chien</button> }
            {addDog && (
                <div className="form-add-dog">
                <h3>Ajouter un chien</h3>
                  <form action="">
                    <label >Nom : </label>
                    <input onChange={(e) => setNameDog(e.target.value)} id='name' type="text" />
                    <label >Date de Naissance : </label>
                    <input onChange={(e) => setDateDog(e.target.value)} id='date' type="date" />
                    <label >Race : </label>
                    <input onChange={(e) => setRaceDog(e.target.value)} id='race' type="text" />
                    <label >Photo :</label>
                    <input onChange={(e) => setPhotoDog(e.target.value)} id='photo' type="text" />
                    <button type='button' onClick={handleAddDog}>Ajouter</button>
                  </form>
                </div>
            )}
        </section>
    );
};

export default Profil;