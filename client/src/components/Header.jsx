import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {

    const [menu, setMenu] = useState(false)

    return (
        <header>
                <div className='Menu-container'>
                    <div className="bouton">
                    <button className={`hamburger hamburger--spin ${menu ? 'is-active' : ''}`} type="button" onClick={() => setMenu(!menu)}>
  <span className="hamburger-box">
    <span className="hamburger-inner"></span>
  </span>
</button>
                    </div>
                    <div  className={ menu ? "menu-open" : "menu-close"}>
                    <ul>
                        <Link onClick={() => setMenu(false)} to={"/"} id='indexLi'>Index</Link>
                        <Link onClick={() => setMenu(false)} to={"/lgardeduc"} id='lgardeducLi'>L Gard'Educ</Link>
                        <Link onClick={() => setMenu(false)} to={"/prestations"} id='prestationsLi'>Prestations</Link>
                        <Link onClick={() => setMenu(false)} to={"/contact"} id='contactLi'>Contact</Link>
                        <Link onClick={() => setMenu(false)} to={"/reservations"} id='reservationLi'>Mes Réservations</Link >
                        <Link onClick={() => setMenu(false)} to={"/profil"} id='profilLi'>Mon Profil</Link>
                        <Link onClick={() => setMenu(false)} to={"/auth"} id='authLi'>Connexion / Déconnexion</Link >
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