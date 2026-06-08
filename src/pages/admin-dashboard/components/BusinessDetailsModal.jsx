import React, { useState, useEffect } from 'react';
import {
    X, MapPin, Star, Calendar, Phone, Mail, Globe,
    Tag, Clock, Info, Map, Check, XCircle, Image as ImageIcon,
    UtensilsCrossed, ChevronLeft, ChevronRight, DollarSign, Building2, Layers
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { fetchMenuItems, fetchMenuItemsByBusiness, fetchOpeningHours } from 'services/vendorProfileService';

const TABS = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
];

const statusStyle = {
    active: 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]',
    rejected: 'bg-red-500/10 border-red-500/30 text-red-400',
    pending: 'bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]',
};
const dotStyle = {
    active: 'bg-[#10B981]',
    rejected: 'bg-red-400',
    pending: 'bg-[#C9A84C] animate-pulse',
};

function Field({ label, value, mono }) {
    return (
        <div>
            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold">{label}</label>
            <p className={`text-sm font-medium text-white mt-0.5 ${mono ? 'font-mono text-xs text-[#9BA4E8] bg-[#182365] px-2 py-1 rounded border border-[#2A377D]/50 break-all' : ''}`}>
                {value || <span className="text-[#6B76B8] italic">Not provided</span>}
            </p>
        </div>
    );
}

