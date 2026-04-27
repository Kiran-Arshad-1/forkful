import React, { useState } from 'react';
import Icon from 'components/AppIcon';


const STATUS_CONFIG = {
  trial: { label: 'Free Trial', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', icon: 'Clock' },
  active: { label: 'Active', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: 'CheckCircle' },
  past_due: { label: 'Past Due', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: 'AlertCircle' },
  cancelled: { label: 'Cancelled', color: '#9BA4E8', bg: 'rgba(155,164,232,0.1)', border: 'rgba(155,164,232,0.3)', icon: 'XCircle' },
};

const mockInvoices = [
  { id: 'INV-2026-003', date: '03/01/2026', amount: '5.99', status: 'paid', description: 'Vendor Listing - March 2026' },
  { id: 'INV-2026-002', date: '02/01/2026', amount: '5.99', status: 'paid', description: 'Vendor Listing - February 2026' },
  { id: 'INV-2026-001', date: '01/01/2026', amount: '5.99', status: 'paid', description: 'Vendor Listing - January 2026' },
  { id: 'INV-2025-012', date: '12/01/2025', amount: '5.99', status: 'paid', description: 'Vendor Listing - December 2025' },
];

const BillingTab = () => {
  const [subStatus, setSubStatus] = useState('trial');
  const [activating, setActivating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const statusCfg = STATUS_CONFIG?.[subStatus];

  const handleActivate = async () => {
    setActivating(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubStatus('active');
    setActivating(false);
  };

  const handleCancel = async () => {
    setCancelling(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubStatus('cancelled');
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Subscription Status Card */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h3 className="font-heading text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Subscription Status</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold"
            style={{ background: statusCfg?.bg, borderColor: statusCfg?.border, color: statusCfg?.color }}>
            <Icon name={statusCfg?.icon} size={16} color={statusCfg?.color} />
            {statusCfg?.label}
          </div>
          <div className="flex-1">
            {subStatus === 'trial' && (
              <p className="text-sm" style={{ color: '#9BA4E8' }}>Your free trial ends on <strong style={{ color: '#FFFFFF' }}>05/01/2026</strong>. Subscribe to keep your listing active.</p>
            )}
            {subStatus === 'active' && (
              <p className="text-sm" style={{ color: '#9BA4E8' }}>Next billing date: <strong style={{ color: '#FFFFFF' }}>04/01/2026</strong> — $9.99/month</p>
            )}
            {subStatus === 'past_due' && (
              <p className="text-sm" style={{ color: '#F87171' }}>Your payment failed. Please update your payment method to restore your listing.</p>
            )}
            {subStatus === 'cancelled' && (
              <p className="text-sm" style={{ color: '#9BA4E8' }}>Your subscription was cancelled. Reactivate to restore your listing visibility.</p>
            )}
          </div>
        </div>

        {/* Plan Details */}
        <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>Vendor Listing Plan</span>
            <span className="text-sm font-bold font-data" style={{ color: '#C9A84C' }}>$5.99/month</span>
          </div>
          <ul className="space-y-1.5">
            {['Business profile listing on ForkFul', 'Unlimited menu items', 'Up to 20 photos', 'Customer reviews & ratings', 'Performance insights & analytics']?.map(f => (
              <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#9BA4E8' }}>
                <Icon name="Check" size={13} color="#10B981" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          {(subStatus === 'trial' || subStatus === 'cancelled' || subStatus === 'past_due') && (
            <button
              disabled={activating}
              onClick={handleActivate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-250 hover:opacity-90 disabled:opacity-50"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              <Icon name="CreditCard" size={16} color="#0F1A5C" />
              {activating ? 'Processing...' : subStatus === 'cancelled' ? 'Reactivate Subscription' : 'Start Subscription — $5.99/mo'}
            </button>
          )}
          {subStatus === 'active' && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-250"
              style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#9BA4E8' }}
            >
              Cancel Subscription
            </button>
          )}
          {showCancelConfirm && (
            <div className="flex items-center gap-2 p-3 rounded-lg w-full" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <Icon name="AlertTriangle" size={16} color="#F87171" />
              <p className="text-xs flex-1" style={{ color: '#F87171' }}>Are you sure? Your listing will be hidden from customers.</p>
              <button disabled={cancelling} onClick={handleCancel} className="px-3 py-1 rounded text-xs font-bold" style={{ background: '#F87171', color: '#FFFFFF' }}>Confirm</button>
              <button onClick={() => setShowCancelConfirm(false)} className="px-3 py-1 rounded text-xs" style={{ color: '#9BA4E8' }}>Keep</button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h3 className="font-heading text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Invoice History</h3>
        {mockInvoices?.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#9BA4E8' }}>No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                  <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9BA4E8' }}>Invoice</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9BA4E8' }}>Date</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: '#9BA4E8' }}>Description</th>
                  <th className="text-right py-2 pr-4 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9BA4E8' }}>Amount</th>
                  <th className="text-right py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9BA4E8' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices?.map(inv => (
                  <tr key={inv?.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    <td className="py-3 pr-4 font-data text-xs" style={{ color: '#FFFFFF' }}>{inv?.id}</td>
                    <td className="py-3 pr-4 text-xs whitespace-nowrap" style={{ color: '#9BA4E8' }}>{inv?.date}</td>
                    <td className="py-3 pr-4 text-xs hidden sm:table-cell" style={{ color: '#9BA4E8' }}>{inv?.description}</td>
                    <td className="py-3 pr-4 text-right font-data text-xs font-semibold whitespace-nowrap" style={{ color: '#C9A84C' }}>${inv?.amount}</td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <Icon name="CheckCircle" size={11} color="#10B981" />
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTab;