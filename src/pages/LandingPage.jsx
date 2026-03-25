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

import { Play, Pause, Volume2, VolumeX, Plus, Minus, Music, X } from 'lucide-react';

import '../styles/global.css';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import { useLocation, useNavigate } from 'react-router-dom';

function LandingPage({ fontSize, isBold, updateAccessibility }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(() => {
        // Only show loading screen once per session
        return !sessionStorage.getItem('siteLoaded');
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeControls, setShowVolumeControls] = useState(false);
    const [isAudioExpanded, setIsAudioExpanded] = useState(false);

    // ACESSIBILIDADE UI
    const [showAccessibility, setShowAccessibility] = useState(false);

    const toggleBold = () => {
        updateAccessibility(undefined, !isBold);
    };

    const changeFontSize = (delta) => {
        const newSize = Math.max(80, Math.min(150, fontSize + delta));
        updateAccessibility(newSize, undefined);
    };

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // DRAG STATES PARA AUDIO
    const [audioPos, setAudioPos] = useState({ x: 0, y: 0 });
    const isDraggingAudio = useRef(false);
    const audioDragStart = useRef({ x: 0, y: 0 });

    const handleAudioDragStart = (e) => {
        // Prevent swipe behavior when interacting with audio control
        e.stopPropagation();
        
        isDraggingAudio.current = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        audioDragStart.current = {
            startX: clientX - audioPos.x,
            startY: clientY - audioPos.y
        };
    };

    useEffect(() => {
        const handleAudioDragMove = (e) => {
            if (!isDraggingAudio.current) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            if (e.touches && e.cancelable) {
                e.preventDefault(); 
            }

            setAudioPos({
                x: clientX - audioDragStart.current.startX,
                y: clientY - audioDragStart.current.startY
            });
        };

        const handleAudioDragEnd = () => {
            isDraggingAudio.current = false;
        };

        window.addEventListener('mousemove', handleAudioDragMove, { passive: false });
        window.addEventListener('mouseup', handleAudioDragEnd);
        window.addEventListener('touchmove', handleAudioDragMove, { passive: false });
        window.addEventListener('touchend', handleAudioDragEnd);

        return () => {
            window.removeEventListener('mousemove', handleAudioDragMove);
            window.removeEventListener('mouseup', handleAudioDragEnd);
            window.removeEventListener('touchmove', handleAudioDragMove);
            window.removeEventListener('touchend', handleAudioDragEnd);
        };
    }, []);

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
        // If it starts on the right handle OR anywhere if we want to keep some swipe
        // but the user asked to restrict it to specific buttons AND a right handle icon.
        
        const isRightHandle = e.target.closest('.gift-swipe-handle');
        
        if (e.target.closest('.gallery-scroll-container') || e.target.closest('.embla') || e.target.closest('.audio-floating-controls')) {
            setTouchStart(null);
            return;
        }

        if (!isRightHandle) {
            setTouchStart(null);
            return;
        }

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
        return <LoadingScreen onComplete={() => {
            sessionStorage.setItem('siteLoaded', 'true');
            setIsLoading(false);
        }} />;
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

            {/* Accessibility Button */}
            <div className={`accessibility-control ${showFloatingBtn ? 'visible' : ''}`}>
                <button 
                    className="accessibility-toggle-btn" 
                    onClick={() => setShowAccessibility(!showAccessibility)}
                    title="Acessibilidade"
                >
                    <img src="https://img.icons8.com/ios-filled/50/ffffff/gloves.png" alt="Acessibilidade" style={{width: '24px', height: '24px'}} />
                </button>
                
                {showAccessibility && (
                    <div className="accessibility-menu">
                        <div className="menu-header">
                            <span>Acessibilidade</span>
                            <button onClick={() => setShowAccessibility(false)}><X size={16} /></button>
                        </div>
                        <div className="menu-options">
                            <div className="option-item">
                                <span>Tamanho da Fonte</span>
                                <div className="option-controls">
                                    <button onClick={() => changeFontSize(-10)}><Minus size={14} /></button>
                                    <span>{fontSize}%</span>
                                    <button onClick={() => changeFontSize(10)}><Plus size={14} /></button>
                                </div>
                            </div>
                            <div className="option-item">
                                <span>Negrito</span>
                                <button 
                                    className={`toggle-btn ${isBold ? 'active' : ''}`}
                                    onClick={toggleBold}
                                >
                                    {isBold ? 'Ligado' : 'Desligado'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gift Swipe Handle */}
            <div className={`gift-swipe-handle ${showFloatingBtn ? 'visible' : ''}`}>
                <div className="handle-content">
                    <span className="handle-arrow">❮</span>
                    <span className="handle-text">PRESENTES</span>
                </div>
            </div>

            <RSVPModal isOpen={isModalOpen} onClose={closeModal} />

            <div className="floating-buttons-container">
                {/* Audio Controls */}
                <div 
                    className={`audio-floating-controls ${showFloatingBtn ? 'visible' : ''} ${isAudioExpanded ? 'expanded' : 'compact'}`}
                    style={{ transform: `translate(${audioPos.x}px, ${audioPos.y}px)`, cursor: isAudioExpanded ? 'default' : 'grab' }}
                    onMouseDown={!isAudioExpanded ? handleAudioDragStart : undefined}
                    onTouchStart={!isAudioExpanded ? handleAudioDragStart : undefined}
                >
                    {!isAudioExpanded ? (
                        <button className="audio-main-btn compact-mode" onClick={() => setIsAudioExpanded(true)}>
                            <Music size={20} />
                            {isPlaying && <span className="playing-indicator" />}
                        </button>
                    ) : (
                        <>
                            <div 
                                className="drag-handle" 
                                onMouseDown={handleAudioDragStart}
                                onTouchStart={handleAudioDragStart}
                                style={{cursor: 'grab', padding: '0 5px', color: '#ccc', display: 'flex', alignItems: 'center'}}
                            >
                                <span style={{fontSize: '14px', lineHeight: 1}}>⋮⋮</span>
                            </div>
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
                            
                            <button className="audio-close-btn" onClick={(e) => {
                                e.stopPropagation();
                                setIsAudioExpanded(false);
                            }}>
                                <X size={18} />
                            </button>
                        </>
                    )}
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
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 8px 15px;
                    border-radius: 50px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(197, 160, 89, 0.3);
                    user-select: none;
                }
                .audio-floating-controls.compact {
                    padding: 0;
                    border-radius: 50%;
                    border: none;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    gap: 0;
                }
                .audio-floating-controls.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                .audio-close-btn {
                    background: none;
                    color: #999;
                    border: none;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .audio-close-btn:hover {
                    background: rgba(0,0,0,0.05);
                    color: #333;
                }
                .audio-main-btn {
                    position: relative;
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
                .playing-indicator {
                    position: absolute;
                    bottom: 0px;
                    right: 2px;
                    width: 10px;
                    height: 10px;
                    background: #4caf50;
                    border-radius: 50%;
                    border: 2px solid white;
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
                        left: 10px;
                        bottom: 15px;
                    }
                    .audio-floating-controls.compact .audio-main-btn {
                        width: 45px;
                        height: 45px;
                    }
                    .audio-floating-controls.expanded {
                        padding: 5px 10px;
                        gap: 5px;
                        max-width: calc(100vw - 20px);
                    }
                    .volume-group {
                        padding-left: 5px;
                        gap: 5px;
                    }
                    .vol-pct {
                        min-width: 25px;
                        font-size: 10px;
                    }
                }

                /* Accessibility Styles */
                .accessibility-bold * {
                    font-weight: 700 !important;
                }

                .accessibility-control {
                    position: fixed;
                    left: 20px;
                    top: 20px;
                    z-index: 1000;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.4s ease;
                }
                .accessibility-control.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                .accessibility-toggle-btn {
                    background-color: #333;
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    transition: transform 0.3s ease;
                }
                .accessibility-toggle-btn:hover {
                    transform: scale(1.1);
                }
                .accessibility-menu {
                    position: absolute;
                    top: 55px;
                    left: 0;
                    background: white;
                    border-radius: 12px;
                    width: 240px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    padding: 15px;
                    border: 1px solid #eee;
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    font-weight: bold;
                    color: #333;
                }
                .option-item {
                    margin-bottom: 12px;
                }
                .option-item span {
                    display: block;
                    font-size: 14px;
                    margin-bottom: 5px;
                    color: #666;
                }
                .option-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f5f5f5;
                    padding: 5px 10px;
                    border-radius: 8px;
                    justify-content: space-between;
                }
                .option-controls button {
                    background: white;
                    border-radius: 4px;
                    padding: 4px;
                    display: flex;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .toggle-btn {
                    width: 100%;
                    padding: 8px;
                    border-radius: 8px;
                    background: #f5f5f5;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                .toggle-btn.active {
                    background: var(--color-green);
                    color: white;
                }

                /* Gift Swipe Handle Styles */
                .gift-swipe-handle {
                    position: fixed;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%) translateX(70%);
                    background-color: var(--color-gold);
                    color: white;
                    padding: 15px 10px;
                    border-radius: 10px 0 0 10px;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.2);
                    z-index: 98;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    opacity: 0;
                    pointer-events: none;
                }
                .gift-swipe-handle.visible {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateY(-50%) translateX(60%);
                }
                .gift-swipe-handle:hover, .gift-swipe-handle:active {
                    transform: translateY(-50%) translateX(0);
                }
                .handle-content {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: bold;
                    font-size: 12px;
                    letter-spacing: 2px;
                }
                .handle-arrow {
                    writing-mode: horizontal-tb;
                    font-size: 18px;
                    animation: pulseLeft 2s infinite;
                }
                @keyframes pulseLeft {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-5px); }
                }

                @media (max-width: 600px) {
                    .accessibility-control {
                        top: 20px;
                        left: 15px; scale: 0.9;
                    }
                    .gift-swipe-handle {
                        padding: 12px 6px;
                    }
                    .handle-text {
                        font-size: 10px;
                    }
                }
            `}</style>

        </div>
    );
}

export default LandingPage;