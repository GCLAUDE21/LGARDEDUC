import React from 'react';
import { Link } from 'react-router-dom';


const header = () => {
    return (
            <header>
                <div className='Menu'>
                    <div className="bouton">
                        <span> ----</span>
                        <span> ----</span>
                        <span> ----</span>
                    </div>
                    <ul>
                        <Link to={"/"} id='indexLi'>Index</Link>
                        <Link to={"/lgardeduc"} id='lgardeducLi'>L Gard'Educ</Link>
                        <Link to={"/Prestations"} id='prestationsLi'>Prestations</Link>
                        <Link to={"/contact"} id='contactLi'>Contact</Link>
                        <Link to={"/reservations"} id='reservationLi'>Mes Réservations</Link >
                        <Link to={"/profil"} id='profilLi'>Mon Profil</Link>
                        <Link to={"/auth"} id='authLi'>Connexion / Déconnexion</Link >
                    </ul>
                </div>
                <div className="logo-big">
                    <h1>L Gard'Educ</h1>
                    <img src="" alt="" />
                </div>

            </header>    
    );
};

export default header;