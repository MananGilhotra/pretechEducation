import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiClock } from 'react-icons/hi';

const Contact = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const contactInfo = [
        { icon: HiPhone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
        { icon: HiMail, label: 'Email', value: 'info@pretechcomputer.com', href: 'mailto:info@pretechcomputer.com' },
        { icon: HiLocationMarker, label: 'Address', value: '123, Main Street, City Center, India', href: null },
        { icon: HiClock, label: 'Working Hours', value: 'Mon - Sat: 9AM - 7PM', href: null },
    ];

    return (
        <section ref={sectionRef} id="contact" className="py-20 lg:py-28 bg-white dark:bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium mb-4"
                    >
                        Contact Us
                    </motion.div>
                    <h2 className="section-title text-gray-900 dark:text-white mb-4">
                        Get In <span className="gradient-text">Touch</span>
                    </h2>
                    <p className="section-subtitle">
                        Have questions? Reach out to us and our team will get back to you within 24 hours
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {contactInfo.map((info, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: i * 0.1 }}
                                className="card group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-700 to-accent-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <info.icon className="text-white text-xl" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{info.label}</h4>
                                {info.href ? (
                                    <a href={info.href} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-700 dark:hover:text-primary-400 transition-colors">
                                        {info.value}
                                    </a>
                                ) : (
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.value}</p>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Map placeholder */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl overflow-hidden shadow-lg h-80 lg:h-full min-h-[300px]"
                    >
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                            <div className="text-center">
                                <HiLocationMarker className="text-5xl text-primary-700 dark:text-primary-400 mx-auto mb-3" />
                                <p className="font-heading font-semibold text-gray-900 dark:text-white">Pretech Computer Education</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">123, Main Street, City Center</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">India - 110001</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
