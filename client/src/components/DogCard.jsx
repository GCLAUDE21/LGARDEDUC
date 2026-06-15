import React from 'react';
import defaultDog from '../assets/img/stylish-black-and-white-dog-illustration-png.webp';

const DogCard = ({dog}) => {    
    const anneeNaissance = new Date(dog.dateDeNaissance).getFullYear()
    const anneeActuelle = new Date().getFullYear()
    const age = anneeActuelle - anneeNaissance



    return (
        <div className="dogcard">
            <div className="photo"><img src={dog.photo ? dog.photo : defaultDog } alt="PHOTO" /></div>
            <div className="infodog">
                <h4>{dog.nom}</h4>
                <span>Age: {age} ans </span>
                <span>{dog.race}</span>
                <h5>Liste des vaccins :</h5>
               <span>{dog.vaccins.map((vaccins) => (
                <ul key={vaccins._id}>
                    <li>{vaccins.nom}</li>
                    {vaccins.date ? <li>Date: {new Date(vaccins.date).toLocaleDateString("fr-FR")}</li> : ""}
                </ul>
               ))}</span>

            </div>
        </div>
    );
};

export default DogCard;