import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
    { value: 5000, label: 'Students Trained', suffix: '+', icon: '🎓' },
    { value: 50, label: 'Expert Courses', suffix: '+', icon: '📚' },
    { value: 15, label: 'Years Experience', suffix: '+', icon: '⏳' },
    { value: 95, label: 'Placement Rate', suffix: '%', icon: '💼' },
];

const Stats = () => {
    const sectionRef = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const countersRef = useRef([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top 80%',
            onEnter: () => {
                if (triggered) return;
                setTriggered(true);

                countersRef.current.forEach((el, i) => {
                    if (!el) return;
                    const target = { val: 0 };
                    gsap.to(target, {
                        val: stats[i].value,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            el.textContent = Math.floor(target.val).toLocaleString('en-IN') + stats[i].suffix;
                        }
                    });
                });
            }
        });

        return () => ScrollTrigger.getAll().forEach(st => st.kill());
    }, [triggered]);

    return (
        <section ref={sectionRef} className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-95"></div>
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '30px 30px'
            }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-2">
                        Our Numbers Speak
                    </h2>
                    <p className="text-white/70">A track record of excellence and success</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div
                                ref={el => countersRef.current[i] = el}
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-2"
                            >
                                0{stat.suffix}
                            </div>
                            <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
