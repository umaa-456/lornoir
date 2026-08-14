import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlinePhone } from 'react-icons/hi';
import Reveal from '@/components/ui/Reveal';
import FormField, { inputClass } from '@/components/ui/FormField';
import api from '@/services/api';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { settings } = useSiteSettings();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/contact', data);
      setSent(true);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send your message — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 md:px-10">
      <Helmet>
        <title>Contact — L'Or Noir</title>
        <meta name="description" content="Get in touch with L'Or Noir." />
      </Helmet>

      <Reveal className="mb-14 max-w-xl">
        <p className="eyebrow mb-3">Get in Touch</p>
        <h1 className="heading-display text-4xl md:text-5xl mb-6">Contact Us</h1>
        <p className="text-ivory/60 leading-relaxed">
          Questions about an order, a fragrance, or a wholesale inquiry —
          write to us and someone from the atelier will reply within two
          business days.
        </p>
      </Reveal>

      <div className="grid lg:grid-cols-[1fr_360px] gap-14">
        <Reveal delay={0.1}>
          {sent ? (
            <div className="glass p-8">
              <p className="font-display text-2xl mb-2">Message sent.</p>
              <p className="text-ivory/60 text-sm">Thank you for writing in — we'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField label="Name" error={errors.name?.message}>
                  <input className={inputClass} {...register('name', { required: 'Name is required' })} />
                </FormField>
                <FormField label="Email" error={errors.email?.message}>
                  <input
                    type="email"
                    className={inputClass}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                </FormField>
              </div>
              <FormField label="Subject">
                <input className={inputClass} {...register('subject')} />
              </FormField>
              <FormField label="Message" error={errors.message?.message}>
                <textarea
                  rows={6}
                  className={inputClass}
                  {...register('message', {
                    required: 'Message is required',
                    minLength: { value: 10, message: 'Please write a bit more' },
                  })}
                />
              </FormField>
              <button
                type="submit"
                disabled={submitting}
                data-cursor-hover
                className="px-8 py-3.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.15} className="space-y-6">
          <ContactRow icon={HiOutlineMail} label="Email" value={settings.contact.email} />
          <ContactRow icon={HiOutlinePhone} label="Phone" value={settings.contact.phone} />
          <ContactRow icon={HiOutlineLocationMarker} label="Atelier" value={settings.contact.address} />
        </Reveal>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-gold text-xl mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] tracking-widest2 uppercase text-ivory/40">{label}</p>
        <p className="text-sm text-ivory/80 mt-1">{value}</p>
      </div>
    </div>
  );
}
