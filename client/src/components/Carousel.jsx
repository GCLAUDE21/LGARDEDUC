import React, { useState } from 'react';

const Carousel = () => {

    const [nav, setNav] = useState(0)

    const avis = [
        {name: "Kath Leen",
            avis: "Si vous voulez partir en toute sérénité, c'est elle qui l'a fait appeler !! elle viendra s'occuper de vos animaux comme si c'était les siens. Et ses compétences dans l'éducation sont dingues. elle fait des miracles avec mon chien 🙏 Merci encore Laura"
        },
        
        {name: "Lau Alvrz",
            avis: "Laura a gardé ma terreur durant une petite semaine et tout a été parfait. Nous avons pu partir l’esprit tranquille avec des nouvelles très régulièrement. On y retournera avec plaisir grâce à son professionnalisme! 🐺"
        },
        {name: "Sandrine Cathala",
            avis: "Woofy et moi sommes vraiment heureux de cette belle rencontre tant pour la garde que pour ses conseils en tant qu éducatrice, douce patiente, pédagogue. vraiment vous pouvez y aller les yeux fermés. Woofy et moi allons pouvoir renforcer notre complicité dans la bienveillance de Laura. n'hésitez plus ... Woofy et moi nous ne regrettons pas ❤️🦮"
        },        
    ]
    return (
        <div className='carousel'>
           <button onClick={() => {
            if (nav === 0) {
                return 
            } else {
                setNav(nav -1)
            }
           }} type='button'>{"<"}</button> 
           <div className='visu'>
            <h3>{avis[nav].name}</h3>
            <p>{avis[nav].avis}</p>
            
           </div>
           <button onClick={() => {
            if (nav === avis.length - 1) {
                return 
            } else {
                setNav(nav +1)
            }
           }} type='button'>{">"}</button> 


        </div>
    );
};

export default Carousel;