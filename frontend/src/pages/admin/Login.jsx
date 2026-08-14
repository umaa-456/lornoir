import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField, { inputClass } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      if (!['admin', 'employee'].includes(user.role)) {
        toast.error('This account does not have console access');
        return;
      }
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Administration" title="Console Sign In" subtitle="Staff access only">
      <Helmet>
        <title>Admin Sign In — L'Or Noir</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Email" error={errors.email?.message}>
          <input
            type="email"
            className={inputClass}
            {...register('email', { required: 'Email is required' })}
          />
        </FormField>
        <FormField label="Password" error={errors.password?.message}>
          <input
            type="password"
            className={inputClass}
            {...register('password', { required: 'Password is required' })}
          />
        </FormField>
        <button
          type="submit"
          disabled={submitting}
          data-cursor-hover
          className="w-full py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold hover:bg-gold-pale transition-colors disabled:opacity-50"
        >
          {submitting ? 'Signing In…' : 'Enter Console'}
        </button>
      </form>
    </AuthLayout>
  );
}
