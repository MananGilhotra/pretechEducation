import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { HiClock, HiCurrencyRupee, HiArrowRight, HiSearch } from 'react-icons/hi';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const categories = ['All', 'Programming', 'Web Development', 'Data Science', 'Networking', 'Office Tools', 'Graphic Design', 'Certification'];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await API.get('/courses?status=Active');
                setCourses(data);
            } catch (err) {
                setCourses([
                    { _id: '1', name: 'Full Stack Web Development', description: 'Master HTML, CSS, JavaScript, React, Node.js and MongoDB. Build real-world projects.', duration: '6 Months', fees: 15000, category: 'Web Development', eligibility: '12th Pass' },
                    { _id: '2', name: 'Python Programming', description: 'Learn Python from basics to advanced with real projects and frameworks.', duration: '4 Months', fees: 10000, category: 'Programming', eligibility: '10th Pass' },
                    { _id: '3', name: 'Data Science & ML', description: 'Data analysis, machine learning, and AI fundamentals with Python.', duration: '8 Months', fees: 20000, category: 'Data Science', eligibility: 'Graduate' },
                    { _id: '4', name: 'Tally Prime + GST', description: 'Complete accounting with Tally Prime, GST filing, and payroll.', duration: '3 Months', fees: 6000, category: 'Office Tools', eligibility: '10th Pass' },
                    { _id: '5', name: 'Graphic Design Pro', description: 'Photoshop, Illustrator, CorelDRAW, and modern UI design.', duration: '4 Months', fees: 8000, category: 'Graphic Design', eligibility: '10th Pass' },
                    { _id: '6', name: 'Advanced Excel & VBA', description: 'Advanced formulas, pivot tables, macros, and VBA programming.', duration: '2 Months', fees: 5000, category: 'Office Tools', eligibility: 'Basic Computer Knowledge' },
                    { _id: '7', name: 'Java Programming', description: 'Core Java, OOP, JDBC, Servlets, and Spring Framework.', duration: '5 Months', fees: 12000, category: 'Programming', eligibility: '12th Pass' },
                    { _id: '8', name: 'CCNA Networking', description: 'Cisco Certified Network Associate preparation with labs.', duration: '3 Months', fees: 15000, category: 'Networking', eligibility: '12th Pass' },
                    { _id: '9', name: 'AWS Cloud Certification', description: 'AWS Solutions Architect Associate certification prep.', duration: '3 Months', fees: 18000, category: 'Certification', eligibility: 'Graduate' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filtered = courses.filter(c => {
        const matchCategory = filter === 'All' || c.category === filter;
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
    });

    const categoryColors = {
        'Programming': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Web Development': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Data Science': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Networking': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Office Tools': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Graphic Design': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'Certification': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    };

    return (
        <>
            <Helmet>
                <title>Courses | Pretech Computer Education</title>
                <meta name="description" content="Explore our comprehensive range of IT courses including Web Development, Python, Data Science, Networking, Graphic Design and more." />
            </Helmet>

            {/* Header */}
            <div className="pt-24 pb-12 gradient-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Our Courses</h1>
                    <p className="text-white/70 text-lg max-w-2xl mx-auto">
                        Choose from 50+ industry-relevant courses designed to launch your IT career
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field !pl-11"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === cat
                                    ? 'bg-primary-700 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No courses found matching your criteria.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((course, i) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="card-hover group overflow-hidden"
                            >
                                {/* Course Image */}
                                {course.image ? (
                                    <div className="-mx-6 -mt-6 mb-4">
                                        <img src={course.image} alt={course.name} className="w-full h-40 object-cover" />
                                    </div>
                                ) : (
                                    <div className="-mx-6 -mt-6 mb-4 h-40 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary-300 dark:text-primary-700">{course.name?.charAt(0)}</span>
                                    </div>
                                )}
                                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4 ${categoryColors[course.category] || 'bg-gray-100 text-gray-700'}`}>
                                    {course.category}
                                </div>
                                <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                    {course.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                                {course.eligibility && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                        <span className="font-medium">Eligibility:</span> {course.eligibility}
                                    </p>
                                )}
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
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default CoursesPage;
