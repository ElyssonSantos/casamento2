import React, { useState } from 'react';
import './Gallery.css';

import imgHands from '../../assets/1.jpg';
import imgCasal from '../../assets/casal.jpg';
import imgWalking from '../../assets/2.jpg';
import imgSunset from '../../assets/3.jpg';
import imgDecor from '../../assets/4.jpg';
import imgNew from '../../assets/5.jpg';

const images = [
    { src: imgHands, alt: "Mãos e alianças" },
    { src: imgCasal, alt: "O Casal" },
    { src: imgWalking, alt: "Caminhando juntos" },
    { src: imgSunset, alt: "Pôr do sol" },
    { src: imgDecor, alt: "Detalhes da decoração" },
    { src: imgNew, alt: "Momento feliz" },
    // Only using local reliable images now to prevent loading issues
];

const Gallery = () => {
    // State to track error images to switch UI
    const [failedImages, setFailedImages] = useState({});

    const handleImageError = (index) => {
        setFailedImages(prev => ({ ...prev, [index]: true }));
    };

    return (
        <section className="gallery section-padding" id="galeria">
            <div className="container">
                <h2 className="section-title text-center">Momentos Felizes</h2>

                <div className="gallery-scroll-container">
                    {images.map((img, index) => (
                        <div key={index} className="gallery-card">
                            {failedImages[index] ? (
                                <div className="gallery-fallback">
                                    <span className="fallback-icon">❤️</span>
                                </div>
                            ) : (
                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="lazy"
                                    onError={() => handleImageError(index)}
                                    // Ensure it doesn't wait for desktop events
                                    draggable="false"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;

