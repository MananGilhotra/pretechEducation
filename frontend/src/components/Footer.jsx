import { Link } from 'react-router-dom';
import { HiAcademicCap, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 dark:bg-dark-bg text-gray-300 border-t border-gray-800">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <img src="/logo.png" alt="Pretech Logo" className="h-10 w-auto object-contain" />
                            <div>
                                <h3 className="text-white font-bold font-heading text-lg">Pretech</h3>
                                <p className="text-[10px] text-gray-500 -mt-1">Computer Education</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            Empowering students with cutting-edge computer education and professional IT certification courses since 2010.
                        </p>
                        <div className="flex space-x-3">
                            {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-700 flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Icon className="text-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-heading font-semibold text-lg mb-4">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Our Courses', path: '/courses' },
                                { name: 'Enquiry Form', path: '/enquiry' },
                                { name: 'Apply Now', path: '/admission' },
                                { name: 'Login', path: '/login' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-gray-400 hover:text-accent-400 transition-colors duration-200 flex items-center space-x-1"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-accent-500"></span>
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Courses */}
                    <div>
                        <h4 className="text-white font-heading font-semibold text-lg mb-4">Popular Courses</h4>
                        <ul className="space-y-2.5">
                            {[
                                'Web Development',
                                'Python Programming',
                                'Data Science',
                                'Tally & Accounting',
                                'Graphic Design',
                                'MS Office',
                            ].map((course) => (
                                <li key={course}>
                                    <span className="text-sm text-gray-400 flex items-center space-x-1">
                                        <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                                        <span>{course}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-heading font-semibold text-lg mb-4">Contact Us</h4>
                        <div className="space-y-3">
                            <a href="tel:+919414253105" className="flex items-start space-x-3 group">
                                <HiPhone className="text-accent-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-400 group-hover:text-accent-400 transition-colors">
                                    +91 94142 53105
                                </span>
                            </a>
                            <a href="mailto:pretecheducation@gmail.com" className="flex items-start space-x-3 group">
                                <HiMail className="text-accent-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-400 group-hover:text-accent-400 transition-colors">
                                    pretecheducation@gmail.com
                                </span>
                            </a>
                            <div className="flex items-start space-x-3">
                                <HiLocationMarker className="text-accent-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-400">
                                    B-35, MP Nagar, Bikaner, Rajasthan
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                        <p className="text-sm text-gray-500">
                            © {currentYear} Pretech Computer Education. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">Refund Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
