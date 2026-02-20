import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiShieldCheck, HiDesktopComputer, HiBriefcase, HiUserGroup, HiClock, HiStar } from 'react-icons/hi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
    { icon: HiShieldCheck, title: 'Certified Courses', desc: 'Industry-recognized certifications that boost your resume and career prospects.', color: 'from-blue-500 to-blue-700' },
    { icon: HiDesktopComputer, title: 'Modern Labs', desc: 'State-of-the-art computer labs with the latest hardware and software.', color: 'from-purple-500 to-purple-700' },
    { icon: HiBriefcase, title: 'Placement Support', desc: '95% placement rate with top companies. Interview preparation included.', color: 'from-green-500 to-green-700' },
    { icon: HiUserGroup, title: 'Expert Trainers', desc: 'Learn from industry experts with 10+ years of professional experience.', color: 'from-orange-500 to-orange-700' },
    { icon: HiClock, title: 'Flexible Timing', desc: 'Morning, afternoon, evening & weekend batches to fit your schedule.', color: 'from-red-500 to-red-700' },
    { icon: HiStar, title: 'Affordable Fees', desc: 'Quality education at affordable prices with easy installment options.', color: 'from-teal-500 to-teal-700' },
];

const WhyChooseUs = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!sectionRef.current) return;
        const cards = sectionRef.current.querySelectorAll('.feature-card');
        if (!cards.length) return;

        gsap.fromTo(
            cards,
            { y: 50, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
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
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-4"
                    >
                        Why Pretech
                    </motion.div>
                    <h2 className="section-title text-gray-900 dark:text-white mb-4">
                        Why Choose <span className="gradient-text">Pretech?</span>
                    </h2>
                    <p className="section-subtitle">
                        We don't just teach technology — we create future-ready professionals
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div key={i} className="feature-card card-hover group text-center">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <feature.icon className="text-white text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
