import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import FormField, { inputClass } from '@/components/ui/FormField';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { useCart } from '@/context/CartContext';
import api from '@/services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STEPS = ['Address', 'Payment', 'Review'];

export default function Checkout() {
  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [clientSecret, setClientSecret] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (paymentMethod === 'stripe' && step === 1 && !clientSecret) {
      api
        .post('/payments/create-intent')
        .then(({ data }) => setClientSecret(data.clientSecret))
        .catch(() => toast.error('Could not initialize payment — try Cash on Delivery instead'));
    }
  }, [paymentMethod, step, clientSecret]);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const submitAddress = (data) => {
    setAddress(data);
    setStep(1);
  };

  const placeOrder = async (stripePaymentIntentId = null) => {
    setPlacingOrder(true);
    try {
      const { data: addressRes } = await api.post('/addresses', { ...address, isDefault: true });
      const { data: orderRes } = await api.post('/orders', {
        shippingAddressId: addressRes.address._id,
        paymentMethod,
        stripePaymentIntentId,
      });
      clearCart();
      navigate('/order-confirmed', { state: { order: orderRes.order } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-10">
      <Helmet><title>Checkout — L'Or Noir</title></Helmet>

      <p className="eyebrow mb-3">Complete Your Order</p>
      <h1 className="heading-display text-4xl mb-10">Checkout</h1>

      <div className="flex gap-6 mb-12">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border ${
                i <= step ? 'bg-gold text-obsidian border-gold font-semibold' : 'border-gold/25 text-ivory/40'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-xs uppercase tracking-wide ${i <= step ? 'text-gold' : 'text-ivory/40'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        <div>
          {step === 0 && (
            <form onSubmit={handleSubmit(submitAddress)} className="space-y-5 max-w-lg">
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField label="Full Name" error={errors.fullName?.message}>
                  <input className={inputClass} {...register('fullName', { required: 'Required' })} />
                </FormField>
                <FormField label="Phone" error={errors.phone?.message}>
                  <input className={inputClass} {...register('phone', { required: 'Required' })} />
                </FormField>
              </div>
              <FormField label="Address Line 1" error={errors.line1?.message}>
                <input className={inputClass} {...register('line1', { required: 'Required' })} />
              </FormField>
              <FormField label="Address Line 2">
                <input className={inputClass} {...register('line2')} />
              </FormField>
              <div className="grid sm:grid-cols-3 gap-5">
                <FormField label="City" error={errors.city?.message}>
                  <input className={inputClass} {...register('city', { required: 'Required' })} />
                </FormField>
                <FormField label="State" error={errors.state?.message}>
                  <input className={inputClass} {...register('state', { required: 'Required' })} />
                </FormField>
                <FormField label="Postal Code" error={errors.postalCode?.message}>
                  <input className={inputClass} {...register('postalCode', { required: 'Required' })} />
                </FormField>
              </div>
              <FormField label="Country" error={errors.country?.message}>
                <input className={inputClass} {...register('country', { required: 'Required' })} />
              </FormField>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="max-w-lg space-y-6">
              <div className="flex gap-3">
                <PaymentOption
                  active={paymentMethod === 'cod'}
                  onClick={() => setPaymentMethod('cod')}
                  label="Cash on Delivery"
                />
                <PaymentOption
                  active={paymentMethod === 'stripe'}
                  onClick={() => setPaymentMethod('stripe')}
                  label="Credit / Debit Card"
                />
              </div>

              {paymentMethod === 'cod' && (
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold"
                >
                  Continue to Review
                </button>
              )}

              {paymentMethod === 'stripe' &&
                (clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                    <StripePaymentForm onSuccess={(intentId) => placeOrder(intentId)} submitLabel={`Pay $${total.toFixed(2)}`} />
                  </Elements>
                ) : (
                  <p className="text-ivory/50 text-sm">Preparing secure payment form…</p>
                ))}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-lg space-y-6">
              <div className="glass p-5">
                <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-2">Deliver To</p>
                <p className="text-sm text-ivory/80">{address.fullName}, {address.line1}, {address.city}, {address.state} {address.postalCode}, {address.country}</p>
              </div>
              <div className="glass p-5">
                <p className="text-xs text-ivory/40 uppercase tracking-widest2 mb-2">Payment</p>
                <p className="text-sm text-ivory/80">Cash on Delivery</p>
              </div>
              <button
                onClick={() => placeOrder(null)}
                disabled={placingOrder}
                className="px-8 py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="glass p-6 h-fit space-y-4">
          <p className="text-sm text-gold">Order Summary</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.lineId} className="flex justify-between text-xs text-ivory/60">
                <span>{item.name} × {item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gold/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ivory/60"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-ivory/60"><span>Discount ({coupon?.code})</span><span>−${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-ivory/60"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-semibold text-base border-t border-gold/10 pt-3"><span>Total</span><span className="text-gold">${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3.5 border text-xs uppercase tracking-wide transition-colors ${
        active ? 'border-gold bg-gold text-obsidian font-semibold' : 'border-gold/25 text-ivory/60 hover:border-gold/60'
      }`}
    >
      {label}
    </button>
  );
}

const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#F2701A',
    colorBackground: '#0F192B',
    colorText: '#FFFFFF',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '2px',
  },
};
