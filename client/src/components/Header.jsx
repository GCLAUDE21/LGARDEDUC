import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {FiLogOut} from 'react-icons/fi';

const Header = () => {
    const [menu, setMenu] = useState(false);

    const tokenUser = localStorage.getItem("token");

    return (
        <header className={menu ? 'menu-open' : 'menu-close'}>
            <div className='Menu-container'>

                <div className="bouton">
                    <button
                        className={`hamburger hamburger--spin ${menu ? 'is-active' : ''}`}
                        type="button"
                        onClick={() => setMenu(!menu)}
                    >
                        <span className="hamburger-box">
                            <span className="hamburger-inner"></span>
                        </span>
                    </button>
                </div>

                <div className="logo"></div>

                <ul>
                    <Link onClick={() => setMenu(false)} to="/">Index</Link>
                    <Link onClick={() => setMenu(false)} to="/lgardeduc">L Gard'Educ</Link>
                    <Link onClick={() => setMenu(false)} to="/prestations">Prestations</Link>
                    <Link onClick={() => setMenu(false)} to="/contact">Contact</Link>
                   { tokenUser && <Link onClick={() => setMenu(false)} to="/reservations">Mes Réservations</Link>}
                   { tokenUser && <Link onClick={() => setMenu(false)} to="/profil">Mon Profil</Link>}
                    { !tokenUser && <Link onClick={() => setMenu(false)} to="/auth">Authentification</Link>}
                { tokenUser && <FiLogOut onClick={() => {
                    localStorage.removeItem("token");
                window.location.reload()}}  className='logout-icon' />}
                </ul>


            </div>
        </header>
    );
};

export default Header;