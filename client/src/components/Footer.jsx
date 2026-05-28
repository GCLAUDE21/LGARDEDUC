import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__brand">
                <div className="footer__logo" />
                <p className="footer__name">L <span>Gard'Educ</span></p>
                <p className="footer__subtitle">Éducatrice canine professionnelle</p>
            </div>
            
            <div className="middle-div">
                <div className="footer__contact">
                <p className="footer__section-label">Contact</p>
                <p>23 rue des Magnolias</p>
                <p>30200 Bagnols-sur-Cèze</p>
                <a href="tel:0634281568">06 34 28 15 68</a>
                <a href="mailto:lgardeduc@gmail.com">lgardeduc@gmail.com</a>
            </div>

            <div className="footer__social">
                <p className="footer__section-label">Suivez-nous</p>
                <a href="https://www.facebook.com/LGardEduc" target="_blank" rel="noreferrer">
                    Facebook
                </a>
                <a href="https://www.instagram.com/laura_lgardeduc?igsh=NjYxdDR1MGl3aHdi" target="_blank" rel="noreferrer">
                    Instagram
                </a>
            </div>
            </div>

            

            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} L Gard'Educ. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;