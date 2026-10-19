import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from 'components/AppIcon';
import AdminNavigation from 'components/ui/AdminNavigation';
import BusinessDetailsView from 'components/business/BusinessDetailsView';
import BusinessMenuList from 'components/business/BusinessMenuList';
import BusinessPhotoGallery from 'components/business/BusinessPhotoGallery';
import BusinessMediaLightbox from 'components/business/BusinessMediaLightbox';
import BusinessProfileHeader from 'components/business/BusinessProfileHeader';
import { formatBusinessLabel } from 'components/business/BusinessDetailsView';
import { supabase } from '../../lib/supabase';
import { detectPhotoCategory, fetchMenuItemsByBusiness, fetchOpeningHours } from '../../services/vendorProfileService';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'Info' },
  { id: 'menu', label: 'Menu', icon: 'UtensilsCrossed' },
  { id: 'photos', label: 'Photos', icon: 'Images' },
];

const getPhotoUrl = (photo) => {
  if (typeof photo === 'string') return photo;
  return photo?.photo_url || photo?.url || photo?.preview || '';
};

const AdminBusinessDetails = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [openingHours, setOpeningHours] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, items: [], index: 0 });

  const loadBusiness = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: businessError } = await supabase
      .from('vendors_businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle();

    if (businessError || !data) {
      setBusiness(null);
      setError(businessError?.message || 'This business could not be found.');
      setLoading(false);
      return;
    }

    setBusiness(data);
    const [hoursResult, menuResult] = await Promise.allSettled([
      fetchOpeningHours(businessId),
      fetchMenuItemsByBusiness(businessId),
    ]);

    setOpeningHours(hoursResult.status === 'fulfilled' ? hoursResult.value : null);
    setMenuItems(menuResult.status === 'fulfilled' ? menuResult.value : []);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const photos = useMemo(() => (
    Array.isArray(business?.business_images_urls)
      ? business.business_images_urls.map((photo, index) => {
        const photoUrl = getPhotoUrl(photo);
        return {
          ...(typeof photo === 'object' ? photo : {}),
          id: photo?.id || `${business?.id}-photo-${index}`,
          photo_url: photoUrl,
          caption: photo?.caption || `Photo ${index + 1}`,
          category: photo?.category || detectPhotoCategory(photoUrl),
        };
      }).filter((photo) => Boolean(photo.photo_url))
      : []
  ), [business]);

  const status = String(business?.status || 'pending').toLowerCase();
  const isPending = status === 'pending';
  const isActive = ['active', 'approved'].includes(status);
  const isBlocked = ['blocked', 'rejected', 'vendor_rejected'].includes(status);

  const sendStatusEmail = async (nextStatus, reason = '') => {
    if (!business?.owner_id) return;
    const { data: vendor } = await supabase
      .from('vendor_profiles')
      .select('email')
      .eq('vendor_id', business.owner_id)
      .maybeSingle();

    if (!vendor?.email) return;
    await supabase.functions.invoke('send-email', {
      body: {
        to: vendor.email,
        businessName: business.name,
        type: nextStatus === 'active' ? 'vendor_approved' : 'vendor_rejected',
        ...(reason ? { reason } : {}),
      },
    });
  };

  const updateStatus = async (nextStatus, reason = '') => {
    setActionLoading(true);
    const { error: updateError } = await supabase
      .from('vendors_businesses')
      .update({ status: nextStatus })
      .eq('id', businessId);

    if (updateError) {
      setToast(`Error: ${updateError.message}`);
      setActionLoading(false);
      return;
    }

    setBusiness((current) => ({ ...current, status: nextStatus }));
    setShowRejectForm(false);
    setRejectReason('');
    setToast(nextStatus === 'active' ? 'Business approved successfully.' : 'Business blocked successfully.');
    setActionLoading(false);

    sendStatusEmail(nextStatus, reason).catch(() => {
      // The status update is successful even if the optional notification fails.
    });
  };

  const openMenuImage = (images, index, name) => {
    setLightbox({
      open: true,
      index,
      items: images.map((url, imageIndex) => ({
        id: `${businessId}-${imageIndex}`,
        photo_url: url,
        caption: name,
        category: 'Menu item',
      })),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1A5C]">
        <AdminNavigation isCollapsed activeSection="businesses" />
        <main className="min-h-screen lg:ml-[72px] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
            <p className="mt-4 text-sm text-[#9BA4E8]">Loading business details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#0F1A5C]">
        <AdminNavigation isCollapsed activeSection="businesses" />
        <main className="min-h-screen lg:ml-[72px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center rounded-2xl border border-[#2A377D] bg-[#14236A] p-8">
            <span className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center"><Icon name="CircleAlert" size={25} color="#F87171" /></span>
            <h1 className="mt-4 text-xl font-bold text-white">Business unavailable</h1>
            <p className="mt-2 text-sm text-[#9BA4E8]">{error}</p>
            <button type="button" onClick={() => navigate('/admin-dashboard?section=businesses')} className="mt-6 px-5 py-2.5 rounded-lg bg-[#C9A84C] text-[#0F1A5C] text-sm font-bold">Back to businesses</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1A5C]">
      <AdminNavigation isCollapsed activeSection="businesses" />

      <main className="min-h-screen lg:ml-[72px]">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-7 py-6 sm:py-8">
          <BusinessProfileHeader
            business={business}
            onBack={() => navigate('/admin-dashboard?section=businesses')}
            metaRow={(
              <>
                <span className="inline-flex items-center gap-1.5"><Icon name="UtensilsCrossed" size={13} color="#FBC33B" />{formatBusinessLabel(business.category || business.cuisine_type)}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="Building2" size={13} color="#FBC33B" />{formatBusinessLabel(business.parish)}</span>
              </>
            )}
            actions={showRejectForm ? [] : [
              ...(isPending || isActive ? [{ label: isActive ? 'Block business' : 'Reject', icon: 'Ban', variant: 'danger', onClick: () => setShowRejectForm(true), disabled: actionLoading }] : []),
              ...(isPending || isBlocked || !isActive ? [{ label: actionLoading ? 'Updating...' : 'Approve business', icon: 'Check', variant: 'gold', onClick: () => updateStatus('active'), disabled: actionLoading }] : []),
            ]}
            statsBox={(
              <div className="grid grid-cols-3 gap-3 rounded-xl p-3.5 bg-[#081C49] border border-[#254477]">
                <div><p className="text-base font-extrabold text-white">{Number(business.rating || 0).toFixed(1)}</p><p className="text-[10px] uppercase tracking-wider mt-1 text-[#9FB5F5]">Rating</p></div>
                <div><p className="text-base font-extrabold text-white">{business.review_count || 0}</p><p className="text-[10px] uppercase tracking-wider mt-1 text-[#9FB5F5]">Reviews</p></div>
                <div><p className="text-base font-extrabold text-white">{photos.length}</p><p className="text-[10px] uppercase tracking-wider mt-1 text-[#9FB5F5]">Photos</p></div>
              </div>
            )}
          />

          {showRejectForm && (
            <section className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-5 sm:p-6">
              <div>
                <label htmlFor="reject-reason" className="block text-xs font-bold text-red-300 mb-2">Reason for rejection or blocking</label>
                <textarea id="reject-reason" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} placeholder="Explain what the vendor needs to correct." className="w-full rounded-xl border border-red-500/30 bg-[#0A194F] px-4 py-3 text-sm text-white placeholder-[#6B76B8] focus:outline-none focus:border-red-400 resize-y" />
                <div className="flex justify-end gap-3 mt-3">
                  <button type="button" onClick={() => { setShowRejectForm(false); setRejectReason(''); }} disabled={actionLoading} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#2A377D]">Cancel</button>
                  <button type="button" onClick={() => updateStatus('blocked', rejectReason.trim())} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50">{actionLoading ? 'Updating...' : 'Confirm'}</button>
                </div>
              </div>
            </section>
          )}

          <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-[#2A377D]" aria-label="Business details sections">
            {TABS.map((tab) => {
              const count = tab.id === 'menu' ? menuItems.length : tab.id === 'photos' ? photos.length : null;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-transparent text-[#9BA4E8] hover:text-white'}`}>
                  <Icon name={tab.icon} size={16} />{tab.label}{count !== null && <span className="px-2 py-0.5 rounded-full bg-[#27367D] text-[10px]">{count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="py-6">
            {activeTab === 'overview' && <BusinessDetailsView business={business} openingHours={openingHours} showSystemInfo />}
            {activeTab === 'menu' && <BusinessMenuList items={menuItems} onSelectImage={openMenuImage} />}
            {activeTab === 'photos' && <BusinessPhotoGallery photos={photos} compact showCategoryBadges />}
          </div>
        </div>
      </main>

      <BusinessMediaLightbox items={lightbox.items} currentIndex={lightbox.index} isOpen={lightbox.open} onClose={() => setLightbox((current) => ({ ...current, open: false }))} onChangeIndex={(index) => setLightbox((current) => ({ ...current, index }))} />

      {toast && <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-[#C9A84C]/40 bg-[#1B2A8B] px-4 py-3 text-sm text-white shadow-xl flex items-center gap-2"><Icon name={toast.startsWith('Error:') ? 'CircleAlert' : 'CheckCircle'} size={16} color={toast.startsWith('Error:') ? '#F87171' : '#10B981'} />{toast}</div>}
    </div>
  );
};

export default AdminBusinessDetails;
