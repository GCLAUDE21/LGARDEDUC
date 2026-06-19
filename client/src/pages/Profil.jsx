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
        fetchWithAuth(API_URL + "/api/user/profil", {
             method: "PUT",
            body: JSON.stringify(form),
        }).then(async (res) => {
            if(!res) return;
            if (!res.ok) {
        const data = await res.json();
        alert(data.message);
        return;
        }
         window.location.reload();
        })
    }

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
            <div className="entete">
                {enEdition === true && 
                <div className="editForm">
                    <input placeholder='Pseudo' name="pseudo" value={form.pseudo} onChange={handleChange} />
                    <input placeholder='Nom' name="nom" value={form.nom} onChange={handleChange} />
                    <input placeholder='Prénom' name="prenom" value={form.prenom} onChange={handleChange} />
                    <input placeholder='Email' name="email" value={form.email} onChange={handleChange} />
                    <input placeholder='XX rue ....' name="rue" value={form.rue} onChange={handleChange} /> 
                    <input placeholder='30XXX' name="codePostal" value={form.codePostal} onChange={handleChange} /> 
                    <input placeholder='ville' name="ville" value={form.ville} onChange={handleChange} /> 
                    <input type='date' name="dateDeNaissance" value={form.dateDeNaissance} onChange={handleChange} />
                    <input placeholder='06XXXXXXXX' name="telephone" value={form.telephone} onChange={handleChange} />
                <div className="btn-row">
                <button onClick={handleSaveProfil}>Enregistrer</button> <button onClick={() => setEnEdition(false)}>Annuler</button></div>
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