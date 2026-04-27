import React from 'react';
import Icon from 'components/AppIcon';

const features = [
  { icon: 'Store', text: 'Manage your business profile and menu' },
  { icon: 'BarChart2', text: 'Track views, clicks, and engagement' },
  { icon: 'Star', text: 'Monitor customer reviews and ratings' },
  { icon: 'CreditCard', text: 'Handle billing and subscription easily' },
];

const ValueProposition = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center pr-8">
      <div className="mb-8">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#C9A84C', fontFamily: 'var(--font-caption)' }}>
          Vendor Portal
        </span>
        <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
          Grow your food business with <span style={{ color: '#C9A84C' }}>ForkFul</span>
        </h2>
        <p className="text-base max-w-sm" style={{ fontFamily: 'var(--font-body)', color: '#9BA4E8' }}>
          Join hundreds of food vendors reaching new customers every day through our discovery platform.
        </p>
      </div>
      <ul className="space-y-4">
        {features?.map((f) => (
          <li key={f?.text} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,168,76,0.15)' }}>
              <Icon name={f?.icon} size={18} color="#C9A84C" />
            </div>
            <span className="text-sm" style={{ fontFamily: 'var(--font-body)', color: '#FFFFFF' }}>{f?.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-xl overflow-hidden h-48 xl:h-56 w-full" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
        <img
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1df6b0812-1768914269309.png"
          alt="Colorful gourmet food spread with fresh vegetables, grilled meats, and vibrant sauces on wooden table"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ValueProposition;