import React, { useEffect, useState } from 'react';
import ResaCard from '../components/ResaCard';


const Reservation = () => {
        const API_URL = import.meta.env.VITE_API_URL;
        const tokenUser = localStorage.getItem('token');
        const [resasUser, setResasUser] = useState([]);



    

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
        } 
            
        }

        resaUserFetch();
    }, [])

    return (
        <section className='reservations'>
            <div className="mes-reservations">
                <h2>Mes reservations</h2>
                {resasUser.map((resa) => (
                    < ResaCard key={resa._id} resa={resa} />
                ))}
            </div>

        </section>
    );
};

export default Reservation;