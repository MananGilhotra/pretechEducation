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
                            Established with a vision to bridge the digital divide, Pretech Computer Education has been at the forefront of computer training for over 15 years. We offer industry-relevant courses designed to equip students with practical skills demanded by today's job market.
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
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 flex items-center justify-center">
                                <div className="text-center text-white p-10">
                                    <HiAcademicCap className="text-7xl mx-auto mb-4 opacity-80" />
                                    <h3 className="text-3xl font-bold font-heading mb-2">15+ Years</h3>
                                    <p className="text-white/70">Of Excellence in Computer Education</p>
                                </div>
                            </div>
                        </div>
                        {/* Floating badge */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-dark-border"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">ISO Certified</div>
                                    <div className="text-xs text-gray-500">Quality Education</div>
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
