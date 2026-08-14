import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineThumbUp, HiPencil, HiOutlineTrash } from 'react-icons/hi';
import { StarDisplay, StarInput } from '@/components/ui/StarRating';
import { useAuth } from '@/context/AuthContext';
import { reviewsApi } from '@/services/products';
import api from '@/services/api';

export default function ReviewsSection({ productId, productSlug }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ rating: 0, comment: '' });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    reviewsApi.listByProductSlug(productSlug).then(setReviews).catch(() => setReviews([]));
  };
  useEffect(load, [productSlug]);

  const total = reviews?.length || 0;
  const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0.0';
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews?.filter((r) => r.rating === star).length || 0,
    pct: total ? Math.round(((reviews.filter((r) => r.rating === star).length) / total) * 100) : 0,
  }));

  const openNewForm = () => {
    if (!isAuthenticated) {
      toast.error('Sign in to write a review');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setEditing(null);
    setDraft({ rating: 0, comment: '' });
    setImages([]);
    setShowForm(true);
  };

  const openEditForm = (review) => {
    setEditing(review._id);
    setDraft({ rating: review.rating, comment: review.comment });
    setShowForm(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!draft.rating) {
      toast.error('Select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await reviewsApi.update(editing, { rating: draft.rating, comment: draft.comment });
        toast.success('Review updated');
      } else {
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('rating', draft.rating);
        formData.append('comment', draft.comment);
        images.forEach((file) => formData.append('images', file));
        await reviewsApi.create(formData);
        toast.success('Review posted');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save your review');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsApi.remove(reviewId);
      toast('Review deleted', { icon: '🗑' });
      load();
    } catch {
      toast.error('Could not delete review');
    }
  };

  const markHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      load();
    } catch {
      /* non-critical - fail silently */
    }
  };

  if (!reviews) return <p className="text-ivory/50 text-sm">Loading reviews…</p>;

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-12">
      {/* Summary */}
      <div>
        <p className="font-display text-5xl">{avg}</p>
        <StarDisplay rating={Number(avg)} size="text-lg" />
        <p className="text-xs text-ivory/40 mt-2">{total} review{total !== 1 ? 's' : ''}</p>

        <div className="mt-6 space-y-2">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2 text-xs text-ivory/50">
              <span className="w-8">{b.star}★</span>
              <div className="flex-1 h-1.5 bg-gold/10 rounded-full overflow-hidden">
                <div className="h-full bg-gold" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-8 text-right">{b.count}</span>
            </div>
          ))}
        </div>

        <button
          onClick={openNewForm}
          data-cursor-hover
          className="mt-8 w-full py-3 border border-gold/40 text-xs tracking-widest2 uppercase hover:border-gold hover:text-gold transition-colors"
        >
          Write a Review
        </button>

        {showForm && (
          <form onSubmit={submitReview} className="mt-6 space-y-4 glass p-5">
            <StarInput value={draft.rating} onChange={(r) => setDraft((d) => ({ ...d, rating: r }))} />
            <textarea
              value={draft.comment}
              onChange={(e) => setDraft((d) => ({ ...d, comment: e.target.value }))}
              required
              rows={4}
              placeholder="Share how it wears, longevity, sillage…"
              className="w-full bg-transparent border border-gold/25 p-3 text-sm focus:outline-none focus:border-gold placeholder:text-ivory/40"
            />
            {!editing && (
              <label className="flex items-center gap-2 text-xs text-ivory/40 cursor-pointer hover:text-gold">
                <HiOutlinePhotograph />
                {images.length > 0 ? `${images.length} photo(s) selected` : 'Add photos (optional)'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setImages(Array.from(e.target.files).slice(0, 4))}
                />
              </label>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                data-cursor-hover
                className="flex-1 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Post Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 text-xs text-ivory/50 hover:text-gold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gold/10">
        {reviews.length === 0 && (
          <p className="text-ivory/50 text-sm">No reviews yet — be the first to share your impression.</p>
        )}
        {reviews.map((review) => {
          const isMine = isAuthenticated && review.user?._id === user?._id;
          return (
            <div key={review._id} className="py-6 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StarDisplay rating={review.rating} />
                  <p className="text-sm font-medium mt-2 flex items-center gap-2">
                    {review.user?.name || 'Anonymous'}
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] uppercase text-green-400 border border-green-400/30 px-1.5 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ivory/40">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                {isMine && (
                  <div className="flex gap-3 text-ivory/40 text-sm shrink-0">
                    <button aria-label="Edit review" data-cursor-hover onClick={() => openEditForm(review)} className="hover:text-gold">
                      <HiPencil />
                    </button>
                    <button aria-label="Delete review" data-cursor-hover onClick={() => deleteReview(review._id)} className="hover:text-ember">
                      <HiOutlineTrash />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-ivory/70 text-sm leading-relaxed mt-3 max-w-xl">{review.comment}</p>
              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img) => (
                    <img key={img.publicId} src={img.url} alt="" className="w-16 h-16 object-cover rounded-sm" />
                  ))}
                </div>
              )}
              {!isMine && (
                <button
                  onClick={() => markHelpful(review._id)}
                  className="flex items-center gap-1.5 text-xs text-ivory/40 hover:text-gold mt-3"
                  data-cursor-hover
                >
                  <HiOutlineThumbUp /> Helpful ({review.helpfulCount || 0})
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
