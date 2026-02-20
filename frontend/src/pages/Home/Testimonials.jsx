import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const testimonials = [
    {
        name: 'Priya Sharma',
        course: 'Full Stack Web Development',
        rating: 5,
        text: 'Pretech completely transformed my career. The hands-on training and placement support helped me land a job at a top IT company within 2 months of completing my course.',
        avatar: '👩‍💻'
    },
    {
        name: 'Rahul Verma',
        course: 'Python Programming',
        rating: 5,
        text: 'The faculty at Pretech is exceptional. They break down complex concepts into simple, understandable modules. Best investment I made in my education.',
        avatar: '👨‍💻'
    },
    {
        name: 'Anjali Patel',
        course: 'Data Science & ML',
        rating: 5,
        text: 'From zero programming knowledge to becoming a data analyst — all thanks to Pretech. The practical projects and real-world case studies were invaluable.',
        avatar: '👩‍🔬'
    },
    {
        name: 'Amit Kumar',
        course: 'Graphic Design',
        rating: 4,
        text: 'The creative environment at Pretech helped me discover my passion for design. Now I work as a freelance designer earning great income.',
        avatar: '🎨'
    },
    {
        name: 'Sneha Gupta',
        course: 'Tally Prime + GST',
        rating: 5,
        text: 'Completed Tally course in just 3 months and got placed immediately. The practical training on real accounting scenarios made me job-ready.',
        avatar: '📊'
    },
];

const Testimonials = () => {
    const [current, setCurrent] = useState(0);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 bg-gray-50 dark:bg-dark-card/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-4"
                    >
                        Testimonials
                    </motion.div>
                    <h2 className="section-title text-gray-900 dark:text-white mb-4">
                        What Our <span className="gradient-text">Students Say</span>
                    </h2>
                    <p className="section-subtitle">
                        Real stories from real students who transformed their careers with us
                    </p>
                </div>

                {/* Testimonial Carousel */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="card p-8 md:p-10 text-center"
                    >
                        <div className="text-5xl mb-4">{testimonials[current].avatar}</div>

                        {/* Stars */}
                        <div className="flex items-center justify-center space-x-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <HiStar
                                    key={i}
                                    className={`text-xl ${i < testimonials[current].rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                            ))}
                        </div>

                        <p className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6">
                            "{testimonials[current].text}"
                        </p>

                        <h4 className="text-lg font-bold font-heading text-gray-900 dark:text-white">
                            {testimonials[current].name}
                        </h4>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                            {testimonials[current].course}
                        </p>
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center space-x-4 mt-8">
                        <button
                            onClick={prev}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all"
                        >
                            <HiChevronLeft />
                        </button>

                        <div className="flex space-x-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current
                                            ? 'bg-primary-700 w-8'
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-400'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all"
                        >
                            <HiChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
