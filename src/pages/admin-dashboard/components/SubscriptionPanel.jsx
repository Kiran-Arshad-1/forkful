import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import StatusBadge from './StatusBadge';

const invoices = [
  { id: 'INV-2026-031', vendor: 'Spice Garden', amount: '$30.00', date: '03/01/2026', status: 'paid' },
  { id: 'INV-2026-030', vendor: 'The Jerk Shack', amount: '$30.00', date: '03/01/2026', status: 'paid' },
  { id: 'INV-2026-029', vendor: 'Island Bites', amount: '$30.00', date: '02/01/2026', status: 'past_due' },
  { id: 'INV-2026-028', vendor: 'Curry House', amount: '$30.00', date: '02/01/2026', status: 'paid' },
  { id: 'INV-2026-027', vendor: 'Mama\'s Kitchen', amount: '$30.00', date: '01/01/2026', status: 'paid' },
];

const subStats = [
  { label: 'Trial', count: 24, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active', count: 142, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Past Due', count: 8, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Cancelled', count: 15, color: 'text-gray-600', bg: 'bg-gray-100' },
];

const SubscriptionPanel = () => {
  const [toast, setToast] = useState(null);

  const handleAction = (action, vendor) => {
    setToast(`${action} for ${vendor} processed successfully.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Subscription Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subStats?.map((s) => (
          <div key={s?.label} className={`${s?.bg} rounded-xl p-4 flex flex-col gap-1`}>
            <p className={`text-2xl font-bold font-data ${s?.color}`}>{s?.count}</p>
            <p className="text-xs text-muted-foreground font-caption">{s?.label}</p>
          </div>
        ))}
      </div>
      {/* Revenue Summary */}
      <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h3 className="font-heading font-semibold text-foreground mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'MRR (Monthly Recurring)', value: '$4,260', icon: 'TrendingUp', color: 'text-secondary' },
            { label: 'ARR (Annual Run Rate)', value: '$51,120', icon: 'BarChart2', color: 'text-primary' },
            { label: 'Overdue Amount', value: '$240', icon: 'AlertCircle', color: 'text-accent' },
          ]?.map(({ label, value, icon, color }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Icon name={icon} size={20} color={`var(--color-${color?.replace('text-', '')})`} />
              <div>
                <p className={`text-lg font-bold font-data ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground font-caption">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Invoices */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">Recent Invoices</h3>
          <Button variant="ghost" size="xs" iconName="Download" iconPosition="left">Export</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Recent invoices table">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground font-caption uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices?.map((inv) => (
                <tr key={inv?.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-4 py-3 font-data text-xs text-foreground">{inv?.id}</td>
                  <td className="px-4 py-3 font-body text-foreground">{inv?.vendor}</td>
                  <td className="px-4 py-3 font-data text-foreground">{inv?.amount}</td>
                  <td className="px-4 py-3 font-data text-xs text-muted-foreground">{inv?.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv?.status === 'paid' ? 'active' : inv?.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="xs" iconName="Eye" onClick={() => handleAction('View invoice', inv?.vendor)}>View</Button>
                      {inv?.status === 'past_due' && (
                        <Button variant="warning" size="xs" iconName="RefreshCw" onClick={() => handleAction('Retry payment', inv?.vendor)}>Retry</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-toast bg-foreground text-background px-4 py-3 rounded-lg shadow-xl text-sm font-body flex items-center gap-2">
          <Icon name="CheckCircle" size={16} color="var(--color-success)" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPanel;