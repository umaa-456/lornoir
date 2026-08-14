import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField, { inputClass } from '@/components/ui/FormField';
import api from '@/services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: res } = await api.patch(`/auth/reset-password/${token}`, { password: data.password });
      window.localStorage.setItem('lornoir_token', res.token);
      setDone(true);
      toast.success('Password reset — you are signed in.');
      setTimeout(() => navigate('/account'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Reset Password"
      footer={
        <Link to="/login" className="text-gold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <Helmet><title>Reset Password — L'Or Noir</title></Helmet>
      {done ? (
        <p className="text-center text-sm text-ivory/60">Your password has been updated. Redirecting…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="New Password" error={errors.password?.message}>
            <input
              type="password"
              className={inputClass}
              placeholder="At least 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
          </FormField>
          <FormField label="Confirm New Password" error={errors.confirmPassword?.message}>
            <input
              type="password"
              className={inputClass}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
            />
          </FormField>
          <button
            type="submit"
            disabled={submitting}
            data-cursor-hover
            className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors disabled:opacity-50"
          >
            {submitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
