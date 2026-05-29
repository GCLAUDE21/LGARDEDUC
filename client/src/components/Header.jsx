import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { FiUser, FiGrid, FiMail, FiCalendar, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaDog } from 'react-icons/fa';

const Header = () => {
    const [menu, setMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
    const handleClickOutside = (e) => {
        if (!e.target.closest('.Menu-container')) {
            setMenu(false);
        }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
}, []);

    const tokenUser = localStorage.getItem("token");

       const [dataUser, setDataUser] = useState({})
    
        useEffect( () => {
            const fetchUser = async () => {
                try {                 
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
                    <Link className={location.pathname === "/" ? "active" : "" } onClick={() => setMenu(false)} to="/"> <AiOutlineHome /> Index</Link>
                    <Link className={location.pathname === "/prestations" ? "active" : "" } onClick={() => setMenu(false)} to="/prestations"> <FiGrid /> Prestations</Link>
                    <Link className={location.pathname === "/contact" ? "active" : "" } onClick={() => setMenu(false)} to="/contact"> <FiMail /> Contact</Link>
                   { tokenUser && <Link className={location.pathname === "/reservations" ? "active" : "" } onClick={() => setMenu(false)} to="/reservations"> <FiCalendar /> Mes Réservations</Link>}
                   { tokenUser && <Link className={location.pathname === "/profil" ? "active" : "" } onClick={() => setMenu(false)} to="/profil"> <FaDog /> Mon Profil</Link>}
                    { !tokenUser && <Link className={location.pathname === "/auth" ? "active" : "" } onClick={() => setMenu(false)} to="/auth"> <FiLogOut /> Authentification</Link>}
                { tokenUser && <div className="user-card">
                    <span className="user-pseudo">{dataUser.pseudo}</span>
                    <FiLogOut onClick={() => {
                    localStorage.removeItem("token");
                navigate('/');}}  className='logout-icon' />
                
                </div>}
                </ul>
                
                


            </div>
        </header>
    );
};

export default Header;