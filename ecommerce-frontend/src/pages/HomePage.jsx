import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import GSAPCarousel from '../components/Common/GSAPCarousel';
import Accordion from '../components/Common/Accordion';
import Testimonials from '../components/Common/Testimonials';
import OurStory from '../components/Common/OurStory';
import Newsletter from '../components/Common/Newsletter';
import {
  fetchFAQs,
  fetchTestimonials,
  fetchAllSiteSettings,
  subscribeToNewsletter,
} from '../api/supabaseClient';
import { ArrowRight, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});

  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const testimonialsRef = useRef(null);
  const storyRef = useRef(null);

  const carouselImages = [
    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
    'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  ];

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }

    const loadData = async () => {
      const [faqsData, testimonialsData, settingsData] = await Promise.all([
        fetchFAQs(),
        fetchTestimonials(),
        fetchAllSiteSettings(),
      ]);

      setFaqs(faqsData);
      setTestimonials(testimonialsData);
      setSiteSettings(settingsData);
    };

    loadData();
  }, [dispatch, products.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.hero-text'), {
          opacity: 0,
          y: 50,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        });

        gsap.from(heroRef.current.querySelector('.hero-cta'), {
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          delay: 0.8,
          ease: 'back.out(1.7)',
        });

        gsap.to(heroRef.current.querySelector('.scroll-indicator'), {
          y: 10,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }

      if (featuredRef.current) {
        gsap.from(featuredRef.current.querySelectorAll('.product-card'), {
          opacity: 0,
          y: 50,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
          opacity: 0,
          y: 60,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      if (faqRef.current) {
        gsap.from(faqRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: faqRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      if (testimonialsRef.current) {
        gsap.from(testimonialsRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      if (storyRef.current) {
        gsap.from(storyRef.current.querySelectorAll('.story-content'), {
          opacity: 0,
          x: -50,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });

        gsap.from(storyRef.current.querySelector('.story-video'), {
          opacity: 0,
          x: 50,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });

    return () => ctx.revert();
  }, [products, faqs, testimonials]);

  const handleNewsletterSubscribe = async (email) => {
    await subscribeToNewsletter(email);
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg')] bg-cover bg-center" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="hero-text text-5xl md:text-7xl font-bold text-white mb-6">
            Transform Your Space with{' '}
            <span className="text-primary-400">Elegant Furniture</span>
          </h1>
          <p className="hero-text text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Discover handcrafted pieces that blend style, comfort, and durability for your perfect home
          </p>
          <div className="hero-cta">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70">
          <ArrowDown className="w-8 h-8" />
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated furniture collections designed to elevate every room in your home
          </p>
        </div>
        <GSAPCarousel images={carouselImages} autoplayDelay={5000} />
      </section>

      <section ref={featuredRef} className="py-20 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular furniture pieces
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Why Choose <span className="text-primary-600">VCare Furniture</span>?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Where design meets durability — handcrafted with care, delivered with excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition duration-300 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expertly crafted furniture using only the finest sustainable materials.
              </p>
            </div>

            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition duration-300 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Free Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy seamless delivery — fast, free, and right to your door.
              </p>
            </div>

            <div className="feature-card group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition duration-300 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                1-Year Warranty
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Peace of mind guaranteed — protection on all your furniture pieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {siteSettings.youtube_video_id && (
        <section ref={storyRef} className="py-20 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="story-content">
              <OurStory
                videoId={siteSettings.youtube_video_id}
                title={siteSettings.about_us_title || 'Our Story'}
                subtitle={siteSettings.about_us_subtitle || 'Crafting Beautiful Spaces Since 2010'}
                description={
                  siteSettings.about_us_text ||
                  'VCare Furniture began with a simple mission: to create beautiful, durable furniture that transforms houses into homes.'
                }
              />
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section ref={testimonialsRef} className="py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Don't just take our word for it — hear from our satisfied customers
              </p>
            </div>
            <Testimonials testimonials={testimonials} autoplayDelay={6000} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section ref={faqRef} className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Find answers to common questions about our furniture and services
              </p>
            </div>
            <Accordion items={faqs} allowMultiple={false} />
          </div>
        </section>
      )}

      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter onSubscribe={handleNewsletterSubscribe} />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Browse our complete collection and find the perfect furniture for your home
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-lg"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
