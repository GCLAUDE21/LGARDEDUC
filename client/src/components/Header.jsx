import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineHome } from 'react-icons/ai';
import { FiGrid, FiMail, FiCalendar, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaDog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
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
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isConnected = !!user;
    const isAdmin = user?.admin || false;

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
                    <Link className={location.pathname === "/" ? "active" : ""} onClick={() => setMenu(false)} to="/"><AiOutlineHome /> Index</Link>
                    <Link className={location.pathname === "/prestations" ? "active" : ""} onClick={() => setMenu(false)} to="/prestations"><FiGrid /> Prestations</Link>
                    <Link className={location.pathname === "/contact" ? "active" : ""} onClick={() => setMenu(false)} to="/contact"><FiMail /> Contact</Link>
                    {isConnected && <Link className={location.pathname === "/profil" ? "active" : ""} onClick={() => setMenu(false)} to="/profil"><FaDog /> Mon Profil</Link>}
                    {isConnected && <Link className={location.pathname === "/reservations" ? "active" : ""} onClick={() => setMenu(false)} to="/reservations"><FiCalendar /> Mes Réservations</Link>}
                    {!isConnected && <Link className={location.pathname === "/auth" ? "active" : ""} onClick={() => setMenu(false)} to="/auth"><FiLogOut /> Authentification</Link>}
                    {isAdmin && (
                        <Link className={location.pathname === "/admin" ? "active" : ""} onClick={() => setMenu(false)} to="/admin">
                            <FiSettings /> Administration
                        </Link>
                    )}
                    {isConnected && (
                        <div className="user-card">
                            <span className="user-pseudo">{user.pseudo}</span>
                            <FiLogOut onClick={handleLogout} className='logout-icon' />
                        </div>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Header;