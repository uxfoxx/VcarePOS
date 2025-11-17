import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';

const AccordionItem = ({ question, answer, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(iconRef.current, {
        rotation: 180,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });
      gsap.to(iconRef.current, {
        rotation: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isOpen]);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="text-lg font-semibold text-gray-900 pr-8">{question}</span>
        <span
          ref={iconRef}
          className="flex-shrink-0 w-6 h-6 text-primary-600"
        >
          <ChevronDown className="w-full h-full" />
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="px-6 pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

const Accordion = ({ items, allowMultiple = false, className = '' }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndexes.includes(index)}
          onToggle={() => toggleItem(index)}
        />
      ))}
    </div>
  );
};

export default Accordion;
