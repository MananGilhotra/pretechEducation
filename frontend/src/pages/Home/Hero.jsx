import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const Hero = () => {
    const headingRef = useRef(null);
    const subRef = useRef(null);
    const buttonsRef = useRef(null);
    const shapesRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(headingRef.current?.children || [],
            { y: 80, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
            { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1, stagger: 0.15 }
        )
            .fromTo(subRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.4'
            )
            .fromTo(buttonsRef.current?.children || [],
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
                '-=0.3'
            );

        // Floating shapes animation
        if (shapesRef.current) {
            gsap.to(shapesRef.current.querySelectorAll('.shape'), {
                y: 'random(-30, 30)',
                x: 'random(-20, 20)',
                rotation: 'random(-15, 15)',
                duration: 'random(3, 6)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: { each: 0.5, from: 'random' }
            });
        }
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 gradient-bg opacity-95"></div>

            {/* Mesh pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}></div>

            {/* Floating shapes */}
            <div ref={shapesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="shape absolute top-20 left-[10%] w-32 h-32 rounded-full bg-white/10 blur-sm"></div>
                <div className="shape absolute top-40 right-[15%] w-48 h-48 rounded-3xl bg-accent-500/10 blur-md rotate-12"></div>
                <div className="shape absolute bottom-32 left-[20%] w-24 h-24 rounded-2xl bg-white/10 blur-sm rotate-45"></div>
                <div className="shape absolute bottom-20 right-[25%] w-40 h-40 rounded-full bg-primary-300/10 blur-md"></div>
                <div className="shape absolute top-1/3 left-1/2 w-20 h-20 rounded-xl bg-accent-400/10 blur-sm rotate-12"></div>
                <div className="shape absolute top-[60%] left-[5%] w-16 h-16 rounded-full bg-white/5"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8"
                >
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                    Now Enrolling for 2026 Batches
                </motion.div>

                <div ref={headingRef} className="overflow-hidden">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-white leading-tight">
                        <span className="block">Empowering Your</span>
                        <span className="block mt-2">
                            <span className="text-accent-300">Digital</span> Future
                        </span>
                    </h1>
                </div>

                <p ref={subRef} className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                    Join Pretech Computer Education and master the latest technologies.
                    From programming to professional certifications, we prepare you for success in the digital world.
                </p>

                <div ref={buttonsRef} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/admission"
                        className="group inline-flex items-center px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-accent-500/30 transform hover:-translate-y-1"
                    >
                        Apply Now
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                    <Link
                        to="/courses"
                        className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl text-lg border border-white/20 transition-all duration-300 hover:-translate-y-1"
                    >
                        View Courses
                    </Link>
                </div>

                {/* Stats bar */}
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                >
                    {[
                        { number: '5000+', label: 'Students Trained' },
                        { number: '50+', label: 'Expert Courses' },
                        { number: '15+', label: 'Years Experience' },
                        { number: '95%', label: 'Placement Rate' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-white font-heading">{stat.number}</div>
                            <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L48 105C96 90 192 60 288 52.5C384 45 480 60 576 67.5C672 75 768 75 864 67.5C960 60 1056 45 1152 41.25C1248 37.5 1344 45 1392 48.75L1440 52.5V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" className="fill-white dark:fill-dark-bg" />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
