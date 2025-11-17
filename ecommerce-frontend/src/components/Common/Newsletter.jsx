import { useState, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Check, AlertCircle } from 'lucide-react';

const Newsletter = ({ onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const successRef = useRef(null);
  const errorRef = useRef(null);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      animateError();
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      animateError();
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      if (onSubscribe) {
        await onSubscribe(email);
      }

      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      animateSuccess();

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
      animateError();
    }
  };

  const animateSuccess = () => {
    if (successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0, opacity: 0, rotate: -180 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.5,
          ease: 'back.out(1.7)',
        }
      );
    }
  };

  const animateError = () => {
    if (errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { x: -10 },
        {
          x: 10,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set(errorRef.current, { x: 0 });
          },
        }
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 shadow-2xl">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-3xl font-bold text-white mb-4">
          Stay Updated with Our Latest Collections
        </h3>
        <p className="text-primary-100 text-lg mb-8">
          Subscribe to our newsletter and get exclusive offers, design tips, and early access to new products.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  Subscribing...
                </span>
              ) : status === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Subscribed!
                </span>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>

          {message && (
            <div
              ref={status === 'success' ? successRef : errorRef}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl ${
                status === 'success'
                  ? 'bg-green-500/20 text-green-100'
                  : 'bg-red-500/20 text-red-100'
              }`}
            >
              {status === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          )}
        </form>

        <p className="text-primary-100 text-sm mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default Newsletter;
