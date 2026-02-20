import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HiClock, HiCurrencyRupee, HiArrowRight } from 'react-icons/hi';
import API from '../../api/axios';

gsap.registerPlugin(ScrollTrigger);

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses?status=Active');
                setCourses(data.slice(0, 6));
            } catch (err) {
                // Fallback courses for demo
                setCourses([
                    { _id: '1', name: 'Full Stack Web Development', description: 'Master HTML, CSS, JavaScript, React, Node.js', duration: '6 Months', fees: 15000, category: 'Web Development' },
                    { _id: '2', name: 'Python Programming', description: 'Learn Python from basics to advanced with real projects', duration: '4 Months', fees: 10000, category: 'Programming' },
                    { _id: '3', name: 'Data Science & ML', description: 'Data analysis, machine learning, and AI fundamentals', duration: '8 Months', fees: 20000, category: 'Data Science' },
                    { _id: '4', name: 'Tally Prime + GST', description: 'Complete accounting with Tally Prime and GST filing', duration: '3 Months', fees: 6000, category: 'Office Tools' },
                    { _id: '5', name: 'Graphic Design', description: 'Photoshop, Illustrator, CorelDRAW, and UI design', duration: '4 Months', fees: 8000, category: 'Graphic Design' },
                    { _id: '6', name: 'Advanced Excel & VBA', description: 'Advanced formulas, pivot tables, macros, and VBA', duration: '2 Months', fees: 5000, category: 'Office Tools' },
                ]);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (!sectionRef.current) return;
        const cards = sectionRef.current.querySelectorAll('.course-card');
        if (!cards.length) return;

        gsap.fromTo(
            cards,
            { y: 60, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.12,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }, [courses]);

    const categoryColors = {
        'Programming': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Web Development': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Data Science': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Networking': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Office Tools': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Graphic Design': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'Certification': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-gray-50 dark:bg-dark-card/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-sm font-medium mb-4"
                    >
                        Our Courses
                    </motion.div>
                    <h2 className="section-title text-gray-900 dark:text-white mb-4">
                        Explore Our <span className="gradient-text">Premium Courses</span>
                    </h2>
                    <p className="section-subtitle">
                        Industry-relevant courses designed to turn beginners into professionals
                    </p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="course-card card-hover group"
                        >
                            {/* Category Badge */}
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[course.category] || categoryColors['Other']}`}>
                                {course.category}
                            </div>

                            <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                {course.name}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {course.description}
                            </p>

                            {/* Details */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <HiClock className="mr-1 text-primary-600" />
                                        {course.duration}
                                    </div>
                                    <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                                        <HiCurrencyRupee className="mr-0.5 text-accent-500" />
                                        {course.fees?.toLocaleString('en-IN')}
                                    </div>
                                </div>
                                <Link
                                    to="/admission"
                                    className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 group-hover:bg-primary-700 group-hover:text-white transition-all"
                                >
                                    <HiArrowRight className="text-sm" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All */}
                <div className="text-center mt-12">
                    <Link to="/courses" className="btn-primary">
                        View All Courses
                        <HiArrowRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Courses;
