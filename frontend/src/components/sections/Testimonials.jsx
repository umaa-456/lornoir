import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { HiStar } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';
import { reviewsApi } from '@/services/products';

export default function Testimonials() {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    reviewsApi.featured().then(setReviews).catch(() => setReviews([]));
  }, []);

  // No reviews across the catalogue yet — skip the section rather than
  // showing an empty carousel.
  if (reviews !== null && reviews.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 py-24 text-center">
      <Reveal>
        <p className="eyebrow mb-3">Words From the House</p>
        <h2 className="heading-display text-4xl md:text-5xl mb-14">What our clients say</h2>
      </Reveal>

      <Reveal delay={0.1}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          spaceBetween={40}
          slidesPerView={1}
          className="reviews-swiper"
        >
          {reviews?.map((review) => (
            <SwiperSlide key={review._id}>
              <div className="flex flex-col items-center px-6 md:px-16">
                <div className="flex gap-1 text-gold mb-6">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <HiStar key={i} />
                  ))}
                </div>
                <p className="font-display text-2xl md:text-3xl leading-snug italic mb-6">
                  "{review.comment}"
                </p>
                <p className="text-sm text-ivory/50">
                  {review.user?.name} <span className="text-gold/60">· {review.product?.name}</span>
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Reveal>
    </section>
  );
}
