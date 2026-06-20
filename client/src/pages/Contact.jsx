import React, { useState } from 'react';

const Contact = () => {
    const [name, setName] = useState("");
    const [num, setNum] = useState("");
    const [mail, setMail] = useState("");
    const [objet, setObjet] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSend = () => {
        const fetchMessage = async () => {
            try {
                const response = await fetch(`${API_URL}/api/contact`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({ "nom": name, "objet": objet, "message": message, "mail": mail, "tel": num }),
                });
                if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
                setSuccess(true);
                setName("");
                setNum("");
                setMail("");
                setObjet("");
                setMessage("");
            } catch (err) {
                console.log("Erreur lors de l'envoi du message");
            }
        };
        fetchMessage();
    };

    return (
        <section className='contact'>

            {/* Intro */}
            <div className="contact-intro">
                <h2>Nous contacter</h2>
                <p>
                    Vous avez une question sur nos services, vous souhaitez obtenir plus d'informations ou simplement prendre contact avec Laura ? Remplissez le formulaire ci-dessous et nous vous répondrons dans les meilleurs délais.
                </p>
                <div className="contact-intro-notices">
                    <div className="intro-notice">
                        <h4>📋 Demande de réservation</h4>
                        <p>Pour toute demande de réservation, connectez-vous à votre espace personnel et utilisez la section "Mes réservations" afin que Laura puisse traiter votre demande efficacement.</p>
                    </div>
                    <div className="intro-notice">
                        <h4>💬 Autre question</h4>
                        <p>Pour toute autre question, renseignement sur nos tarifs ou pour faire connaissance, n'hésitez pas à nous écrire via ce formulaire.</p>
                    </div>
                </div>
                <p className="contact-intro-notice">
                    Laura s'engage à vous répondre <strong>sous 48h</strong>. Pour les urgences, privilégiez le contact téléphonique.
                </p>
            </div>

            {/* Formulaire */}
            <div className="contact-form-container">
                <form>
                    <label htmlFor="nom">Votre nom</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} id='nom' type="text" placeholder="Jean Dupont" />

                    <label htmlFor="tel">Votre numéro de téléphone</label>
                    <input value={num} onChange={(e) => setNum(e.target.value)} placeholder='06XXXXXXXX' id='tel' type="text" />

                    <label htmlFor="email">Votre adresse email</label>
                    <input value={mail} onChange={(e) => setMail(e.target.value)} placeholder='votre@mail.fr' id='email' type="text" />

                    <label htmlFor="objet">Objet du message</label>
                    <input value={objet} onChange={(e) => setObjet(e.target.value)} id='objet' placeholder='Motif de votre message' type="text" />

                    <label htmlFor="message">Votre message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Écrivez votre message ici...' id='message' />

                    {success && (
                        <p className="contact-success">
                            ✅ Votre message a bien été envoyé ! Laura vous répondra dans les meilleurs délais.
                        </p>
                    )}

                    <button onClick={handleSend} type='button'>Envoyer le message</button>
                </form>
            </div>
        </section>
    );
};

export default Contact;