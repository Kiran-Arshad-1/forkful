import React from 'react';
import Icon from 'components/AppIcon';

const benefits = [
{ icon: 'Gift', text: '2-month free trial — no credit card required' },
{ icon: 'MapPin', text: 'Get discovered by food lovers in your area' },
{ icon: 'BarChart2', text: 'Track views, clicks, and engagement metrics' },
{ icon: 'Star', text: 'Collect and showcase customer reviews' }];


const BenefitsList = () =>
<div className="mb-6 p-4 rounded-xl border bg-[rgba(255,251,235,0.102)] border-[rgba(182,146,96,1)]">
    <p className="text-sm font-semibold text-foreground font-body mb-3">
      Why join ForkFul?
    </p>
    <ul className="space-y-2">
      {benefits?.map((b) =>
    <li key={b?.text} className="flex items-start gap-2">
          <Icon name={b?.icon} size={15} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
          <span className="text-sm text-foreground font-body">{b?.text}</span>
        </li>
    )}
    </ul>
  </div>;


export default BenefitsList;