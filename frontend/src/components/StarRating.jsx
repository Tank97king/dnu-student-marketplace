import React from 'react';

const StarRating = ({ rating, size = 'sm', showNumber = false }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderStars = () => {
    return (
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        {showNumber && (
          <span className="ml-1 text-gray-600 dark:text-gray-400">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  return renderStars();
};

export default StarRating;
