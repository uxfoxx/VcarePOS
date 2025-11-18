import { Star } from 'lucide-react';

const TestimonialCard = ({ name, role, rating, review, initials, bgColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div
          className={`w-16 h-16 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xl mr-4`}
        >
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">{name}</h4>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>

      <div className="flex mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-600 leading-relaxed flex-grow">
        "{review}"
      </p>
    </div>
  );
};

export default TestimonialCard;
