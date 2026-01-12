import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Accordion from '../components/Common/Accordion';
import TestimonialCard from '../components/Common/TestimonialCard';
import YouTubeEmbed from '../components/Common/YouTubeEmbed';
import { Award, Leaf, Hammer, Shield, Sparkles, TrendingUp } from "lucide-react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, listLoading } = useSelector(state => state.products);

  const [activeFeature, setActiveFeature] = useState(0);

  const heroRef = useRef(null);
  const qualityRef = useRef(null);
  const faqRef = useRef(null);
  const faqHeadingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const storyRef = useRef(null);
  const storyTextRef = useRef(null);
  const storyVideoRef = useRef(null);
  const featuredRef = useRef(null);
  const featuredHeadingRef = useRef(null);
  const whyChooseRef = useRef(null);
  const ctaRef = useRef(null);

  const qualityFeatures = [
    {
      icon: Hammer,
      title: "Ergonomic Comfort for Better Workdays",
      description: "Engineered for long hours and better posture. Our mesh chairs, adjustable armrests, and lumbar support systems ensure comfort from morning to night.",
      image: "https://images.pexels.com/photos/5974401/pexels-photo-5974401.jpeg"
    },
    {
      icon: Leaf,
      title: "Smart Desk Technology for Modern Workflows",
      description: "Choose from single-motor or dual-motor Smart Desks with LED displays, memory height presets, and USB charging to create your ideal workflow.",
      image: "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg"
    },
    {
      icon: Shield,
      title: "Built to Last with Premium Materials",
      description: "Metal bases, reinforced frames, and durable construction ensure your workspace furniture withstands years of daily use.",
      image: "https://images.pexels.com/photos/245032/pexels-photo-245032.jpeg"
    },
    {
      icon: Award,
      title: "Minimalist Design for Any Space",
      description: "Clean, modern aesthetics that complement any environment - from home offices to corporate workspaces across Sri Lanka.",
      image: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg"
    }
  ];

  const faqData = [
    {
      question: "Do you offer island-wide delivery?",
      answer: "Yes! We provide island-wide delivery across Sri Lanka. Delivery to Colombo and suburbs is typically within 2-3 business days, while other areas may take 5-7 business days. Contact us for specific delivery timelines to your location."
    },
    {
      question: "What is your warranty policy?",
      answer: "We offer up to 2 years warranty on selected items covering manufacturing defects. This includes issues with motors on Smart Desks, structural integrity, and mechanical components. Normal wear and tear is not covered."
    },
    {
      question: "What types of Smart Desks do you offer?",
      answer: "We offer both single-motor and dual-motor Smart Desks. Both options feature LED displays for height tracking, memory presets for your preferred heights, and USB charging ports. Dual-motor desks offer faster adjustment and higher weight capacity."
    },
    {
      question: "Is assembly required?",
      answer: "Most furniture requires some assembly. Our team provides professional assembly services in the Colombo area. Detailed instructions and all necessary hardware are included with every purchase. Assembly typically takes 30-60 minutes."
    },
    {
      question: "Can I customize my order?",
      answer: "Yes! We offer customization options including desk sizes, frame colors, and tabletop finishes. Visit our showroom at 1100/1 Pannipitiya Road, Battaramulla to discuss your specific requirements with our team."
    },
    {
      question: "Do you have a showroom?",
      answer: "Yes, visit our showroom at 1100/1 Pannipitiya Road, Battaramulla, Sri Lanka to experience our products firsthand. Our friendly team will help you find the perfect workspace solution for your needs."
    }
  ];

  const testimonials = [
    {
      name: "Kasun Perera",
      role: "Software Engineer",
      rating: 5,
      review: "Great value for money! The Smart Desk I purchased has transformed my home office. The height adjustment feature is smooth and the build quality is excellent.",
      initials: "KP",
      bgColor: "bg-blue-500"
    },
    {
      name: "Nadeesha Fernando",
      role: "Business Owner",
      rating: 5,
      review: "The sales team was incredibly friendly and helpful. They guided me through all the options and helped me find the perfect setup for my office.",
      initials: "NF",
      bgColor: "bg-green-500"
    },
    {
      name: "Dinesh Jayawardena",
      role: "Remote Professional",
      rating: 5,
      review: "My posture has improved significantly since switching to the 808 Ergo Mesh Chair. No more back pain after long work sessions. Highly recommend!",
      initials: "DJ",
      bgColor: "bg-teal-500"
    },
    {
      name: "Sachini Wijesekara",
      role: "Freelance Designer",
      rating: 5,
      review: "Island-wide delivery was quick and hassle-free. The dual-motor desk is perfect for my creative work - adjusting between sitting and standing throughout the day.",
      initials: "SW",
      bgColor: "bg-orange-500"
    },
    {
      name: "Ruwan Silva",
      role: "Startup Founder",
      rating: 5,
      review: "Furnished our entire startup office with Vcare products. The minimalist design fits perfectly with our modern workspace. Great quality at affordable prices.",
      initials: "RS",
      bgColor: "bg-cyan-500"
    },
    {
      name: "Amaya Rathnayake",
      role: "HR Manager",
      rating: 5,
      review: "The 2-year warranty gave us confidence in our purchase. Our employees love the ergonomic chairs - productivity has noticeably improved!",
      initials: "AR",
      bgColor: "bg-rose-500"
    }
  ];

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const hero = heroRef.current;

    if (hero) {
      gsap.fromTo(
        hero.querySelector('.hero-content'),
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }

    if (qualityRef.current) {
      const heading = qualityRef.current.querySelector('.quality-heading');
      const subtitle = qualityRef.current.querySelector('.quality-subtitle');
      const featureCards = qualityRef.current.querySelectorAll('.quality-feature-card');
      const mainImage = qualityRef.current.querySelector('.quality-main-image');

      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: qualityRef.current,
              start: 'top 75%',
              once: true
            }
          }
        );
      }

      if (subtitle) {
        gsap.fromTo(
          subtitle,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: qualityRef.current,
              start: 'top 75%',
              once: true
            }
          }
        );
      }

      if (featureCards.length > 0) {
        gsap.fromTo(
          featureCards,
          {
            opacity: 0,
            y: 50,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: qualityRef.current,
              start: 'top 70%',
              once: true
            }
          }
        );

        featureCards.forEach(card => {
          const icon = card.querySelector('.feature-icon');
          if (icon) {
            gsap.to(icon, {
              rotation: 360,
              duration: 20,
              ease: 'none',
              repeat: -1
            });
          }

          card.addEventListener('mouseenter', function() {
            gsap.to(this, {
              y: -8,
              scale: 1.03,
              duration: 0.3,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', function() {
            gsap.to(this, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            });
          });
        });
      }

      if (mainImage) {
        gsap.fromTo(
          mainImage,
          { opacity: 0, scale: 0.95, x: 50 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: qualityRef.current,
              start: 'top 70%',
              once: true
            }
          }
        );
      }
    }

    if (faqRef.current && faqHeadingRef.current) {
      gsap.fromTo(
        faqHeadingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: faqRef.current,
            start: 'top 75%',
            once: true
          }
        }
      );

      const faqItems = faqRef.current.querySelectorAll('.accordion-item');
      if (faqItems.length > 0) {
        gsap.fromTo(
          faqItems,
          {
            opacity: 0,
            y: 30,
            rotateX: -15
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: faqRef.current,
              start: 'top 70%',
              once: true
            }
          }
        );
      }
    }

    if (featuredRef.current && featuredHeadingRef.current) {
      gsap.fromTo(
        featuredHeadingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuredRef.current,
            start: 'top 75%',
            once: true
          }
        }
      );

      const productCards = featuredRef.current.querySelectorAll('.product-card');
      if (productCards.length > 0) {
        gsap.fromTo(
          productCards,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
            rotateY: -10
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.8,
            stagger: {
              amount: 0.6,
              from: 'start',
              ease: 'power2.inOut'
            },
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: featuredRef.current,
              start: 'top 70%',
              once: true
            }
          }
        );

        productCards.forEach(card => {
          card.addEventListener('mouseenter', function() {
            gsap.to(this, {
              y: -10,
              scale: 1.03,
              duration: 0.4,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', function() {
            gsap.to(this, {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out'
            });
          });
        });
      }

      const viewAllBtn = featuredRef.current.querySelector('.view-all-btn');
      if (viewAllBtn) {
        gsap.to(viewAllBtn, {
          y: -5,
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    }

    if (testimonialsRef.current) {
      const testimonialCards = testimonialsRef.current.querySelectorAll('.testimonial-card');
      if (testimonialCards.length > 0) {
        gsap.fromTo(
          testimonialCards,
          {
            opacity: 0,
            y: 50,
            rotateZ: (index) => (index % 2 === 0 ? -5 : 5),
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            scale: 1,
            duration: 0.9,
            stagger: {
              amount: 0.8,
              from: 'start',
              ease: 'power1.inOut'
            },
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: testimonialsRef.current,
              start: 'top 75%',
              once: true
            }
          }
        );

        testimonialCards.forEach(card => {
          card.addEventListener('mouseenter', function() {
            gsap.to(this, {
              scale: 1.05,
              rotateZ: gsap.utils.random(-2, 2),
              duration: 0.3,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', function() {
            gsap.to(this, {
              scale: 1,
              rotateZ: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          });
        });
      }
    }

    if (storyRef.current && storyTextRef.current && storyVideoRef.current) {
      const paragraphs = storyTextRef.current.querySelectorAll('p');
      const heading = storyTextRef.current.querySelector('h2');

      gsap.fromTo(
        heading,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 70%',
            once: true
          }
        }
      );

      gsap.fromTo(
        paragraphs,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 65%',
            once: true
          }
        }
      );

      gsap.fromTo(
        storyVideoRef.current,
        {
          opacity: 0,
          x: 40,
          scale: 0.95
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 70%',
            once: true
          }
        }
      );

      gsap.to(storyVideoRef.current, {
        y: -20,
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    if (whyChooseRef.current) {
      const featureCards = whyChooseRef.current.querySelectorAll('.feature-card');
      if (featureCards.length > 0) {
        gsap.fromTo(
          featureCards,
          {
            opacity: 0,
            y: 50,
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.2,
            ease: 'elastic.out(1, 0.6)',
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: 'top 75%',
              once: true
            }
          }
        );

        featureCards.forEach(card => {
          const icon = card.querySelector('.feature-icon');
          if (icon) {
            gsap.to(icon, {
              y: -8,
              duration: 2,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1
            });
          }

          card.addEventListener('mouseenter', function() {
            gsap.to(this, {
              y: -12,
              scale: 1.05,
              duration: 0.4,
              ease: 'power2.out'
            });
          });

          card.addEventListener('mouseleave', function() {
            gsap.to(this, {
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: 'power2.out'
            });
          });
        });
      }
    }

    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            once: true
          }
        }
      );

      const ctaBtn = ctaRef.current.querySelector('.cta-button');
      if (ctaBtn) {
        gsap.to(ctaBtn, {
          scale: 1.05,
          duration: 1.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [products]);

  // Seed data products to exclude (demo/sample products)
  const SEED_PRODUCT_IDS = ['PROD-001', 'PROD-002', 'PROD-003'];

  // Filter out seed data products and select first 8 for featured section
  const featuredProducts = products
    .filter(product => !SEED_PRODUCT_IDS.includes(product.id) && product.stock > 0)
    .slice(0, 8);

  return (
    <div className="min-h-screen">
      <section ref={heroRef} className="relative h-[700px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src='https://www.pexels.com/download/video/4554539/'
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="hero-content relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Transform Your Space with <span className="text-primary-400">Premium Workspace Solutions</span>
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-gray-200 font-light">
              Discover ergonomic office chairs, smart height-adjustable desks, and modern workspace solutions designed to enhance comfort, productivity, and style. Explore vcare’s premium products collection built for Sri Lankan homes and offices.
            </p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={qualityRef}
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="quality-heading text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Crafted With <span className="text-primary-600">Excellence</span>
            </h2>
            <p className="quality-subtitle text-lg text-gray-600 max-w-2xl mx-auto">
              Why Our Products Stands Out
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              {qualityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`quality-feature-card group cursor-pointer p-6 rounded-2xl transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-white shadow-2xl border-2 border-primary-600'
                        : 'bg-white/60 shadow-md hover:shadow-lg border-2 border-transparent'
                    }`}
                    onMouseEnter={() => setActiveFeature(index)}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`feature-icon flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeFeature === index
                          ? 'bg-primary-600 text-white scale-110'
                          : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'
                      }`}>
                        <Icon className="w-7 h-7" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {feature.title}
                          </h3>
                          <div className="text-right">
                            <div className={`text-2xl font-extrabold transition-colors duration-300 ${
                              activeFeature === index ? 'text-primary-600' : 'text-gray-400'
                            }`}>
                              {feature.stat}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {feature.statLabel}
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          activeFeature === index ? 'text-gray-700' : 'text-gray-600'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative">
              <div className="quality-main-image relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={qualityFeatures[activeFeature].image}
                  alt={qualityFeatures[activeFeature].title}
                  className="w-full h-[600px] object-cover transition-all duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Featured Quality</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">
                    {qualityFeatures[activeFeature].title}
                  </h3>
                  <div className="flex items-center gap-2 text-primary-300">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-semibold">
                      {qualityFeatures[activeFeature].stat} {qualityFeatures[activeFeature].statLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -z-10 top-8 right-8 w-full h-full bg-primary-200 rounded-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-extrabold text-primary-600 mb-2">2 Yr</div>
              <div className="text-sm text-gray-600 font-medium">Warranty Coverage</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-extrabold text-primary-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 font-medium">Island-Wide Delivery</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-extrabold text-primary-600 mb-2">5★</div>
              <div className="text-sm text-gray-600 font-medium">Customer Reviews</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-extrabold text-primary-600 mb-2">Pro</div>
              <div className="text-sm text-gray-600 font-medium">Assembly Service</div>
            </div>
          </div>
        </div>
      </section>

     

      <section className="py-16 bg-white" ref={featuredRef}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={featuredHeadingRef} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our most popular furniture pieces</p>
          </div>

          {listLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="view-all-btn inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      

      <section ref={storyRef} className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div ref={storyTextRef}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Vcare, operating under Vogue Holdings (Pvt) Ltd, was founded with a clear mission: to bring premium workspace solutions to Sri Lankan homes and offices. We understand that where you work matters, and the right furniture can transform your productivity and well-being.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our philosophy centers on four core principles: comfort that supports you through long work hours, real-world functionality that adapts to your needs, quality materials that stand the test of time, and modern minimal aesthetics that elevate any space.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we serve professionals working remotely, corporate offices, students, freelancers, and homeowners across Sri Lanka with island-wide delivery and personalized service from our Battaramulla showroom.
              </p>
            </div>
            <div ref={storyVideoRef}>
              <YouTubeEmbed
                videoId="jU0sUJVIwDk"
                title="Vcare Workspace Solutions - Showroom Tour"
              />
            </div>
          </div>
        </div>
      </section>

      <section ref={whyChooseRef} className="py-20 bg-gradient-to-br from-white to-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Why Choose <span className="text-primary-600">Vcare</span>?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Premium workspace solutions designed for comfort, productivity, and style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="feature-card group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <div className="feature-icon w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Metal bases, reinforced frames, and durable materials built to last.</p>
            </div>

            <div className="feature-card group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <div className="feature-icon w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Island-Wide Delivery</h3>
              <p className="text-gray-600">Fast, reliable delivery across Sri Lanka with professional assembly.</p>
            </div>

            <div className="feature-card group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
              <div className="feature-icon w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Up to 2-Year Warranty</h3>
              <p className="text-gray-600">Extended warranty coverage on selected items for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={testimonialsRef} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from Sri Lankan professionals who trust Vcare
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-16 bg-primary-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Workspace?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Explore Smart Desks, Ergonomic Chairs, and more with island-wide delivery
          </p>
          <Link
            to="/products"
            className="cta-button inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Shop Now
          </Link>
        </div>
      </section>

       <section ref={faqRef} className="py-20 bg-gray-50">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={faqHeadingRef} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our furniture and services
            </p>
          </div>
          <div className="accordion-item">
            <Accordion items={faqData} />
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default HomePage;
