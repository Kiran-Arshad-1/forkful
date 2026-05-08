import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import useAuthStore from '../../store/authStore';

const RejectedAccount = () => {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuthStore();

  useEffect(() => {
    if (role === 'vendor' && profile?.approval_status === 'approved') {
      navigate('/vendor-dashboard', { replace: true });
    }
  }, [role, profile, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/vendor/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0F1A5C' }}>
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-8">
          <img src="/assets/images/IG_Post-1772727015258.png" alt="ForkFul" className="h-14 w-auto object-contain" />
        </div>

        <div
          className="rounded-2xl p-8 md:p-10"
          style={{ background: '#1B2A8B', border: '1px solid rgba(248,113,113,0.3)', boxShadow: '0 8px 32px rgba(248,113,113,0.1)' }}
        >
          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(248,113,113,0.1)', border: '2px solid rgba(248,113,113,0.35)' }}
          >
            <Icon name="XCircle" size={36} color="#F87171" />
          </div>

          <h1 className="text-2xl font-bold font-heading mb-3" style={{ color: '#FFFFFF' }}>
            Application Not Approved
          </h1>
          <p className="text-sm font-body mb-6" style={{ color: '#9BA4E8' }}>
            Unfortunately, we were unable to approve{' '}
            <span style={{ color: '#FFFFFF' }}>{profile?.business_name || 'your account'}</span>'s
            application at this time. This decision may be based on our current listing guidelines.
          </p>

          {/* Next steps */}
          <div
            className="rounded-xl p-5 mb-6 text-left"
            style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <p className="text-xs font-semibold font-caption uppercase tracking-wide mb-3" style={{ color: '#F87171' }}>
              What you can do
            </p>
            {[
              { icon: 'Mail',       text: 'Contact our support team to understand why your application was rejected.' },
              { icon: 'RefreshCw',  text: 'You may re-apply after addressing the issues raised by our team.' },
              { icon: 'HelpCircle', text: 'Review our vendor eligibility guidelines on forkfulbb.com.' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-3 mb-2 last:mb-0">
                <Icon name={icon} size={15} color="#F87171" className="flex-shrink-0 mt-0.5" />
                <p className="text-sm font-body" style={{ color: '#9BA4E8' }}>{text}</p>
              </div>
            ))}
          </div>

          <a
            href="mailto:support@forkfulbb.com?subject=Application%20Appeal%20-%20ForkFul"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 mb-4"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Mail" size={15} color="#0F1A5C" />
            Contact Support
          </a>

          <div>
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
    </div>
  );
};

export default RejectedAccount;
