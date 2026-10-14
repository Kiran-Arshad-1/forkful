import React from 'react';
import Icon from 'components/AppIcon';

const StarRating = ({ rating = 0, size = 15, showNumber = false }) => {
  const numericRating = Math.max(0, Math.min(5, parseFloat(rating) || 0));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(numericRating);
          return (
            <Icon
              key={star}
              name="Star"
              size={size}
              color={isFilled ? '#FBC33B' : 'rgba(159, 181, 245, 0.25)'}
              className={isFilled ? 'fill-[#FBC33B]' : ''}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-white">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
