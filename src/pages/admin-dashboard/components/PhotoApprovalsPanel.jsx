import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from 'components/AppIcon';

const STATUS_TABS = [
  { id: 'pending',  label: 'Pending',  color: '#C9A84C' },
  { id: 'approved', label: 'Approved', color: '#10B981' },
  { id: 'rejected', label: 'Rejected', color: '#F87171' },
  { id: 'hidden',   label: 'Hidden',   color: '#9BA4E8' },
];

const STATUS_ACTIONS = {
  pending:  [
    { status: 'approved', label: 'Approve', icon: 'Check',     bg: '#10B981', color: '#FFFFFF' },
    { status: 'rejected', label: 'Reject',  icon: 'X',         bg: '#F87171', color: '#FFFFFF' },
    { status: 'hidden',   label: 'Hide',    icon: 'EyeOff',    bg: 'rgba(155,164,232,0.2)', color: '#9BA4E8' },
  ],
  approved: [
    { status: 'hidden',   label: 'Hide',    icon: 'EyeOff',    bg: 'rgba(155,164,232,0.2)', color: '#9BA4E8' },
    { status: 'rejected', label: 'Reject',  icon: 'X',         bg: '#F87171', color: '#FFFFFF' },
  ],
  rejected: [
    { status: 'approved', label: 'Approve', icon: 'Check',     bg: '#10B981', color: '#FFFFFF' },
    { status: 'pending',  label: 'Reset',   icon: 'RotateCcw', bg: 'rgba(201,168,76,0.2)', color: '#C9A84C' },
  ],
  hidden: [
    { status: 'approved', label: 'Approve', icon: 'Check',     bg: '#10B981', color: '#FFFFFF' },
    { status: 'pending',  label: 'Reset',   icon: 'RotateCcw', bg: 'rgba(201,168,76,0.2)', color: '#C9A84C' },
  ],
};

const STATUS_BADGE = {
  pending:  { label: 'Pending Review', color: '#C9A84C', bg: 'rgba(201,168,76,0.15)'  },
  approved: { label: 'Approved',       color: '#10B981', bg: 'rgba(16,185,129,0.15)'  },
  rejected: { label: 'Rejected',       color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  hidden:   { label: 'Hidden',         color: '#9BA4E8', bg: 'rgba(155,164,232,0.15)' },
};

const PhotoApprovalsPanel = ({ onPendingCountChange }) => {
  const [activeTab, setActiveTab]   = useState('pending');
  const [photos, setPhotos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [counts, setCounts]         = useState({ pending: 0, approved: 0, rejected: 0, hidden: 0 });
  const [toast, setToast]           = useState(null);
  const [lightbox, setLightbox]     = useState(null); // photo url string

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Counts: single query, aggregate in JS (was 4 round-trips, now 1) ─────────
  const fetchCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('status');
    if (error) return;
    const newCounts = { pending: 0, approved: 0, rejected: 0, hidden: 0 };
    (data ?? []).forEach(({ status }) => {
      if (status in newCounts) newCounts[status]++;
    });
    setCounts(newCounts);
    onPendingCountChange?.(newCounts.pending);
  }, [onPendingCountChange]);

  // ── Photos for active tab ──────────────────────────────────────────────────
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('status', activeTab)
      .order('created_at', { ascending: false });
    if (error) { showToast(error.message, true); setLoading(false); return; }
    setPhotos(data ?? []);
    setLoading(false);
  }, [activeTab]);

  // On mount: both in parallel (2 queries total, down from 5)
  useEffect(() => {
    Promise.all([fetchCounts(), fetchPhotos()]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On tab switch: only re-fetch the photo list, counts stay cached
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // ── Update status ──────────────────────────────────────────────────────────
  const handleStatusChange = async (photo, newStatus) => {
    // Optimistic remove from current tab list
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setCounts((prev) => ({
      ...prev,
      [photo.status]: Math.max(0, prev[photo.status] - 1),
      [newStatus]: prev[newStatus] + 1,
    }));
    onPendingCountChange?.(
      newStatus === 'pending'
        ? counts.pending + 1
        : activeTab === 'pending'
          ? Math.max(0, counts.pending - 1)
          : counts.pending
    );

    const { error } = await supabase
      .from('gallery_photos')
      .update({ status: newStatus })
      .eq('id', photo.id);

    if (error) {
      showToast(error.message, true);
      fetchPhotos(); // rollback
      fetchCounts();
    } else {
      showToast(`Photo ${newStatus} successfully.`);
    }
  };

  const badge = (status) => STATUS_BADGE[status] ?? STATUS_BADGE.pending;

  return (
    <div className="flex flex-col gap-5">

      {/* Status tab bar */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(({ id, label, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background:  activeTab === id ? `${color}22` : 'rgba(155,164,232,0.08)',
              color:       activeTab === id ? color : '#9BA4E8',
              border:      `1px solid ${activeTab === id ? color + '66' : 'rgba(155,164,232,0.2)'}`,
            }}
          >
            {label}
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: activeTab === id ? color : 'rgba(155,164,232,0.2)', color: activeTab === id ? '#0F1A5C' : '#9BA4E8' }}
            >
              {counts[id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }}
          />
        </div>
      )}

      {/* Empty */}
      {!loading && photos.length === 0 && (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-20"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <Icon name="ImageOff" size={28} color="#C9A84C" />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>No {activeTab} photos</p>
          <p className="text-xs mt-1" style={{ color: '#9BA4E8' }}>All caught up!</p>
        </div>
      )}

      {/* Photo grid */}
      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const actions = STATUS_ACTIONS[photo.status] ?? [];
            const bdg     = badge(photo.status);
            return (
              <div
                key={photo.id}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                {/* Image */}
                <div
                  className="relative aspect-square overflow-hidden cursor-pointer group"
                  onClick={() => setLightbox(photo.photo_url)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || 'Gallery photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '/assets/images/no_image.png'; }}
                  />
                  {/* Zoom hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Icon name="ZoomIn" size={24} color="white" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {/* Status badge overlay */}
                  <div className="absolute top-2 left-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: bdg.bg, color: bdg.color }}
                    >
                      {bdg.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <div>
                    <p className="text-xs font-semibold truncate" style={{ color: '#FFFFFF' }}>
                      {photo.caption || <span style={{ color: '#9BA4E8' }}>No caption</span>}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#9BA4E8' }}>
                      <Icon name="Store" size={11} color="#9BA4E8" />
                      {photo.username}
                    </p>
                    {photo.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {photo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(155,164,232,0.1)', color: '#9BA4E8' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(155,164,232,0.5)' }}>
                      {photo.created_at
                        ? new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : ''}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 mt-auto pt-1 flex-wrap">
                    {actions.map((action) => (
                      <button
                        key={action.status}
                        onClick={() => handleStatusChange(photo, action.status)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: action.bg, color: action.color }}
                      >
                        <Icon name={action.icon} size={12} color={action.color} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', zIndex: 99999 }}
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
            >
              <Icon name="X" size={16} color="#FFFFFF" />
            </button>
            <img
              src={lightbox}
              alt="Full size preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 max-w-sm"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.4)', color: '#FFFFFF', zIndex: 9999 }}
        >
          <Icon name={toast.isError ? 'AlertCircle' : 'CheckCircle'} size={16} color={toast.isError ? '#F87171' : '#10B981'} />
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default PhotoApprovalsPanel;
