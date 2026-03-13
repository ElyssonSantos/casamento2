import React, { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero/Hero';
import History from '../components/History/History';
import EventDetails from '../components/EventDetails/EventDetails';
import ImportantInfo from '../components/ImportantInfo/ImportantInfo';
import PhrasesCarousel from '../components/PhrasesCarousel/PhrasesCarousel';
import Gallery from '../components/Gallery/Gallery';
import Social from '../components/Social/Social';
import RSVPModal from '../components/RSVPModal/RSVPModal';
import GiftSection from '../components/Gift/GiftSection';
import Countdown from '../components/Countdown/Countdown';

import { Play, Pause, Volume2, VolumeX, Plus, Minus } from 'lucide-react';

import '../styles/global.css';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import { useLocation, useNavigate } from 'react-router-dom';

function LandingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeControls, setShowVolumeControls] = useState(false);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // 🎵 REFERÊNCIA DO ÁUDIO
    const audioRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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

    // Scroll Animation Observer (Removida a auto-abertura pois agora é uma página própria)

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

        // Update local state when audio starts/stops
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);

        return () => {
            document.removeEventListener("click", startAudio);
            document.removeEventListener("touchstart", startAudio);
        };
    }, [isLoading]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = isMuted ? 0 : volume;
            audio.muted = isMuted;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    };

    const increaseVolume = () => setVolume(prev => Math.min(prev + 0.1, 1));
    const decreaseVolume = () => setVolume(prev => Math.max(prev - 0.1, 0));
    const toggleMute = () => setIsMuted(!isMuted);

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

        if (isLeftSwipe && !isModalOpen) {
            navigate('/gifts');
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
                <GiftSection />
            </div>

            <Social />

            <RSVPModal isOpen={isModalOpen} onClose={closeModal} />

            <div className="floating-buttons-container">
                {/* Audio Controls */}
                <div className={`audio-floating-controls ${showFloatingBtn ? 'visible' : ''}`}>
                    <button className="audio-main-btn" onClick={togglePlay}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    
                    <div className="volume-group">
                        <button className="audio-sub-btn" onClick={toggleMute}>
                            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <div className="volume-sliders">
                            <button className="vol-step" onClick={decreaseVolume}><Minus size={14} /></button>
                            <span className="vol-pct">{Math.round(volume * 100)}%</span>
                            <button className="vol-step" onClick={increaseVolume}><Plus size={14} /></button>
                        </div>
                    </div>
                </div>

                <button
                    className={`btn-gift-floating ${showFloatingBtn ? 'visible' : ''}`}
                    onClick={() => navigate('/gifts')}
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

                .audio-floating-controls {
                    position: fixed;
                    bottom: 30px;
                    left: 30px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 100;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.4s ease;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 8px 15px;
                    border-radius: 50px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(197, 160, 89, 0.3);
                }
                .audio-floating-controls.visible {
                    transform: translateY(0);
                    opacity: 1;
                }
                .audio-main-btn {
                    background: var(--color-green);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .audio-main-btn:hover {
                    transform: scale(1.1);
                    filter: brightness(1.1);
                }
                .volume-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-left: 1px solid #eee;
                    padding-left: 10px;
                }
                .audio-sub-btn {
                    background: none;
                    color: var(--color-green);
                    padding: 5px;
                    display: flex;
                    align-items: center;
                }
                .volume-sliders {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background: #f5f5f5;
                    padding: 2px 8px;
                    border-radius: 20px;
                }
                .vol-step {
                    background: none;
                    color: #666;
                    display: flex;
                    align-items: center;
                    padding: 2px;
                }
                .vol-step:hover {
                    color: var(--color-green);
                }
                .vol-pct {
                    font-size: 11px;
                    min-width: 30px;
                    text-align: center;
                    font-family: var(--font-body);
                    color: #444;
                }

                @media (max-width: 600px) {
                    .audio-floating-controls {
                        left: 20px;
                        bottom: 90px;
                    }
                    .volume-sliders {
                        display: none;
                    }
                }
            `}</style>

        </div>
    );
}

export default LandingPage;