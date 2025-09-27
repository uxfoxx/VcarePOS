import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import ProductCard from '../components/Products/ProductCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ChevronLeft, ChevronRight } from "lucide-react";


const HomePage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.products);

  const [current, setCurrent] = useState(0);

  const carouselImages = [
    "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg",
    "https://images.pexels.com/photos/245032/pexels-photo-245032.jpeg",
    "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg"
  ];

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Auto slide every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000);
    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Get featured products (first 8 products)
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="">
        <video
  className="w-full h-[700px] object-cover"
  src='https://www.pexels.com/download/video/4554539/'
  autoPlay
  muted
  loop
  playsInline
/>

      </section>

      

      {/* Carousel Section */}
      <section className="max-w-[1400px] mx-auto py-12 grid md:grid-cols-2 items-center gap-8">
        {/* Left side text */}
        <div>
          <h2 className="text-3xl font-bold mb-4">
            Our Desks Are Built Different
          </h2>
          <p className="text-gray-600 mb-6">
            From full solid wood tops to motors that are quieter and more
            powerful, our award-winning desks come with quality you can feel.
          </p>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right side image */}
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={carouselImages[current]}
            alt="Desk"
            className="w-full h-[600px] object-cover transition-all duration-700"
          />
        </div>
      </section>





      



      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our most popular furniture pieces</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-outline inline-block"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-white to-gray-100">
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
      {/* Card 1 */}
      <div className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
        <p className="text-gray-600">Expertly crafted furniture using only the finest sustainable materials.</p>
      </div>

      {/* Card 2 */}
      <div className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Free Delivery</h3>
        <p className="text-gray-600">Enjoy seamless delivery — fast, free, and right to your door.</p>
      </div>

      {/* Card 3 */}
      <div className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-5 transform group-hover:scale-110 transition duration-300">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">1-Year Warranty</h3>
        <p className="text-gray-600">Peace of mind guaranteed — protection on all your furniture pieces.</p>
      </div>
    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Browse our complete collection and find the perfect furniture for your home
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
