import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineTrash } from 'react-icons/hi';
import { siteSettingsApi } from '@/services/siteSettings';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function AdminBranding() {
  const { refresh } = useSiteSettings();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef(null);

  const load = () => siteSettingsApi.get().then(setSettings).catch(() => toast.error('Could not load site settings'));
  useEffect(() => { load(); }, []);

  const handleLogoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const updated = await siteSettingsApi.uploadLogo(formData);
      setSettings(updated);
      refresh();
      toast.success('Logo updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    if (!window.confirm('Remove the logo? The site will show the text wordmark instead.')) return;
    try {
      const updated = await siteSettingsApi.removeLogo();
      setSettings(updated);
      refresh();
      toast.success('Logo removed');
    } catch {
      toast.error('Could not remove logo');
    }
  };

  const saveSection = async (payload, successMessage) => {
    setSaving(true);
    try {
      const updated = await siteSettingsApi.update(payload);
      setSettings(updated);
      refresh();
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <p className="text-ivory/50">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <p className="eyebrow mb-2">Identity & Content</p>
        <h1 className="heading-display text-3xl">Branding & Content</h1>
        <p className="text-ivory/50 text-sm mt-2">
          Changes here appear across the storefront immediately — no code changes needed.
        </p>
      </div>

      {/* Logo + site name */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveSection({ siteName: settings.siteName }, 'Site name updated');
        }}
        className="glass p-6 space-y-5"
      >
        <p className="text-sm text-gold">Logo & Site Name</p>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-sm bg-obsidian-light border border-gold/20 flex items-center justify-center overflow-hidden shrink-0">
            {settings.logo?.url ? (
              <img src={settings.logo.url} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="font-script text-lg text-gold-sheen">{settings.siteName?.[0] || 'L'}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingLogo}
              className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-xs uppercase tracking-wide text-gold hover:bg-gold hover:text-obsidian transition-colors disabled:opacity-50"
            >
              <HiOutlineUpload /> {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
            {settings.logo?.url && (
              <button
                type="button"
                onClick={removeLogo}
                className="flex items-center gap-2 text-xs text-ember-light hover:underline"
              >
                <HiOutlineTrash /> Remove logo
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-ivory/40">
          No logo? The site shows your site name as a text wordmark instead — that's fine too.
        </p>

        <div>
          <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">Site Name</label>
          <input
            value={settings.siteName}
            onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Site Name'}
        </button>
      </form>

      {/* Hero section text */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveSection({ hero: settings.hero }, 'Homepage hero updated');
        }}
        className="glass p-6 space-y-4"
      >
        <p className="text-sm text-gold">Homepage Hero</p>
        <p className="text-xs text-ivory/40 -mt-2">The large headline at the top of your homepage.</p>

        <FormRow label="Eyebrow (small label above headline)">
          <input
            value={settings.hero.eyebrow}
            onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero, eyebrow: e.target.value } }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </FormRow>
        <div className="grid grid-cols-3 gap-3">
          <FormRow label="Headline line 1">
            <input
              value={settings.hero.titleLine1}
              onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero, titleLine1: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
          <FormRow label="Headline line 2 (accent)">
            <input
              value={settings.hero.titleLine2}
              onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero, titleLine2: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
          <FormRow label="Headline line 3">
            <input
              value={settings.hero.titleLine3}
              onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero, titleLine3: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
        </div>
        <FormRow label="Subtitle paragraph">
          <textarea
            rows={3}
            value={settings.hero.subtitle}
            onChange={(e) => setSettings((s) => ({ ...s, hero: { ...s.hero, subtitle: e.target.value } }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </FormRow>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Hero Text'}
        </button>
      </form>

      {/* Footer + contact */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveSection({ footerTagline: settings.footerTagline, contact: settings.contact }, 'Footer & contact info updated');
        }}
        className="glass p-6 space-y-4"
      >
        <p className="text-sm text-gold">Footer & Contact Info</p>

        <FormRow label="Footer tagline">
          <textarea
            rows={2}
            value={settings.footerTagline}
            onChange={(e) => setSettings((s) => ({ ...s, footerTagline: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </FormRow>
        <div className="grid sm:grid-cols-3 gap-3">
          <FormRow label="Contact email">
            <input
              value={settings.contact.email}
              onChange={(e) => setSettings((s) => ({ ...s, contact: { ...s.contact, email: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
          <FormRow label="Contact phone">
            <input
              value={settings.contact.phone}
              onChange={(e) => setSettings((s) => ({ ...s, contact: { ...s.contact, phone: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
          <FormRow label="Address">
            <input
              value={settings.contact.address}
              onChange={(e) => setSettings((s) => ({ ...s, contact: { ...s.contact, address: e.target.value } }))}
              className="w-full bg-transparent border border-gold/25 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
            />
          </FormRow>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Footer & Contact'}
        </button>
      </form>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">{label}</label>
      {children}
    </div>
  );
}
