import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from './Hero';
import About from './About';
import Courses from './Courses';
import WhyChooseUs from './WhyChooseUs';
import Stats from './Stats';
import Testimonials from './Testimonials';
import Contact from './Contact';

const Home = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Helmet>
                <title>Pretech Computer Education | Empowering Your Digital Future</title>
                <meta name="description" content="Pretech Computer Education - Professional computer training institute offering IT courses, certification programs, and placement support. Join 5000+ successful students." />
            </Helmet>

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
