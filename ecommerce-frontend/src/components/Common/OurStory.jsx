import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import gsap from 'gsap';
import { Play, X } from 'lucide-react';

const OurStory = ({ videoId, title, subtitle, description }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const playerRef = useRef(null);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    gsap.fromTo(
      modalRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
    );
  };

  const closeModal = () => {
    gsap.to(modalRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setIsModalOpen(false);
        setIsPlaying(false);
        document.body.style.overflow = 'auto';
      },
    });
  };

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-xl text-primary-600 font-semibold">{subtitle}</p>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">{description}</p>
        </div>

        <div className="relative group cursor-pointer" onClick={openModal}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-full animate-ping opacity-75" />
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          <div
            ref={modalRef}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>

            <YouTube
              videoId={videoId}
              opts={opts}
              className="w-full h-full"
              onReady={(e) => {
                playerRef.current = e.target;
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OurStory;
