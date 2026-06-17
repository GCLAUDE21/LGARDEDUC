import React, { useEffect, useState } from 'react';
import ResaCard from '../components/ResaCard';
import Loader from '../components/Loader';


const Reservation = () => {
        const API_URL = import.meta.env.VITE_API_URL;
        const tokenUser = localStorage.getItem('token');
        const [resasUser, setResasUser] = useState([]);
        const [chiensUser, setChiensUser] = useState([]);
        
        const [type, setType] = useState('pension');
        const [dateDebut, setDateDebut] = useState("");
        const [dateFin, setDateFin] = useState("");
        const [notes, setNotes] = useState("");
        const [dog, setDog] = useState([]);
        const [erreurBilan, setErreurBilan] = useState([]);
        const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const resaUserFetch = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/reservations`, {
                    method: "get",
                        headers: {
                            Authorization: `Bearer ${tokenUser}`
                        }
                })
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                    
                } 
                const data = await response.json()

                setResasUser(data);



            }catch (err) {
            console.log(err);
        } finally {setLoading(false);
                }
        }
        resaUserFetch();
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

        const handleCreateResa = () => {

            if (type === "pension" || type === "education" && dog.length === 0) {
                setErreurBilan(["Vous devez séléctionner au moins un chien"])
            return;
            }
            
            if (!dateDebut) {
                setErreurBilan(["Merci de selectionner une date"])
            return;
            }

            if ((type === "pension" || type === "pet sitting") && !dateFin) {
                setErreurBilan(["Merci de selectionner une date de fin"])
            return;
            }

            if (type === "pension") {
                const sansBilan = dog.filter(d => !d.bilan);
                if (sansBilan.length > 0) {
                    setErreurBilan(
                        sansBilan.map((dog) => (
                            dog.nom + " doit faire un bilan comportemental."
                        ))
                    )
                    return;
                }
            }
            const resaCreateFetch = async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/reservations`, {
                    method: "post",
                    body: JSON.stringify({"type": type, "dateDebut": dateDebut, "dateFin": dateFin, "notes": notes, "dog": dog.map(d => d._id)  }),
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${tokenUser}`
                        }
                })
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                    
                } 
                const data = await response.json()

                setResasUser([...resasUser,data]);



            }catch (err) {
            console.log(err);
        } 
            
        }

        resaCreateFetch();
        }
    if (loading) return <Loader />;
    return (
        <section className='reservations'>
            <div className="mes-reservations">
                <h2>Mes reservations</h2>
                {resasUser.map((resa) => (
                    < ResaCard key={resa._id} resa={resa} />
                ))}
            </div>
            <div className="new-reservation">
                <h2>Nouvelle reservation</h2>
                <form >
                    <label htmlFor='type' > Type de réservation :</label>
                    <select id='type' onChange={(e) => setType(e.target.value)}>
                         <option value="pension">Pension</option>
                         <option value="pet sitting">Pet Sitting</option>
                         <option value="education">Education</option>
                    </select>
                    
                    
                    <label htmlFor="dateDebut">Date</label>
                    <input style={{ borderColor: !dateDebut ? "darkred" : "green" }} onChange={(e) => setDateDebut(e.target.value)} id='dateDebut' type="date" />

                    { type == "pension" && 
                    <>
                    <label htmlFor="dateFin">Date de Fin</label>
                    <input style={{ borderColor: !dateFin ? "darkred" : "green" }} onChange={(e) => setDateFin(e.target.value)} id='dateFin' type="date" min={dateDebut} />
                    <label htmlFor="dog">Pour :</label>
                    <div className="chiensResa">
                        <select style={{ borderColor: dog.length === 0 ? "darkred" : "green" }} value="" onChange={(e) => {
                            const chienChoisi = chiensUser.find(c => c._id === e.target.value)
                            if (chienChoisi && !dog.find(d => d._id === chienChoisi._id)) {setDog([...dog, chienChoisi])
                            } 
                        }}  id="dog">
                            <option value="" disabled>Choisissez au moins un chien</option>
                        {chiensUser.map((dog) =>  (
                            <option key={dog._id} value={dog._id}>{dog.nom}</option>
                        ))}                       
                    </select>
                        </div>
                        <div className="chiensChoisis">
                            {dog.map((chien, index) => (
                                <span key={index}>
                                    {chien.nom}
                                    <button type='button' onClick={() => setDog(dog.filter((_, i) => i !== index))}>x</button>
                                </span>
                            ))}
                        </div>
                    
                    </>
                    }

                    { type == "pet sitting" && 
                    <>
                    <label htmlFor="dateFin">Date de Fin</label>
                    <input style={{ borderColor: !dateFin ? "darkred" : "green" }} onChange={(e) => setDateFin(e.target.value)} id='dateFin' type="date" min={dateDebut} />
                    
                    </>
                    }
                    { type == "education" && 
                    <>
                    <label htmlFor="dog">Pour :</label>
                    <div className="chiensResa">
                        <select style={{ borderColor: dog.length === 0 ? "darkred" : "green" }} value="" onChange={(e) => {
                            const chienChoisi = chiensUser.find(c => c._id === e.target.value) 
                            if (chienChoisi && !dog.find(d => d._id === chienChoisi._id)) {setDog([...dog, chienChoisi])
                            }  
                        }}  id="dog">
                            <option value="" disabled>Choisissez au moins un chien</option>
                        {chiensUser.map((dog) =>  (
                            <option key={dog._id} value={dog._id}>{dog.nom}</option>
                        ))}                       
                    </select>
                        </div>
                        <div className="chiensChoisis">
                            {dog.map((chien, index) => (
                                <span key={index}>
                                    {chien.nom}
                                    <button type='button' onClick={() => setDog(dog.filter((_, i) => i !== index))}>x</button>
                                </span>
                            ))}
                        </div>
                    
                    </>
                    }

                    <label htmlFor="notes">Notes</label>
                    <textarea placeholder='Merci de donner des indications sur vos attentes' onChange={(e) => setNotes(e.target.value)} value={notes}  id="notes"></textarea>

                    {erreurBilan.map((msg, index) => (
                        <p style={{color: "red"}} key={index}>{msg}</p>
                    ))}

                    <button onClick={() => handleCreateResa()} type='button'>Valider la demande de réservation</button>                    



                </form>
            </div>

        </section>
    );
};

export default Reservation;