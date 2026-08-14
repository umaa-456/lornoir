import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi';
import { StarDisplay } from '@/components/ui/StarRating';
import adminApi from '@/services/adminApi';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null);

  const load = () =>
    adminApi
      .listReviewsForModeration()
      .then((d) => setReviews(d.reviews))
      .catch(() => toast.error('Could not load reviews'));

  useEffect(() => { load(); }, []);

  const remove = async (review) => {
    if (!window.confirm('Remove this review permanently?')) return;
    try {
      await adminApi.deleteReview(review._id);
      toast.success('Review removed');
      load();
    } catch {
      toast.error('Could not remove review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Moderation</p>
        <h1 className="heading-display text-3xl">Reviews</h1>
      </div>

      <div className="space-y-3">
        {!reviews && <p className="text-ivory/50">Loading reviews…</p>}
        {reviews?.map((review) => (
          <div key={review._id} className="glass p-5 flex items-start justify-between gap-4">
            <div>
              <StarDisplay rating={review.rating} />
              <p className="text-sm mt-2">
                <span className="text-gold">{review.user?.name}</span> on{' '}
                <span className="text-ivory/70">{review.product?.name}</span>
                {review.isVerifiedPurchase && (
                  <span className="ml-2 text-[10px] uppercase text-green-400">Verified Purchase</span>
                )}
              </p>
              <p className="text-ivory/60 text-sm mt-2 max-w-xl">{review.comment}</p>
              <p className="text-xs text-ivory/30 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => remove(review)} className="text-ember-light hover:opacity-70 shrink-0" aria-label="Delete review">
              <HiOutlineTrash />
            </button>
          </div>
        ))}
        {reviews?.length === 0 && <p className="text-ivory/40 text-center py-10">No reviews yet</p>}
      </div>
    </div>
  );
}
