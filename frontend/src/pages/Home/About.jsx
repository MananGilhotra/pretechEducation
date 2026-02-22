import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HiAcademicCap, HiLightBulb, HiUsers } from 'react-icons/hi';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!sectionRef.current) return;
        const elements = sectionRef.current.querySelectorAll('.about-animate');
        if (!elements.length) return;

        gsap.fromTo(
            elements,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-white dark:bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Text */}
                    <div>
                        <div className="about-animate inline-flex items-center px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
                            About Us
                        </div>
                        <h2 className="about-animate section-title text-gray-900 dark:text-white mb-6">
                            Welcome to{' '}
                            <span className="gradient-text">Pretech Computer Education</span>
                        </h2>
                        <p className="about-animate text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                            Established with a vision to bridge the digital divide, Pretech Computer Education has been at the forefront of computer training for over 15 years. Under the expert guidance of our founder, Pankaj Gilhotra—who brings decades of excellence and mastery in MS-Office, Tally, and Professional Typing—we offer industry-relevant courses designed to equip students with highly demanded practical skills.
                        </p>
                        <p className="about-animate text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            Our state-of-the-art labs, experienced faculty, and placement-focused curriculum ensure that every student graduates ready for the professional world.
                        </p>

                        <div className="about-animate grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: HiAcademicCap, title: 'Expert Faculty', desc: 'Industry professionals' },
                                { icon: HiLightBulb, title: 'Hands-On Labs', desc: 'Practical learning' },
                                { icon: HiUsers, title: 'Small Batches', desc: 'Personal attention' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-card">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                            <img
                                src="/pankaj-gilhotra-wide.png"
                                alt="Pankaj Gilhotra - Owner & Founder of Pretech Computer Education"
                                className="w-full h-full object-cover aspect-video transform group-hover:scale-105 transition-transform duration-700 origin-center"
                            />
                            {/* Overlay gradient for text readability */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent p-6 md:p-8 pt-32">
                                <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-1 shadow-sm">Pankaj Gilhotra</h3>
                                <p className="text-primary-300 font-medium text-sm md:text-base">Owner & Founder</p>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -bottom-6 -left-2 sm:-left-6 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 md:p-5 border border-gray-100 dark:border-dark-border z-10"
                        >
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <span className="text-2xl md:text-3xl">🏆</span>
                                </div>
                                <div>
                                    <div className="text-sm md:text-base font-bold text-gray-900 dark:text-white">15+ Years</div>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Of IT Excellence</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
