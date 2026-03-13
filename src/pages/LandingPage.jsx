import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero/Hero';
import History from '../components/History/History';
import EventDetails from '../components/EventDetails/EventDetails';
import ImportantInfo from '../components/ImportantInfo/ImportantInfo';
import PhrasesCarousel from '../components/PhrasesCarousel/PhrasesCarousel';
import Gallery from '../components/Gallery/Gallery';
import Social from '../components/Social/Social';
import RSVPModal from '../components/RSVPModal/RSVPModal';
import GiftDrawer from '../components/Gift/GiftDrawer';
import GiftSection from '../components/Gift/GiftSection';
import Countdown from '../components/Countdown/Countdown';

import '../styles/global.css';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';

function LandingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // 🎵 REFERÊNCIA DO ÁUDIO
    const audioRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openGiftDrawer = () => setIsGiftDrawerOpen(true);
    const closeGiftDrawer = () => setIsGiftDrawerOpen(false);

    // Scroll Animation Observer
    useEffect(() => {
        if (isLoading) return;

        const handleScroll = () => {
            if (window.scrollY > 500) {
                setShowFloatingBtn(true);
            } else {
                setShowFloatingBtn(false);
            }

            const reveals = document.querySelectorAll('.reveal, .reveal-on-scroll');

            for (let i = 0; i < reveals.length; i++) {
                const windowHeight = window.innerHeight;
                const elementTop = reveals[i].getBoundingClientRect().top;
                const elementVisible = 150;

                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add('active');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    // 🎵 MÚSICA DEFINITIVA (APÓS LOADING)
    useEffect(() => {
        if (isLoading) return;

        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.3;
        audio.loop = true;
        audio.muted = true; // Sempre começa mudo para permitir autoplay

        const startAudio = () => {
            // Apenas tenta tocar se o áudio estiver pausado ou não tiver sido iniciado
            if (audio.paused) {
                audio.muted = false; // Desmuta no primeiro toque
                audio.play().catch(error => {
                    console.error("Erro ao tentar reproduzir áudio:", error);
                });
            }
            // Remove os listeners após a primeira interação bem-sucedida
            document.removeEventListener("click", startAudio);
            document.removeEventListener("touchstart", startAudio);
        };

        // Adiciona listeners para iniciar o áudio na primeira interação
        document.addEventListener("click", startAudio);
        document.addEventListener("touchstart", startAudio);

        return () => {
            document.removeEventListener("click", startAudio);
            document.removeEventListener("touchstart", startAudio);
        };
    }, [isLoading]);

    // Swipe Handler
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;

        if (isLeftSwipe && !isGiftDrawerOpen && !isModalOpen) {
            openGiftDrawer();
        }
    };

    if (isLoading) {
        return <LoadingScreen onComplete={() => setIsLoading(false)} />;
    }

    return (
        <div
            className="landing-page"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >

            {/* 🎵 PLAYER INVISÍVEL */}
            <audio
                ref={audioRef}
                src="https://res.cloudinary.com/dedtkwg0m/video/upload/v1771269005/WhatsApp_Audio_2026-01-09_at_16.12.21_d1l2mg_uuu7pi.mp3"
                preload="auto"
            />

            <Hero onRSVP={openModal} />

            <div className="reveal">
                <Countdown />
            </div>

            <div className="reveal">
                <History />
            </div>

            <div className="reveal">
                <EventDetails />
            </div>

            <div className="reveal">
                <PhrasesCarousel />
            </div>

            <div className="reveal">
                <ImportantInfo />
            </div>

            <div className="reveal">
                <Gallery />
            </div>

            <div className="reveal">
                <GiftSection onOpenDrawer={openGiftDrawer} />
            </div>

            <div className="reveal">
                <Social />
            </div>

            <RSVPModal isOpen={isModalOpen} onClose={closeModal} />
            <GiftDrawer isOpen={isGiftDrawerOpen} onClose={closeGiftDrawer} />

            <div className="floating-buttons-container">
                <button
                    className={`btn-gift-floating ${showFloatingBtn ? 'visible' : ''}`}
                    onClick={openGiftDrawer}
                >
                    Área de Presentes 🎁
                </button>

                <button
                    className={`floating-rsvp ${showFloatingBtn ? 'visible' : ''}`}
                    onClick={openModal}
                >
                    Confirmar Presença
                </button>
            </div>

            <style>{`
                .floating-buttons-container {
                    z-index: 99;
                }
                .floating-rsvp {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background-color: var(--color-gold);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 50px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    font-weight: bold;
                    z-index: 99;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.4s ease;
                }
                .floating-rsvp.visible {
                    transform: translateY(0);
                    opacity: 1;
                }
                .floating-rsvp:hover {
                    transform: translateY(-5px);
                    background-color: #d4ac61;
                }
            `}</style>

        </div>
    );
}

export default LandingPage;