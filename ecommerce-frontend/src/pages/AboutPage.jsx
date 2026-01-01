import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Award, Truck, Shield, Users } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const contactRef = useRef(null);
  const mapRef = useRef(null);

  const companyValues = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We source and manufacture furniture with the finest materials, ensuring durability and comfort that lasts for years.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our dedicated team provides personalized service from selection to delivery, ensuring your complete satisfaction.'
    },
    {
      icon: Truck,
      title: 'Island-Wide Delivery',
      description: 'We deliver across Sri Lanka with professional assembly services, bringing premium furniture to your doorstep.'
    },
    {
      icon: Shield,
      title: 'Warranty Assured',
      description: 'Up to 2-year warranty on selected items gives you peace of mind with every purchase.'
    }
  ];

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) {
      gsap.fromTo(
        hero.querySelector('.hero-content'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );
    }

    if (storyRef.current) {
      const storyContent = storyRef.current.querySelectorAll('.story-item');
      gsap.fromTo(
        storyContent,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 75%',
            once: true
          }
        }
      );
    }

    if (valuesRef.current) {
      const valueCards = valuesRef.current.querySelectorAll('.value-card');
      gsap.fromTo(
        valueCards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: valuesRef.current,
            start: 'top 75%',
            once: true
          }
        }
      );
    }

    if (contactRef.current) {
      gsap.fromTo(
        contactRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactRef.current,
            start: 'top 80%',
            once: true
          }
        }
      );
    }

    if (mapRef.current) {
      gsap.fromTo(
        mapRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: mapRef.current,
            start: 'top 80%',
            once: true
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section
        ref={heroRef}
        className="relative h-[500px] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-700/60" />
        <div className="hero-content relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white max-w-4xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              About Vcare
            </h1>
            <p className="text-xl sm:text-2xl mb-4 text-primary-100 font-light">
              Premium Workspace Solutions for Sri Lanka
            </p>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto">
              A division of Vogue Holdings (Pvt) Ltd, bringing comfort and productivity to homes and offices across the island.
            </p>
          </div>
        </div>
      </section>

      <section ref={storyRef} className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="story-item text-4xl font-bold text-gray-900 mb-6">
                Our <span className="text-primary-600">Story</span>
              </h2>
              <p className="story-item text-lg text-gray-600 mb-6 leading-relaxed">
                Vcare was founded with a clear mission: to bring premium workspace solutions to Sri Lankan homes and offices. Operating under Vogue Holdings (Pvt) Ltd, we recognized that where you work matters, and the right furniture can transform your productivity and well-being.
              </p>
              <p className="story-item text-lg text-gray-600 mb-6 leading-relaxed">
                From our showroom in Battaramulla, we serve professionals working remotely, corporate offices, students, freelancers, and homeowners across Sri Lanka. Every product we offer is carefully selected to meet our exacting standards for quality, comfort, and design.
              </p>
              <p className="story-item text-lg text-gray-600 leading-relaxed">
                Our commitment goes beyond selling furniture. We provide end-to-end service including personalized consultations, island-wide delivery, professional assembly, and after-sales support backed by our warranty promise.
              </p>
            </div>
            <div className="story-item">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg"
                  alt="Vcare Showroom"
                  className="rounded-2xl shadow-2xl w-full h-[450px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold">2+ Years</div>
                  <div className="text-primary-100">Serving Sri Lanka</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Philosophy</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four core principles guide everything we do at Vcare
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-4xl font-extrabold text-primary-600 mb-3">01</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Comfort</h3>
              <p className="text-gray-600 text-sm">Support through long work hours with ergonomic design</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-4xl font-extrabold text-primary-600 mb-3">02</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Functionality</h3>
              <p className="text-gray-600 text-sm">Real-world features that adapt to your needs</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-4xl font-extrabold text-primary-600 mb-3">03</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600 text-sm">Premium materials that stand the test of time</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="text-4xl font-extrabold text-primary-600 mb-3">04</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aesthetics</h3>
              <p className="text-gray-600 text-sm">Modern minimal design that elevates any space</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={valuesRef} className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-primary-600">Vcare</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best workspace solutions in Sri Lanka
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="value-card group bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 text-center"
                >
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={contactRef} className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Visit Our <span className="text-primary-600">Showroom</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our products firsthand and get personalized recommendations from our team
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">1100/1 Pannipitiya Road,<br />Battaramulla, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+94 11 234 5678</p>
                    <p className="text-gray-600">+94 77 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">info@vcare.lk</p>
                    <p className="text-gray-600">sales@vcare.lk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Ready to transform your workspace? Visit us or get in touch for a personalized consultation.
                </p>
                <Link
                  to="/products"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Browse Products
                </Link>
              </div>
            </div>

            <div ref={mapRef} className="rounded-2xl overflow-hidden shadow-lg h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9983749668074!2d79.91834507475685!3d6.8931709931389815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae250f0c5cce13d%3A0xe0dad1c23f946d42!2s1100%2F1%20Pannipitiya%20Rd%2C%20Battaramulla!5e0!3m2!1sen!2slk!4v1704067200000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vcare Showroom Location"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Workspace?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Explore our collection of Smart Desks, Ergonomic Chairs, and more
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
