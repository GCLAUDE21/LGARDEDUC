import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {

    const [menu, setMenu] = useState(false)

    return (
        <header>
                <div className='Menu-container'>
                    <div className="bouton" onClick={() => setMenu(!menu)}>
                        <span> ----</span>
                        <span> ----</span>
                        <span> ----</span>
                    </div>
                    <div  className={ menu ? "menu-open" : "menu-close"}>
                    <ul>
                        <Link to={"/"} id='indexLi'>Index</Link>
                        <Link to={"/lgardeduc"} id='lgardeducLi'>L Gard'Educ</Link>
                        <Link to={"/prestations"} id='prestationsLi'>Prestations</Link>
                        <Link to={"/contact"} id='contactLi'>Contact</Link>
                        <Link to={"/reservations"} id='reservationLi'>Mes Réservations</Link >
                        <Link to={"/profil"} id='profilLi'>Mon Profil</Link>
                        <Link to={"/auth"} id='authLi'>Connexion / Déconnexion</Link >
                    </ul>
                    </div>
                </div>
                <div className="banniere">
                    <div className="logo"></div>
                    <h1>L Gard'Educ</h1>
                </div>

            </header>    
    );
};

export default Header;