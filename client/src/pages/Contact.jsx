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
                    body: JSON.stringify({"nom": name, "objet": objet, "message": message, "mail": mail, "tel": num}),
                })
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }

                const data = await response.json();

                setSuccess(true)



            } catch (err) {
                console.log("Erreur lors de l'envoie du message");
            }
        };
        fetchMessage()
        
    };



    return (
        <section className='contact'>
            <div className="container">
                <h2>Contact</h2>
                <form>
                    <label htmlFor="nom">Votre nom :</label>
                    <input onChange={(e) => setName(e.target.value)}  id='nom' type="text" />
                    <label htmlFor="tel">Votre numéro</label>
                    <input onChange={(e) => setNum(e.target.value)} placeholder='06XXXXXXXX' id='tel' type="text" />
                    <label htmlFor="email">Votre Mail</label>
                    <input onChange={(e) => setMail(e.target.value)} placeholder='votre@mail.fr' id='email' type="text" />
                    <label htmlFor="objet">Objet du Message</label>
                    <input onChange={(e) => setObjet(e.target.value)} id='objet' placeholder='Motif de votre message' type="text" />
                    <label htmlFor="message">Votre message</label>
                    <textarea onChange={(e) => setMessage(e.target.value)} placeholder='Ecrivez votre message' id='message' type="text" />
                    <button onClick={() => handleSend()} type='button'>Envoyer le message</button>
                   {success && <p>Message Envoyé !</p> } 

                </form>
            </div>
        </section>
    );
};

export default Contact;