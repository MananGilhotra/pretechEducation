import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from './Hero';
import About from './About';
import Courses from './Courses';
import WhyChooseUs from './WhyChooseUs';
import Stats from './Stats';
import Testimonials from './Testimonials';
import Contact from './Contact';
import SplashScreen from '../../components/SplashScreen';

const Home = () => {
    const [showSplash, setShowSplash] = useState(() => {
        return !sessionStorage.getItem('pretech_splash_seen');
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSplashComplete = () => {
        sessionStorage.setItem('pretech_splash_seen', 'true');
        setShowSplash(false);
    };

    return (
        <>
            <Helmet>
                <title>Pretech Computer Education | Empowering Your Digital Future</title>
                <meta name="description" content="Pretech Computer Education - Professional computer training institute offering IT courses, certification programs, and placement support. Join 5000+ successful students." />
            </Helmet>

            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

            <Hero />
            <About />
            <Courses />
            <WhyChooseUs />
            <Stats />
            <Testimonials />
            <Contact />
        </>
    );
};

export default Home;

