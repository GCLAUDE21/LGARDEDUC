import React, { useEffect, useState} from 'react';
import { Link } from "react-router-dom";


const prestations = () => {
const [services, setServices] = useState([]);

useEffect(() => {
    const fetchServices = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            
            const response = await fetch(`${API_URL}/api/service`);

            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const data = await response.json();
            setServices(data);
            console.log("✅ Services récupérés :", data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services :", error);
        }
    };

    fetchServices();
}, []);
    

    return (
        <div>
            <h1>PRESTATIONS</h1>
        </div>
    );
};

export default prestations;