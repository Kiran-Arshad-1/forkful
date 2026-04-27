import React from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';

const approvalOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'disabled', label: 'Disabled' },
];

const subscriptionOptions = [
  { value: 'all', label: 'All Subscriptions' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'cancelled', label: 'Cancelled' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Food Truck', label: 'Food Truck' },
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Cafe', label: 'Cafe' },
  { value: 'Street Food', label: 'Street Food' },
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
        <div className="w-40">
          <Select options={categoryOptions} value={categoryFilter} onChange={onCategoryFilter} placeholder="Category" />
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