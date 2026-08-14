import { useState } from 'react';
import { HiStar, HiOutlineStar } from 'react-icons/hi';

/** Read-only star display, supports half stars via percentage fill. */
export function StarDisplay({ rating, size = 'text-sm' }) {
  return (
    <div className={`flex gap-0.5 text-gold ${size}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating > i && rating < i + 1;
        return (
          <span key={i} className="relative">
            <HiOutlineStar className="opacity-40" />
            {(filled || half) && (
              <HiStar
                className="absolute inset-0"
                style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Interactive star picker for the "write a review" form. */
export function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 text-2xl text-gold" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = (hover || value) >= i + 1;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i + 1}
            aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
            data-cursor-hover
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i + 1)}
          >
            {filled ? <HiStar /> : <HiOutlineStar />}
          </button>
        );
      })}
    </div>
  );
}
