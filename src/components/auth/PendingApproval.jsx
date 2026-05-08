import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuthStore();

  // If vendor somehow gets here with an approved account, send them to dashboard
  useEffect(() => {
    if (role === 'vendor' && profile?.approval_status === 'approved') {
      navigate('/vendor-dashboard', { replace: true });
    }
  }, [role, profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/vendor-login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0F1A5C' }}>
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-8">
          <img src="/assets/images/IG_Post-1772727015258.png" alt="ForkFul" className="h-14 w-auto object-contain" />
        </div>

        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 32px rgba(201,168,76,0.15)' }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)' }}
          >
            <Icon name="Clock" size={36} color="#C9A84C" />
          </div>

          <h1 className="text-2xl font-bold font-heading mb-3" style={{ color: '#FFFFFF' }}>
            Your Account Is Under Review
          </h1>
          <p className="text-sm font-body mb-6" style={{ color: '#9BA4E8' }}>
            Thanks for joining ForkFul, <span style={{ color: '#C9A84C' }}>{profile?.business_name || 'vendor'}</span>!
            Our team is reviewing your application and will get back to you within <strong style={{ color: '#FFFFFF' }}>1–2 business days</strong>.
          </p>

          {/* What happens next */}
          <div
            className="rounded-xl p-5 mb-6 text-left"
            style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <p className="text-xs font-semibold font-caption uppercase tracking-wide mb-3" style={{ color: '#C9A84C' }}>
              What happens next
            </p>
            {[
              { icon: 'Mail',        text: 'You\'ll receive an email once your account is approved or if we need more info.' },
              { icon: 'CheckCircle', text: 'Once approved, you can log back in to set up your full business profile.' },
              { icon: 'Store',       text: 'Your listing will go live after you complete your profile and activate it.' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-3 mb-2 last:mb-0">
                <Icon name={icon} size={15} color="#C9A84C" className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>{text}</p>
              </div>
            ))}
          </div>

          <p className="text-sm font-body mb-6" style={{ color: '#9BA4E8' }}>
            Questions? Email us at{' '}
            <a href="mailto:support@forkfulbb.com" className="hover:underline" style={{ color: '#C9A84C' }}>
              support@forkfulbb.com
            </a>
          </p>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 mx-auto px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(155,164,232,0.1)', color: '#9BA4E8', border: '1px solid rgba(155,164,232,0.2)' }}
          >
            <Icon name="LogOut" size={15} color="#9BA4E8" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
