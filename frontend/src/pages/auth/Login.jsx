import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField, { inputClass } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data);
      toast.success('Welcome back');
      navigate(location.state?.from || '/account');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Sign In"
      footer={
        <>
          New to L'Or Noir?{' '}
          <Link to="/signup" className="text-gold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Helmet><title>Sign In — L'Or Noir</title></Helmet>
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

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass} pr-11`}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-gold"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ivory/60 cursor-pointer">
            <input type="checkbox" {...register('remember')} className="accent-gold" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-gold hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          data-cursor-hover
          className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors disabled:opacity-50"
        >
          {submitting ? 'Signing In…' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
