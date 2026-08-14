import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField, { inputClass } from '@/components/ui/FormField';
import api from '@/services/api';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Forgot Password"
      subtitle={!sent ? "We'll email you a link to reset it." : undefined}
      footer={
        <Link to="/login" className="text-gold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <Helmet><title>Forgot Password — L'Or Noir</title></Helmet>
      {sent ? (
        <p className="text-center text-sm text-ivory/60 leading-relaxed">
          If an account exists for that email, a reset link is on its way.
          Check your inbox (and spam folder) for the next steps.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              className={inputClass}
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />
          </FormField>
          <button
            type="submit"
            disabled={submitting}
            data-cursor-hover
            className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
