'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'zoom-in';
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}

export function ScrollReveal({
    children,
    animation = 'fade-in-up',
    delay = 0,
    duration = 800,
    threshold = 0.1,
    className = ''
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const style = {
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        opacity: 0, // Start hidden
    };

    const animationClass = isVisible ? `animate-${animation}` : '';

    return (
        <div
            ref={ref}
            className={`${className} ${animationClass}`}
            style={isVisible ? { ...style, opacity: 1 } : { opacity: 0 }} // Switch to opacity 1 when animating
        >
            {children}
        </div>
    );
}
