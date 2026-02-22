import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const SplashScreen = ({ onComplete }) => {
    const [show, setShow] = useState(true);
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const line1Ref = useRef(null);
    const line2Ref = useRef(null);
    const line3Ref = useRef(null);
    const particlesRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                setTimeout(() => {
                    setShow(false);
                    setTimeout(() => onComplete?.(), 600);
                }, 400);
            }
        });

        // Create particles
        if (particlesRef.current) {
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'splash-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 6 + 2}px;
                    height: ${Math.random() * 6 + 2}px;
                    background: ${['#60a5fa', '#818cf8', '#a78bfa', '#f472b6', '#34d399'][Math.floor(Math.random() * 5)]};
                    border-radius: 50%;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    opacity: 0;
                `;
                particlesRef.current.appendChild(particle);
            }

            gsap.to(particlesRef.current.querySelectorAll('.splash-particle'), {
                opacity: () => Math.random() * 0.8 + 0.2,
                scale: () => Math.random() * 2 + 0.5,
                x: () => `random(-100, 100)`,
                y: () => `random(-100, 100)`,
                duration: () => Math.random() * 3 + 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: { each: 0.08, from: 'random' }
            });
        }

        // Main animation sequence
        tl
            // Logo icon scales in with rotation
            .fromTo(logoRef.current,
                { scale: 0, rotation: -180, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
            )
            // Glow pulse on the logo
            .to(logoRef.current, {
                boxShadow: '0 0 60px rgba(99, 102, 241, 0.6), 0 0 120px rgba(99, 102, 241, 0.3)',
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            }, '-=0.2')
            // "Welcome to" text slides up with clip
            .fromTo(line1Ref.current,
                { y: 60, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
                { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'power3.out' },
                '-=0.6'
            )
            // "Pretech Computer" - staggered letter reveal
            .fromTo(line2Ref.current?.querySelectorAll('.splash-letter') || [],
                { y: 80, opacity: 0, rotateX: 90 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.6, stagger: 0.03, ease: 'back.out(2)' },
                '-=0.3'
            )
            // "Education" - slides in from right
            .fromTo(line3Ref.current,
                { x: 100, opacity: 0, scale: 0.8 },
                { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
                '-=0.2'
            )
            // Progress bar
            .fromTo(progressRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 1.2, ease: 'power2.inOut' },
                '-=0.3'
            )
            // Hold for a moment
            .to({}, { duration: 0.3 })
            // Fade everything up and out
            .to([line1Ref.current, line2Ref.current, line3Ref.current, progressRef.current], {
                y: -30, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power3.in'
            })
            .to(logoRef.current, {
                scale: 15, opacity: 0, duration: 0.6, ease: 'power3.in'
            }, '-=0.3');

    }, []);

    const splitText = (text) => {
        return text.split('').map((char, i) => (
            <span key={i} className="splash-letter inline-block" style={{ display: char === ' ' ? 'inline' : 'inline-block' }}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #172554 70%, #0f172a 100%)',
                    }}
                >
                    {/* Animated mesh background */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
                        backgroundSize: '30px 30px'
                    }}></div>

                    {/* Radial glow */}
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)'
                    }}></div>

                    {/* Particles */}
                    <div ref={particlesRef} className="absolute inset-0 pointer-events-none"></div>

                    {/* Ring decorations */}
                    <div className="absolute w-[500px] h-[500px] rounded-full border border-indigo-500/10 animate-spin" style={{ animationDuration: '20s' }}></div>
                    <div className="absolute w-[700px] h-[700px] rounded-full border border-purple-500/5 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>

                    {/* Main content */}
                    <div className="relative z-10 text-center px-4">
                        {/* Logo */}
                        <div
                            ref={logoRef}
                            className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                                boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                            </svg>
                        </div>

                        {/* Welcome text */}
                        <div className="overflow-hidden mb-2">
                            <p
                                ref={line1Ref}
                                className="text-indigo-300/80 text-lg sm:text-xl font-medium tracking-[0.3em] uppercase"
                            >
                                WELCOME TO
                            </p>
                        </div>

                        {/* Pretech Computer */}
                        <div className="overflow-hidden mb-1" style={{ perspective: '600px' }}>
                            <h1
                                ref={line2Ref}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {splitText('Pretech Computer')}
                            </h1>
                        </div>

                        {/* Education */}
                        <div className="overflow-hidden">
                            <h2
                                ref={line3Ref}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                                style={{
                                    background: 'linear-gradient(90deg, #60a5fa, #818cf8, #a78bfa, #c084fc)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                            >
                                Education
                            </h2>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-10 mx-auto w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                ref={progressRef}
                                className="h-full rounded-full origin-left"
                                style={{
                                    background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                                    transform: 'scaleX(0)'
                                }}
                            ></div>
                        </div>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                            className="mt-4 text-sm text-white/40 tracking-widest uppercase"
                        >
                            Empowering Your Digital Future
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
