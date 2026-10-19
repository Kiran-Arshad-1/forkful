import React from 'react';
import Icon from 'components/AppIcon';
import {
  VendorAccountSection,
  VendorProfileHeader,
  VendorProfileSection,
} from 'components/vendor/VendorProfileView';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';

const TIPS = [
  { icon: 'Store', title: 'Keep details complete', description: 'Accurate contact information and business details help customers reach you.' },
  { icon: 'Camera', title: 'Use fresh, clear photos', description: 'Show your food, space, and team with well-lit images that represent your business.' },
  { icon: 'Clock3', title: 'Maintain accurate hours', description: 'Update opening hours whenever your regular schedule or holiday availability changes.' },
  { icon: 'MessageSquareReply', title: 'Respond to reviews', description: 'Thoughtful owner replies show customers that you value their feedback and experience.' },
];

const SettingsTab = ({ onEditAccount }) => {
  const { user } = useAuthStore();
  const { profile } = useVendorProfileStore();

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBC33B]">Account Settings</p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-1">Profile & Account</h1>
        <p className="text-sm mt-1 text-[#9FB5F5]">Manage your vendor identity and account information.</p>
      </div>

      <VendorProfileHeader profile={profile} user={user} onEditAccount={onEditAccount} />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
        <VendorAccountSection profile={profile} user={user} />

        <VendorProfileSection icon="Lightbulb" title="Tips for a Stronger Listing" description="Simple ways to keep your ForkFul presence useful and attractive.">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            {TIPS.map((tip, index) => (
              <div key={tip.title} className="relative flex items-start gap-3.5 rounded-xl p-4 overflow-hidden bg-[#081C49] border border-[#254477]">
                <span className="absolute right-3 top-2 text-3xl font-black text-[#9FB5F5]/10 select-none" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#3C351E] border border-[#FBC33B]"><Icon name={tip.icon} size={18} color="#FBC33B" /></span>
                <div className="flex-1 min-w-0 relative pr-5"><p className="text-sm font-bold text-white">{tip.title}</p><p className="text-xs mt-1 leading-5 text-[#9FB5F5]">{tip.description}</p></div>
              </div>
            ))}
          </div>
          <p className="flex items-start gap-2 text-[11px] leading-5 mt-4 rounded-xl p-3 text-[#DCE6FF] bg-[#FBC33B]/10 border border-[#FBC33B]/25"><Icon name="Sparkles" size={14} color="#FBC33B" className="flex-shrink-0 mt-0.5" />Complete, current listings make it easier for customers to choose your business with confidence.</p>
        </VendorProfileSection>
      </div>
    </div>
  );
};

export default SettingsTab;
