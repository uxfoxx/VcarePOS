import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GSAPCarousel = ({ images, autoplayDelay = 5000, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const slideRefs = useRef([]);
  const timelineRef = useRef(null);
  const progressRef = useRef(null);
  const autoplayRef = useRef(null);

  const totalSlides = images.length;

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const direction = index > currentIndex ? 1 : -1;

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(index);
      },
    });

    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;

      if (i === currentIndex) {
        timelineRef.current.to(
          slide,
          {
            x: direction * -100 + '%',
            opacity: 0,
            scale: 0.95,
            duration: 0.6,
            ease: 'power2.inOut',
          },
          0
        );
      } else if (i === index) {
        gsap.set(slide, { x: direction * 100 + '%', opacity: 0, scale: 0.95 });
        timelineRef.current.to(
          slide,
          {
            x: '0%',
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.inOut',
          },
          0
        );
      }
    });
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % totalSlides;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
  };

  useEffect(() => {
    if (!isHovered && autoplayDelay > 0) {
      autoplayRef.current = setInterval(nextSlide, autoplayDelay);

      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { width: '0%' },
          {
            width: '100%',
            duration: autoplayDelay / 1000,
            ease: 'none',
            repeat: -1,
          }
        );
      }
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
      if (progressRef.current) {
        gsap.killTweensOf(progressRef.current);
      }
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isHovered, autoplayDelay, currentIndex]);

  useEffect(() => {
    slideRefs.current.forEach((slide, i) => {
      if (!slide) return;

      if (i === currentIndex) {
        gsap.set(slide, { x: '0%', opacity: 1, scale: 1, zIndex: 10 });
      } else {
        gsap.set(slide, { x: '100%', opacity: 0, scale: 0.95, zIndex: 1 });
      }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[600px] md:h-[700px]">
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => (slideRefs.current[index] = el)}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: index === currentIndex ? 10 : 1 }}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {autoplayDelay > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div ref={progressRef} className="h-full bg-white transition-opacity duration-300" style={{ opacity: isHovered ? 0 : 1 }} />
        </div>
      )}
    </div>
  );
};

export default GSAPCarousel;
