import React, { useState } from 'react';
import { Search, ChevronDown, X, Eye, Check, Image as ImageIcon } from 'lucide-react';
import Select from 'components/ui/Select';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';
// Mock Data

const approvalOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'blocked', label: 'Blocked' },
];


const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Food Truck', label: 'Food Truck' },
    { value: 'Bakery', label: 'Bakery' },
    { value: 'Cafe', label: 'Cafe' },
    { value: 'Street Food', label: 'Street Food' },
];

const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    active: 'bg-green-500/20 text-green-300 border-green-500/30',
    blocked: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function AdminBusinessesList({
    search,
    onSearch,
    approvalFilter,
    onApprovalFilter,
    categoryFilter,
    onCategoryFilter,
    onClearFilters,
    businesses,
    vendors,
    handleBusinessApprove,
    handleViewDetail,
}) {
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredBusinesses = React.useMemo(() => {
        return businesses?.filter((b) => {
            const vendorEmail = b.vendorEmail || vendors?.find(v => v.vendor_id === b.owner_id)?.email || '';
            const matchSearch = !search ||
                b?.name?.toLowerCase()?.includes(search?.toLowerCase()) ||
                vendorEmail?.toLowerCase()?.includes(search?.toLowerCase()) ||
                b?.parish?.toLowerCase()?.includes(search?.toLowerCase());

            let statusVal = b.status?.toLowerCase();
            if (statusVal === 'active') statusVal = 'approved';

            const matchApproval = approvalFilter === 'all' || statusVal === approvalFilter?.toLowerCase();

            const matchCat = categoryFilter === 'all' || b?.category?.toLowerCase() === categoryFilter?.toLowerCase();

            return matchSearch && matchApproval && matchCat;
        });
    }, [businesses, search, approvalFilter, categoryFilter, vendors]);

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredBusinesses?.map(b => b.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="w-full text-white font-sans">

            {/* Filters Section */}
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
                        <Select options={categoryOptions} value={categoryFilter} onChange={onCategoryFilter} placeholder="Category" />
                    </div>
                    <Button variant="ghost" size="sm" iconName="X" iconPosition="left" onClick={onClearFilters}>Clear</Button>
                </div>
            </div>

            <div className="mb-4">
                <span className="text-sm text-[#9BA4E8]">Showing <strong className="text-white">{filteredBusinesses?.length || 0}</strong> business{filteredBusinesses?.length !== 1 ? 'es' : ''}</span>
            </div>

            {/* Table Section */}
            <div className="bg-[#182365] border border-[#2A377D] rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">

                        {/* Table Header */}
                        <thead>
                            <tr className="bg-[#1C2A75] border-b border-[#2A377D]">
                                <th className="px-6 py-4 w-12">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAll}
                                            checked={filteredBusinesses?.length > 0 && filteredBusinesses.every(b => selectedIds.includes(b.id))}
                                            className="w-4 h-4 rounded border-[#2A377D] bg-[#111A50] cursor-pointer accent-[#C9A84C]"
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider">Business</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider">Approval</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#9BA4E8] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-[#2A377D]">
                            {filteredBusinesses?.map((business) => (
                                <tr key={business.id} className="hover:bg-[#1D2B78] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(business.id)}
                                                onChange={() => toggleSelect(business.id)}
                                                className="w-4 h-4 rounded border-[#2A377D] bg-[#111A50] cursor-pointer accent-[#C9A84C]"
                                            />
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#111A50] border border-[#2A377D] flex items-center justify-center flex-shrink-0 text-[#6B76B8]">
                                                <ImageIcon size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-white">{business.name}</span>
                                                <span className="text-xs text-[#9BA4E8] mt-0.5">{business.parish}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[#9BA4E8]">
                                            {business.vendorEmail || vendors?.find(v => v.vendor_id === business.owner_id)?.email || '—'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[#9BA4E8]">{business.category || '—'}</span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm text-[#9BA4E8]">
                                            {business.submitted || (business.created_at
                                                ? new Date(business.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                                                : '—')}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div
                                            className={`inline-flex     items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${statusColors[business.status]}`}
                                        >
                                            {business.status ? (business.status.charAt(0).toUpperCase() + business.status.slice(1).toLowerCase()) : 'Pending'}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => handleViewDetail(business)} className="flex items-center gap-2 text-sm text-[#9BA4E8] hover:text-white transition-colors">
                                                <Eye size={16} />
                                                View
                                            </button>

                                            {business.status?.toLowerCase() === 'pending' && (
                                                <button onClick={() => handleBusinessApprove(business.id)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold transition-colors">
                                                    <Check size={14} strokeWidth={3} />
                                                    Approve
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
}