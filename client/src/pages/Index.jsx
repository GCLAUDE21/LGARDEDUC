import React from 'react';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const index = () => {
    return (
        <>
            {/* HERO */}
            <section className="hero">
                <div className="hero-overlay">
                    <h1>L Gard'Educ</h1>
                    <p>Éducatrice canine professionnelle</p>
                </div>
            </section>

            <section className="presentation">

                {/* PRÉSENTATION LAURA */}
                <div className="intro">
                    <div className="left-part">
                        <div className="left-part-container">
                            <h2>Bienvenue chez LGard'Educ !</h2>
                            <p>
                                Je suis Laura, éducatrice canine, pet sitter et gestionnaire de pension canine.
                                Avec LGardEduc, je mets mon expertise et ma passion des chiens au service de votre compagnon à quatre pattes.
                                <br /><br />
                                Mon approche : j'accompagne les chiens et leurs humains avec bienveillance, patience et méthodes positives (renforcement positif).
                                <br /><br />
                                Que ce soit pour résoudre des problèmes de comportement, apprendre les bases de l'éducation ou simplement offrir un cadre sécurisant et stimulant pendant votre absence, chaque chien est considéré selon sa personnalité, son âge et ses besoins spécifiques.
                            </p>
                        </div>
                    </div>
                    <div className="right-part"></div>
                </div>

                {/* MES SERVICES — nouvelle image à gauche */}
                <div className="services">
                    <div className="left-part left-part--services"></div>
                    <div className="right-part">
                        <div className="right-part-container">
                            <h2>Mes services</h2>
                            <p>
                                • Éducation canine : cours particuliers à domicile ou en extérieur, pour chiots comme adultes (propreté, rappel, marche en laisse, gestion des peurs, hyperactivité, etc.)
                                <br /><br />
                                • Pet sitting : gardes à domicile ou visites régulières pour que votre chien reste dans son environnement familier !
                                <br /><br />
                                • Pension canine : un hébergement personnalisé et attentionné en petit effectif, dans un cadre calme et sécurisé avec sorties quotidiennes, jeux et suivi individualisé. Mon objectif est simple : le bien-être de votre chien et la sérénité de sa famille.
                                <br /><br />
                                Que vous ayez besoin d'une éducation solide, d'une garde ponctuelle ou d'un véritable « home away from home » pendant vos vacances, je m'engage à prendre soin de votre fidèle compagnon comme s'il était le mien.
                            </p>
                        </div>
                    </div>
                </div>

                {/* POURQUOI NOUS CHOISIR */}
                <div className="pourquoi">
                    <h2>Pourquoi choisir LGard'Educ ?</h2>
                    <div className="pourquoi-grid">
                        <div className="pourquoi-item">
                            <span className="pourquoi-icon">🐾</span>
                            <h3>Suivi personnalisé</h3>
                            <p>Chaque chien est unique. Laura adapte son approche à la personnalité, l'âge et les besoins spécifiques de votre compagnon pour des résultats durables.</p>
                        </div>
                        <div className="pourquoi-item">
                            <span className="pourquoi-icon">💛</span>
                            <h3>Méthodes positives</h3>
                            <p>Basées sur le renforcement positif, les méthodes utilisées respectent le bien-être de votre chien et renforcent le lien entre lui et sa famille.</p>
                        </div>
                        <div className="pourquoi-item">
                            <span className="pourquoi-icon">🏠</span>
                            <h3>Petit effectif</h3>
                            <p>En pension comme en éducation, Laura travaille en petit groupe pour garantir une attention de qualité et un environnement serein à chaque chien.</p>
                        </div>
                        <div className="pourquoi-item">
                            <span className="pourquoi-icon">📱</span>
                            <h3>Suivi en ligne</h3>
                            <p>Grâce à votre espace personnel sur lgardeduc.fr, suivez en temps réel les comptes rendus de séances, le carnet de bord et les bilans de Laura.</p>
                        </div>
                    </div>
                </div>

                {/* COMMENT ÇA MARCHE */}
                <div className="comment">
                    <h2>Comment ça marche ?</h2>
                    <div className="comment-steps">
                        <div className="comment-step">
                            <span className="step-number">1</span>
                            <h3>Créez votre compte</h3>
                            <p>Inscrivez-vous gratuitement et renseignez votre profil pour que Laura puisse mieux vous connaître.</p>
                        </div>
                        <div className="comment-step-arrow">→</div>
                        <div className="comment-step">
                            <span className="step-number">2</span>
                            <h3>Ajoutez votre chien</h3>
                            <p>Renseignez la fiche de votre compagnon : race, âge, vaccins, alimentation, comportement. Plus c'est complet, mieux Laura peut s'en occuper.</p>
                        </div>
                        <div className="comment-step-arrow">→</div>
                        <div className="comment-step">
                            <span className="step-number">3</span>
                            <h3>Faites votre demande</h3>
                            <p>Soumettez une demande de réservation. Laura l'examine et vous répond par email. Suivez tout depuis votre espace personnel.</p>
                        </div>
                    </div>
                </div>

                {/* LABEL FRANCE PETSITTERS */}
                  <div className="label-section">
                      <img
                          src="/src/assets/img/label_france_petsitters_large-300x300.png"
                          alt="Label France Petsitters"
                          className="label-badge"
                      />
                      <div className="label-text">
                          <h2>Certifiée France Petsitters</h2>
                          <p>
                              Laura est titulaire du label <strong>France Petsitters</strong>, gage de sérieux et de professionnalisme dans la garde d'animaux à domicile. Ce label certifie le respect de normes strictes en matière de bien-être animal et de qualité de service.
                          </p>
                      </div>
                  </div>

                {/* AVIS */}
                <div className="avis">
                    <h2>Ils parlent de nous...</h2>
                    <Carousel />
                </div>

                {/* CTA FINAL */}
                <div className="cta">
                    <h2>Prêt à nous confier votre compagnon ?</h2>
                    <p>Rejoignez la communauté LGard'Educ et offrez à votre chien le meilleur des soins.</p>
                    <div className="cta-buttons">
                        <Link to="/auth" className="cta-btn cta-btn--primary">Créer un compte</Link>
                        <Link to="/contact" className="cta-btn cta-btn--secondary">Nous contacter</Link>
                    </div>
                </div>

            </section>

            <Footer />
        </>
    );
};

export default index;