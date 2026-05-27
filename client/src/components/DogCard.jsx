import React from 'react';

const DogCard = ({dog}) => {    
    const anneeNaissance = new Date(dog.dateDeNaissance).getFullYear()
    const anneeActuelle = new Date().getFullYear()
    const age = anneeActuelle - anneeNaissance



    return (
        <div className="dogcard">
            <div className="photo"><img src={dog.photo ? dog.photo : "https://imgs.search.brave.com/gbDWhEpbP3Vpm0zsPo7jlP-qMWr0XKniT-kYOrI9lVU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTIv/NjU3LzQxNy9zbWFs/bC9zdHlsaXNoLWJs/YWNrLWFuZC13aGl0/ZS1kb2ctaWxsdXN0/cmF0aW9uLXBuZy5w/bmc" } alt="PHOTO" /></div>
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