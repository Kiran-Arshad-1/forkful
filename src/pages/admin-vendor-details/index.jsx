import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from 'components/AppIcon';
import AdminNavigation from 'components/ui/AdminNavigation';
import BusinessStatusBadge from 'components/business/BusinessStatusBadge';
import { VendorAccountSection, VendorProfileHeader } from 'components/vendor/VendorProfileView';
import { supabase } from '../../lib/supabase';

const getBusinessImage = (business) => {
  const firstPhoto = Array.isArray(business?.business_images_urls)
    ? business.business_images_urls.find(Boolean)
    : null;
  if (typeof firstPhoto === 'string') return firstPhoto;
  return firstPhoto?.photo_url || firstPhoto?.url || business?.image_url || '';
};

const AdminVendorDetails = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadVendor = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data: vendor, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('vendor_id', vendorId)
      .maybeSingle();

    if (vendorError || !vendor) {
      setError(vendorError?.message || 'This vendor could not be found.');
      setLoading(false);
      return;
    }

    const { data: vendorBusinesses, error: businessesError } = await supabase
      .from('vendors_businesses')
      .select('*')
      .eq('owner_id', vendor.vendor_id)
      .order('created_at', { ascending: false });

    setProfile(vendor);
    setBusinesses(vendorBusinesses || []);
    if (businessesError) setError(`Vendor loaded, but businesses could not be loaded: ${businessesError.message}`);
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const normalizedStatus = String(profile?.approval_status || '').toLowerCase();
  const isActive = ['active', 'approved'].includes(normalizedStatus);

  const updateVendorStatus = async () => {
    const nextStatus = isActive ? 'block' : 'active';
    setActionLoading(true);
    const { error: updateError } = await supabase
      .from('vendor_profiles')
      .update({ approval_status: nextStatus })
      .eq('vendor_id', vendorId);

    if (updateError) {
      setToast(`Error: ${updateError.message}`);
      setActionLoading(false);
      return;
    }

    setProfile((current) => ({ ...current, approval_status: nextStatus }));
    setToast(nextStatus === 'active' ? 'Vendor approved successfully.' : 'Vendor blocked successfully.');
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A5C]">
        <AdminNavigation isCollapsed activeSection="vendors" />
        <main className="min-h-screen lg:ml-[72px] flex items-center justify-center">
          <div className="text-center"><div className="w-10 h-10 mx-auto rounded-full border-4 border-[#FBC33B]/30 border-t-[#FBC33B] animate-spin" /><p className="mt-4 text-sm text-[#9FB5F5]">Loading vendor profile...</p></div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F1A5C]">
        <AdminNavigation isCollapsed activeSection="vendors" />
        <main className="min-h-screen lg:ml-[72px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center rounded-2xl border border-[#1D4ED8] bg-[#0A2463] p-8">
            <span className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center"><Icon name="CircleAlert" size={25} color="#F87171" /></span>
            <h1 className="mt-4 text-xl font-bold text-white">Vendor unavailable</h1>
            <p className="mt-2 text-sm text-[#9FB5F5]">{error}</p>
            <button type="button" onClick={() => navigate('/admin-dashboard?section=vendors')} className="mt-6 px-5 py-2.5 rounded-xl bg-[#FBC33B] text-[#061538] text-sm font-bold">Back to vendors</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A5C]">
      <AdminNavigation isCollapsed activeSection="vendors" />
      <main className="min-h-screen lg:ml-[72px]">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-7 py-6 sm:py-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => navigate('/admin-dashboard?section=vendors')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#9FB5F5] hover:text-white transition-colors"><Icon name="ArrowLeft" size={17} />Back to vendors</button>
            <span className="text-xs text-[#9FB5F5]">Admin vendor profile</span>
          </div>

          <VendorProfileHeader
            profile={profile}
            actions={[{
              label: actionLoading ? 'Updating...' : isActive ? 'Block vendor' : 'Approve vendor',
              icon: isActive ? 'Ban' : 'Check',
              variant: isActive ? 'danger' : 'gold',
              onClick: updateVendorStatus,
              disabled: actionLoading,
            }]}
          />

          <VendorAccountSection profile={profile} />

          <section className="rounded-2xl overflow-hidden bg-[#0A2463] border border-[#1D4ED8]">
            <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-4 border-b border-[#254477]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#3C351E] border border-[#FBC33B]"><Icon name="Store" size={19} color="#FBC33B" /></span>
                <div><h2 className="text-sm sm:text-base font-bold text-white">Vendor Businesses</h2><p className="text-xs mt-0.5 text-[#9FB5F5]">Businesses owned by this vendor. Select one to view its complete details.</p></div>
              </div>
              <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/50">{businesses.length} total</span>
            </div>

            <div className="p-4 sm:p-5">
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {businesses.map((business) => {
                    const image = getBusinessImage(business);
                    return (
                      <button key={business.id} type="button" onClick={() => navigate(`/admin-dashboard/businesses/${business.id}`)} className="group text-left rounded-2xl overflow-hidden bg-[#081C49] border border-[#254477] hover:border-[#FBC33B]/70 hover:-translate-y-0.5 hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 p-4">
                          <span className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#0D2F83] border border-[#1D4ED8]">
                            {image ? <img src={image} alt={business.name} className="w-full h-full object-cover" /> : <Icon name="Store" size={22} color="#647DBA" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2"><span className="font-bold text-white truncate">{business.name || 'Unnamed business'}</span><Icon name="ArrowUpRight" size={15} color="#FBC33B" className="flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
                            <span className="block mt-1 text-xs text-[#9FB5F5] truncate">{[business.category || business.cuisine_type, business.parish].filter(Boolean).join(' · ') || 'No category or parish'}</span>
                            <BusinessStatusBadge status={business.status} className="mt-2" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center rounded-xl bg-[#081C49] border border-[#254477]"><Icon name="Store" size={32} color="#647DBA" className="mx-auto" /><p className="mt-3 text-sm font-semibold text-white">No businesses found</p><p className="mt-1 text-xs text-[#9FB5F5]">This vendor has not created a business yet.</p></div>
              )}
            </div>
          </section>

          {error && <div className="rounded-xl px-4 py-3 text-sm text-amber-200 bg-amber-500/10 border border-amber-400/30">{error}</div>}
        </div>
      </main>

      {toast && <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-[#FBC33B]/40 bg-[#0A2463] px-4 py-3 text-sm text-white shadow-xl flex items-center gap-2"><Icon name={toast.startsWith('Error:') ? 'CircleAlert' : 'CheckCircle'} size={16} color={toast.startsWith('Error:') ? '#F87171' : '#10D6A0'} />{toast}</div>}
    </div>
  );
};

export default AdminVendorDetails;