function Section({ icon: Icon, title, children }) {
    return (
        <div className="bg-[#111A50] rounded-xl p-5 border border-[#2A377D] hover:border-[#C9A84C]/30 transition-colors">
            <h3 className="text-xs font-black text-[#6B76B8] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icon size={14} className="text-[#C9A84C]" /> {title}
            </h3>
            {children}
        </div>
    );
}

/* ── Lightbox ──────────────────────────────────────────── */
function Lightbox({ images, index, onClose }) {
    const [cur, setCur] = useState(index);
    if (!images.length) return null;
    const prev = () => setCur(i => (i - 1 + images.length) % images.length);
    const next = () => setCur(i => (i + 1) % images.length);
    return (
        <div className="fixed inset-0 z-[60] flex items-center h-30 w-30 justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <ChevronLeft size={22} />
            </button>
            <img
                src={images[cur]}
                alt={`Photo ${cur + 1}`}
                className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
                onClick={e => e.stopPropagation()}
            />
            <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <ChevronRight size={22} />
            </button>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X size={18} />
            </button>
            <span className="absolute bottom-4 text-white/60 text-sm">{cur + 1} / {images.length}</span>
        </div>
    );
}

/* ── Photos Tab ────────────────────────────────────────── */
function PhotosTab({ business }) {
    const photos = Array.isArray(business.business_images_urls) ? business.business_images_urls : [];
    const [lightbox, setLightbox] = useState(null);

    if (!photos.length) return (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B76B8]">
            <ImageIcon size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No photos uploaded yet</p>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((url, i) => (
                    <div
                        key={i}
                        onClick={() => setLightbox(i)}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-[#2A377D] hover:border-[#C9A84C]/50 transition-all"
                    >
                        <img src={url} alt={`Business photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ImageIcon size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-[#6B76B8] mt-3">{photos.length} photo{photos.length !== 1 ? 's' : ''} — click to enlarge</p>
            {lightbox !== null && <Lightbox images={photos} index={lightbox} onClose={() => setLightbox(null)} />}
        </>
    );
}

/* ── Menu Tab ──────────────────────────────────────────── */
function MenuTab({ business }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null); // { images, index }
    useEffect(() => {
        if (!business?.id) return;
        setLoading(true);
        fetchMenuItemsByBusiness(business.id)
            .then(data => setItems(data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [business?.id]);

    if (loading) return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-[#111A50] animate-pulse" />)}
        </div>
    );

    if (!items.length) return (
        <div className="flex flex-col items-center justify-center py-16 text-[#6B76B8]">
            <UtensilsCrossed size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No menu items added yet</p>
        </div>
    );

    return (
        <>
            <div className="space-y-3">
                {items.map(item => {
                    const imgs = Array.isArray(item.image_url) ? item.image_url : [];
                    return (
                        <div key={item.id} className="bg-[#111A50] rounded-xl p-4 border border-[#2A377D] hover:border-[#C9A84C]/20 transition-colors">
                            {/* Images strip */}
                            {imgs.length > 0 ? (
                                <div className="flex gap-2 mb-3">
                                    {imgs.map((url, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setLightbox({ images: imgs, index: i })}
                                            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-[#2A377D] hover:border-[#C9A84C]/60 cursor-pointer transition-all group"
                                        >
                                            <img src={url} alt={`${item.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-[#182365] border border-[#2A377D] flex items-center justify-center text-[#6B76B8] mb-3">
                                    <UtensilsCrossed size={20} />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    {item.description && <p className="text-xs text-[#9BA4E8] mt-0.5">{item.description}</p>}
                                </div>
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <span className="text-sm font-bold text-[#C9A84C]">BDS$ {parseFloat(item.price ?? 0).toFixed(2)}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.is_available !== false ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                        {item.is_available !== false ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-[#6B76B8] mt-3">{items.length} item{items.length !== 1 ? 's' : ''} on the menu</p>
            {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
        </>
    );
}

/* ── Details Tab ───────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function DetailsTab({ business }) {
    const [hours, setHours] = useState(null);
    const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    useEffect(() => {
        if (!business?.id) return;
        fetchOpeningHours(business.id)
            .then(data => setHours(data))
            .catch(() => setHours(null));
    }, [business?.id]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Section icon={Map} title="Location">
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-[#9BA4E8] mt-1 flex-shrink-0" />
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold block">Address</label>
                            <p className="text-sm text-white font-medium mt-0.5">{business.address || <span className="text-[#6B76B8] italic">Not provided</span>}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Field label="Parish" value={business.parish} />
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold block">Coordinates</label>
                            <p className="text-xs text-[#9BA4E8] font-mono mt-0.5 bg-[#182365] px-2 py-1 rounded border border-[#2A377D]/50">
                                {business.latitude ? `${business.latitude.toFixed(4)}, ${business.longitude?.toFixed(4)}` : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section icon={Info} title="Contact Info">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#9BA4E8] flex-shrink-0" />
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold block">Email</label>
                            <p className="text-sm text-white font-medium">{business.email || <span className="text-[#6B76B8] italic">Not provided</span>}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Phone size={13} className="text-[#9BA4E8] flex-shrink-0" />
                            <Field label="Phone" value={business.phone} />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <Globe size={13} className="text-[#9BA4E8] flex-shrink-0" />
                            <Field label="Website" value={business.website} />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Opening Hours — full width */}
            <div className="md:col-span-2">
                <Section icon={Clock} title="Opening Hours">
                    {hours === null ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-6 rounded bg-[#182365] animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                            {DAYS.map(day => {
                                const h = hours[day];
                                const closed = h?.closed;
                                return (
                                    <div key={day} className="flex items-center justify-between py-1 border-b border-[#2A377D]/40 last:border-0">
                                        <span className="text-xs font-semibold text-[#9BA4E8] w-24">{day}</span>
                                        {closed ? (
                                            <span className="text-xs font-bold text-red-400">Closed</span>
                                        ) : h ? (
                                            <span className="text-xs font-medium text-white">
                                                {h.open} <span className="text-[#6B76B8]">–</span> {h.close}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[#6B76B8] italic">Not set</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex gap-4 mt-4 pt-3 border-t border-[#2A377D]/40">
                        <Field label="Cuisine Type" value={business.cuisine_type} />
                        <Field label="Price Level" value={business.price_level} />
                    </div>
                </Section>
            </div>

            <Section icon={Calendar} title="System Info">
                <div className="space-y-3">

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold">Created</label>
                            <p className="text-xs text-white font-medium mt-0.5">{formatDate(business.created_at)}</p>
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase tracking-wider text-[#6B76B8] font-bold">Updated</label>
                            <p className="text-xs text-white font-medium mt-0.5">{formatDate(business.updated_at)}</p>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}

/* ── Main Modal ────────────────────────────────────────── */
export default function BusinessDetailsModal({ isOpen, onClose, business, onApprove, onReject }) {
    const [tab, setTab] = useState('details');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state when business changes
    useEffect(() => {
        setTab('details');
        setShowRejectForm(false);
        setRejectReason('');
    }, [business?.id]);

    if (!isOpen || !business) return null;

    const status = business.status?.toLowerCase() || 'pending';
    const isPending = status === 'pending';
    const photos = Array.isArray(business.business_images_urls) ? business.business_images_urls : [];

    const handleApprove = async () => {
        setLoading(true);
        await onApprove(business.id);
        setLoading(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setLoading(true);
        await onReject(business.id, rejectReason.trim());
        setLoading(false);
        setShowRejectForm(false);
        setRejectReason('');
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center  p-3 sm:p-6">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-[#0b0e27]/85 backdrop-blur-sm" onClick={onClose} />

                {/* Modal */}

                <div className="relative mt-10 mb-5 w-full max-w-3xl max-h-[72vh]  overflow-hidden flex flex-col bg-[#182365] border border-[#2A377D] rounded-2xl shadow-2xl     font-sans">

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A377D] bg-[#1C2A75] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
                                <Building2 size={17} className="text-[#C9A84C]" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white leading-tight">{business.name}</h2>
                                <p className="text-xs text-[#9BA4E8]">{business.category || 'Uncategorized'} · {business.parish || 'No parish'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusStyle[status] || statusStyle.pending}`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${dotStyle[status] || dotStyle.pending}`} />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg text-[#9BA4E8] hover:text-white hover:bg-[#2A377D]/50 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── Hero / Quick Stats ── */}
                    <div className="px-6 py-4 bg-[#141D5C] border-b border-[#2A377D] flex-shrink-0">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Cover from first photo */}
                            {photos[0] ? (
                                <img src={photos[0]} alt={business.name} className="w-16 h-16 rounded-xl object-cover border border-[#2A377D] flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-[#111A50] border border-[#2A377D] flex items-center justify-center text-[#6B76B8] flex-shrink-0">
                                    <ImageIcon size={22} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-[#9BA4E8] line-clamp-2 leading-relaxed">
                                    {business.description || <span className="italic">No description provided.</span>}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <span className="flex items-center gap-1.5 text-xs text-[#9BA4E8]">
                                        <Star size={12} className="text-[#C9A84C] fill-[#C9A84C]" />
                                        <strong className="text-white">{business.rating || '0.0'}</strong> ({business.review_count || 0} reviews)
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-[#9BA4E8]">
                                        <ImageIcon size={12} />
                                        <strong className="text-white">{photos.length}</strong> photo{photos.length !== 1 ? 's' : ''}
                                    </span>
                                    {business.price_level && (
                                        <span className="flex items-center gap-1.5 text-xs text-[#9BA4E8]">
                                            <DollarSign size={12} />
                                            <strong className="text-white">{business.price_level}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex border-b border-[#2A377D] bg-[#182365] flex-shrink-0">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.id ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-transparent text-[#9BA4E8] hover:text-white'}`}
                            >
                                <t.icon size={15} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="overflow-y-auto flex-1 p-6  min-h-0 custom-scrollbar">
                        {tab === 'details' && <DetailsTab business={business} />}
                        {tab === 'photos' && <PhotosTab business={business} />}
                        {tab === 'menu' && <MenuTab business={business} />}
                    </div>

                    {/* ── Rejection form ── */}
                    {showRejectForm && (
                        <div className="px-6 py-4 border-t border-red-500/20 bg-red-950/20 flex-shrink-0">
                            <p className="text-xs font-bold text-red-300 mb-2 flex items-center gap-1.5">
                                <XCircle size={13} /> Reason for Rejection (will be emailed to vendor)
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                placeholder="e.g. Your business was not approved because the provided information is incomplete. Please update your profile and resubmit."
                                rows={3}
                                className="w-full bg-[#111A50] border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#6B76B8] focus:outline-none focus:border-red-400 resize-none"
                            />
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="px-6 py-4 border-t border-[#2A377D] bg-[#1C2A75] flex justify-end gap-3 flex-shrink-0">
                        {showRejectForm ? (
                            <>
                                <button onClick={() => { setShowRejectForm(false); setRejectReason(''); }} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#2A377D] hover:bg-[#344491] transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={loading || !rejectReason.trim()}
                                    className="px-5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
                                >
                                    <XCircle size={15} /> Confirm Rejection
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-[#2A377D] hover:bg-[#344491] transition-colors">
                                    Close
                                </button>
                                {isPending && (
                                    <>
                                        <button
                                            onClick={() => setShowRejectForm(true)}
                                            className="px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-red-900/40 hover:bg-red-800/60 border border-red-500/40 text-red-300 transition-all"
                                        >
                                            <XCircle size={15} /> Reject
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            disabled={loading}
                                            className="px-5 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10B981]/20 transition-all disabled:opacity-60"
                                        >
                                            <Check size={15} /> Approve Business
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #111A50; border-radius: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #2A377D; border-radius: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C9A84C; }
        `
            }} />
        </>
    );
}