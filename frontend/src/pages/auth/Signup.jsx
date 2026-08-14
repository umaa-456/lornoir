import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField, { inputClass } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      toast.success('Account created — check your email to verify.');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join the House"
      title="Create Account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Helmet><title>Create Account — L'Or Noir</title></Helmet>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Full Name" error={errors.name?.message}>
          <input
            className={inputClass}
            placeholder="Amelia Hart"
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
          />
        </FormField>

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

        <FormField label="Password" error={errors.password?.message}>
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

        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            className={inputClass}
            placeholder="Repeat your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
        </FormField>

        <label className="flex items-start gap-2.5 text-sm text-ivory/60">
          <input
            type="checkbox"
            className="accent-gold mt-0.5"
            {...register('terms', { required: 'You must accept the terms to continue' })}
          />
          I agree to the{' '}
          <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link> and{' '}
          <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
        </label>
        {errors.terms && <p className="text-ember-light text-xs -mt-3">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={submitting}
          data-cursor-hover
          className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
