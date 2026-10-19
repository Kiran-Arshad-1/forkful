import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';

const SUPPORT_EMAIL = 'support@forkfulbb.com';

const HELP_TOPICS = [
  { icon: 'Store', title: 'Business listing', description: 'Questions about details, approval status, or opening hours.' },
  { icon: 'Utensils', title: 'Menu and photos', description: 'Help managing menu items or showcasing your business.' },
  { icon: 'MessageSquareText', title: 'Reviews', description: 'Guidance for reviews, replies, and customer feedback.' },
  { icon: 'CreditCard', title: 'Billing', description: 'Questions about your subscription or billing information.' },
];

const HelpTopic = ({ icon, title, description }) => (
  <div className="flex items-start gap-3.5 rounded-xl p-4" style={{ background: '#081C49', border: '1px solid #254477' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#3C351E', border: '1px solid #FBC33B' }}>
      <Icon name={icon} size={18} color="#FBC33B" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="text-xs mt-1 leading-5" style={{ color: '#9FB5F5' }}>{description}</p>
    </div>
  </div>
);

const VendorSupport = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const vendorName = profile?.full_name || user?.user_metadata?.full_name || 'Vendor';
  const vendorEmail = profile?.email || user?.email || '';
  const subject = encodeURIComponent(`ForkFul Vendor Support - ${vendorName}`);
  const body = encodeURIComponent(`Hello ForkFul Support,\n\nI need help with:\n\n\nVendor: ${vendorName}\nAccount email: ${vendorEmail || 'Not provided'}`);

  return (
    <div className="min-h-screen text-white" style={{ background: '#061538' }}>
      <header className="sticky top-0 z-20" style={{ background: '#0A2463', borderBottom: '1px solid #254477' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#3C351E', border: '1px solid #FBC33B' }}>
              <Icon name="UtensilsCrossed" size={20} color="#FBC33B" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold text-white">Fork<span style={{ color: '#FBC33B' }}>Ful</span></p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9FB5F5' }}>Vendor Support</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/vendor-dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-[#17439B]"
            style={{ border: '1px solid #254477', color: '#DCE6FF' }}
          >
            <Icon name="ArrowLeft" size={14} />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <section
          className="relative overflow-hidden rounded-3xl p-6 sm:p-9 lg:p-12"
          style={{ background: 'linear-gradient(135deg, #0D2F83 0%, #081C49 100%)', border: '1px solid #1D4ED8' }}
        >
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(251,195,59,0.09)' }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ color: '#FBC33B', background: '#3C351E', border: '1px solid #FBC33B' }}>
              <Icon name="LifeBuoy" size={14} color="#FBC33B" />
              We&apos;re here to help
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mt-5">How can we support you?</h1>
            <p className="text-sm sm:text-base mt-3 leading-7" style={{ color: '#DCE6FF' }}>
              Tell us what you need help with and include any useful business details. Our support team will review your message and assist you directly.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`}
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
              style={{ background: '#FBC33B', color: '#061538' }}
            >
              <Icon name="Mail" size={17} color="#061538" />
              Email Support
            </a>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <section className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #254477' }}>
              <h2 className="text-base font-bold">What can we help with?</h2>
              <p className="text-xs mt-1" style={{ color: '#9FB5F5' }}>Common areas where vendors may need assistance.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
              {HELP_TOPICS.map((topic) => <HelpTopic key={topic.title} {...topic} />)}
            </div>
          </section>

          <aside className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#3C351E', border: '1px solid #FBC33B' }}>
              <Icon name="MailCheck" size={21} color="#FBC33B" />
            </div>
            <h2 className="text-base font-bold mt-4">Contact information</h2>
            <p className="text-xs mt-2 leading-5" style={{ color: '#9FB5F5' }}>
              Email is the current support channel for ForkFul vendors.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 mt-5 rounded-xl p-3.5 text-sm font-semibold hover:brightness-110" style={{ background: '#081C49', border: '1px solid #254477', color: '#FFFFFF' }}>
              <Icon name="AtSign" size={16} color="#FBC33B" />
              {SUPPORT_EMAIL}
            </a>
            <div className="flex items-start gap-2 mt-4 rounded-xl p-3" style={{ background: 'rgba(29,78,216,0.12)' }}>
              <Icon name="Info" size={14} color="#9FB5F5" className="mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-5" style={{ color: '#9FB5F5' }}>
                Include your business name and account email so the team can identify your listing quickly.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default VendorSupport;
