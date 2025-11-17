import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialCard = ({ testimonial, isActive }) => {
  const { customer_name, role, content, image_url, rating } = testimonial;

  return (
    <div
      className={`bg-white rounded-2xl p-8 shadow-xl transition-all duration-500 ${
        isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <img
          src={image_url}
          alt={customer_name}
          className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100"
        />
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{customer_name}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-700 leading-relaxed italic">"{content}"</p>

      <div className="absolute top-8 right-8 text-primary-100 opacity-30">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
        </svg>
      </div>
    </div>
  );
};

const Testimonials = ({ testimonials = [], autoplayDelay = 6000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const autoplayRef = useRef(null);

  const totalTestimonials = testimonials.length;

  const goToSlide = (index) => {
    if (index === currentIndex) return;

    const currentCard = cardRefs.current[currentIndex];
    const nextCard = cardRefs.current[index];

    if (currentCard) {
      gsap.to(currentCard, {
        x: index > currentIndex ? -100 : 100,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      });
    }

    if (nextCard) {
      gsap.fromTo(
        nextCard,
        { x: index > currentIndex ? 100 : -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.inOut',
          delay: 0.2,
        }
      );
    }

    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % totalTestimonials;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
    goToSlide(prevIndex);
  };

  useEffect(() => {
    if (!isHovered && autoplayDelay > 0 && totalTestimonials > 1) {
      autoplayRef.current = setInterval(nextSlide, autoplayDelay);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isHovered, currentIndex, autoplayDelay, totalTestimonials]);

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No testimonials available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-h-[300px]">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id || index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="absolute inset-0"
            style={{
              zIndex: index === currentIndex ? 10 : 1,
              pointerEvents: index === currentIndex ? 'auto' : 'none',
            }}
          >
            <TestimonialCard
              testimonial={testimonial}
              isActive={index === currentIndex}
            />
          </div>
        ))}
      </div>

      {totalTestimonials > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Testimonials;
