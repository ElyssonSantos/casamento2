import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero/Hero';
import History from '../components/History/History';
import EventDetails from '../components/EventDetails/EventDetails';
import ImportantInfo from '../components/ImportantInfo/ImportantInfo';
import PhrasesCarousel from '../components/PhrasesCarousel/PhrasesCarousel';
import Gallery from '../components/Gallery/Gallery';
import Social from '../components/Social/Social';
import RSVPModal from '../components/RSVPModal/RSVPModal';
import GiftDrawer from '../components/Gift/GiftDrawer';
import GiftSection from '../components/Gift/GiftSection'; // Added GiftSection

import '../styles/global.css';

import LoadingScreen from '../components/LoadingScreen/LoadingScreen';

function LandingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
    const [showFloatingBtn, setShowFloatingBtn] = useState(false);

    // Swipe State
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openGiftDrawer = () => setIsGiftDrawerOpen(true);
    const closeGiftDrawer = () => setIsGiftDrawerOpen(false);

    // Scroll Animation Observer
    useEffect(() => {
        if (isLoading) return;

        const handleScroll = () => {
            // Show floating button after Hero section
            if (window.scrollY > 500) {
                setShowFloatingBtn(true);
            } else {
                setShowFloatingBtn(false);
            }

            // Reveal animations
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
        // Trigger once on load
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoading]);

    // Swipe Handler
    const minSwipeDistance = 50;
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        // Right to Left swipe (Open Gift Drawer)
        // Check if we are not in a scroll container (simplified check)

        if (isLeftSwipe && !isGiftDrawerOpen && !isModalOpen) {
            // We can perhaps restrict this to only work on the right edge or generally
            // For now, let's just enable it generally, but maybe only if initialized from right side?
            // The request said "Swipe da direita para a esquerda", usually implies edge swipe.
            // Let's stick to button primarily, but enable this global swipe.
            openGiftDrawer();
        }
    }

    if (isLoading) {
        return <LoadingScreen onComplete={() => setIsLoading(false)} />;
    }

    return (
        <div className="landing-page">
            <Hero onRSVP={openModal} />

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

            {/* Fixed Gift Section below Gallery */}
            <div className="reveal">
                <GiftSection onOpenDrawer={openGiftDrawer} />
            </div>

            <div className="reveal">
                <Social />
            </div>

            <RSVPModal isOpen={isModalOpen} onClose={closeModal} />

            <GiftDrawer isOpen={isGiftDrawerOpen} onClose={closeGiftDrawer} />

            <div className="floating-buttons-container">
                {/* Floating Gift Button */}
                <button
                    className={`btn-gift-floating ${showFloatingBtn ? 'visible' : ''}`}
                    onClick={openGiftDrawer}
                >
                    Área de Presentes 🎁
                </button>

                {/* Floating RSVP Button */}
                <button
                    className={`floating-rsvp ${showFloatingBtn ? 'visible' : ''}`}
                    onClick={openModal}
                >
                    Confirmar Presença
                </button>
            </div>

            {/* Floating Button Styles Inline or Global */}
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
