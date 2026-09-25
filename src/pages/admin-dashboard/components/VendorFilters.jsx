import React from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';

const approvalOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'block', label: 'Block' },
];

const subscriptionOptions = [
  { value: 'all', label: 'All Subscriptions' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'cancelled', label: 'Cancelled' },
];





const VendorFilters = ({ search, onSearch, approvalFilter, onApprovalFilter, subscriptionFilter, onSubscriptionFilter, categoryFilter, onCategoryFilter, onClearFilters, selectedCount, onBulkApprove }) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Search by name, email, or location..."
          value={search}
          onChange={(e) => onSearch(e?.target?.value)}
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="w-40">
          <Select options={approvalOptions} value={approvalFilter} onChange={onApprovalFilter} placeholder="Status" />
        </div>
        <div className="w-40">
          <Select options={subscriptionOptions} value={subscriptionFilter} onChange={onSubscriptionFilter} placeholder="Subscription" />
        </div>

        <Button variant="ghost" size="sm" iconName="X" iconPosition="left" onClick={onClearFilters}>Clear</Button>
      </div>
    </div>
    {selectedCount > 0 && (
      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-sm font-medium text-amber-800 font-body">{selectedCount} vendor{selectedCount > 1 ? 's' : ''} selected</span>
        <Button variant="success" size="xs" iconName="CheckCircle" iconPosition="left" onClick={onBulkApprove}>
          Bulk Approve
        </Button>
      </div>
    )}
  </div>
);

export default VendorFilters;