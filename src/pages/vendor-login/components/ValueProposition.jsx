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
        <span
          className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-sm"
          style={{ background: '#3C351E', border: '1px solid #FBC33B', color: '#FBC33B' }}
        >
          Vendor Portal
        </span>
        <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
          Grow your food business with <span style={{ color: '#FBC33B' }}>ForkFul</span>
        </h2>
        <p className="text-sm xl:text-base max-w-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', color: '#DCE6FF' }}>
          Join hundreds of food vendors reaching new customers every day through our discovery platform.
        </p>
      </div>
      <ul className="space-y-4">
        {features?.map((f) => (
          <li key={f?.text} className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
            >
              <Icon name={f?.icon} size={18} color="#FBC33B" />
            </div>
            <span className="text-sm font-medium text-white" style={{ fontFamily: 'var(--font-body)' }}>{f?.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-2xl overflow-hidden h-44 xl:h-52 w-full shadow-xl" style={{ border: '1px solid #1D4ED8' }}>
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