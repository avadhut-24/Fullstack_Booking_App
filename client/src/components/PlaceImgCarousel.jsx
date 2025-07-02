import React from 'react'
import {Carousel} from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'


const MyCarousel = ({ place }) => {
    return (
        <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            interval={3000}
            showStatus={false}
        >
            { 
                place.photosPURLs.map((photo, index) => (
                    <div key={index}>
                        <img src={photo} alt={`Slide ${index + 1}`} />
                        
                    </div>
                ))
            }
        </Carousel>
    );
};

export default MyCarousel;