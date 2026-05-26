import React, { useEffect, useState } from 'react';

const Profil = () => {

    const [dataUser, setDataUser] = useState({})

    useEffect( () => {
        const fetchUser = async () => {
            try {
                const tokenUser = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL;
    
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

    return (
        <div>
            <h3>PROFIL</h3>
            <h4>{dataUser.pseudo}</h4>
            <span>{dataUser.email}</span>
            <span>{dataUser.admin && "Administrateur"}</span>
        </div>
    );
};

export default Profil;