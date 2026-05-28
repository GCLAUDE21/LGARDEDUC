import React, { useEffect, useState } from 'react';
import DogCard from '../components/DogCard';

const Profil = () => {

    const [addDog, setAddDog] = useState(false)
    const [dataUser, setDataUser] = useState({})
    const [chiensUser, setChiensUser] = useState([])
    const tokenUser = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL;

    const [nameDog, setNameDog] = useState("");
    const [datDog, setDateDog] = useState("");
    const [raceDog, setRaceDog] = useState("");
    const [photoDog, setPhotoDog] = useState("");

    const handleAddDog = async () => {
        try {
            const response = await fetch (`${API_URL}/api/dogs`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenUser}`,},
                    method: "POST",
                    body: JSON.stringify({"nom": nameDog, "dateDeNaissance": datDog, "race": raceDog, "photo": photoDog}),
                    
                });
                if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            window.location.reload()
                } catch (err) {
                console.error("Erreur lors de l'ajout du chien", err)
            } 
            };

    useEffect( () => {
        const fetchUser = async () => {
            try {
                const response = await fetch (`${API_URL}/api/user/profil`, {
                    method: "get",
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    }});
                    if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                } 
                const json = await response.json()
                setDataUser(json);

                                
                
            } catch (err) {
                console.log(err);
                
            }
        }

        fetchUser()

    }, [])

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/dogs`, {
                    method: "get",
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    }});
                    if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                } 
                const json = await response.json()
                setChiensUser(json);  
                  
            } catch (err) {
                console.log(err)
            }

        }
        fetchDogs()
    }, [])

    return (
        <section className='profil'>
            <div className="entete">
            <h2>{dataUser.pseudo}</h2>
            <span>{dataUser.email}</span>
            </div>
            <div className="chiens">
            <h3> {chiensUser.length > 1 ? "Mes chiens" : "Mon chien"}</h3>
            {chiensUser.map((dog) => (
                < DogCard key={dog._id} dog={dog}  />
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