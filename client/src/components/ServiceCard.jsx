import React from 'react';

const ServiceCard = ({service}) => {
    return (
        <div className='service'>
            <img src={service.image} alt="Photo" />
            <h3>
            {service.type}
            </h3>
            <p>{service.description}</p>

            <span>Tarif : {service.prix}€ par {service.unite}</span>

        </div>
    );
};

export default ServiceCard;