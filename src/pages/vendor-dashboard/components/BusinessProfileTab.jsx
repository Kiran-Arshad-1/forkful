import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { BusinessProfileSkeleton } from 'components/ui/Shimmer';
import BusinessDropdown from 'components/ui/BusinessDropdown';

// Barbados parishes
const PARISHES = [
  { value: 'christ_church', label: 'Christ Church' },
  { value: 'st_andrew', label: 'St. Andrew' },
  { value: 'st_george', label: 'St. George' },
  { value: 'st_james', label: 'St. James' },
  { value: 'st_john', label: 'St. John' },
  { value: 'st_joseph', label: 'St. Joseph' },
  { value: 'st_lucy', label: 'St. Lucy' },
  { value: 'st_michael', label: 'St. Michael' },
  { value: 'st_peter', label: 'St. Peter' },
  { value: 'st_philip', label: 'St. Philip' },
  { value: 'st_thomas', label: 'St. Thomas' },
];

const CUISINE_TYPES = [
  'Bajan', 'Caribbean', 'Seafood', 'American', 'Chinese', 'Indian', 'Italian', 'Mexican',
  'Japanese', 'Thai', 'Mediterranean', 'Fast Food',
  'Vegetarian', 'Vegan', 'Bakery', 'Desserts', 'Other'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultHours = DAYS?.reduce((acc, day) => {
  acc[day] = { open: '09:00', close: '21:00', closed: false };
  return acc;
}, {});

// Barbados center coordinates
const BARBADOS_CENTER = { lat: 13.1939, lng: -59.5432 };
const BARBADOS_ZOOM = 11;

const BusinessProfileTab = ({ isOnboarding, onNext }) => {
  const { user } = useAuthStore();

  const {
    profile,
    openingHours: savedHours,
    fetchProfile,
    saveBusinessProfile,
    fetchVendorBusiness,
    vendor_business,
    draftBusinessProfile,
    setDraftBusinessProfile,
    isCreatingBusiness,
    setIsCreatingBusiness,
    isEditingBusiness,
    setIsEditingBusiness,
    selectedBusinessId,
    startCreateBusiness,
    cancelCreateBusiness,
  } = useVendorProfileStore();


  const [form, setForm] = useState({
    businessName: '',
    description: '',
    cuisineType: 'Bajan',
    parish: 'st_michael',
    address: '',
    lat: '',
    lng: '',
    phone: '',
    email: '',
    website: '',
  });
  const [hours, setHours] = useState(defaultHours);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [hasBusiness, setHasBusiness] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  // Fetch profile from Supabase via the store
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) { setDataLoading(false); return; }
      await fetchProfile(user.id);
      setDataLoading(false);
    }
    loadData()
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        await fetchVendorBusiness(user.id)
        setDataLoading(false);
      }
    }
    loadData()
  }, [user?.id]);

  useEffect(() => {
    if (Array.isArray(vendor_business) && vendor_business.length > 0) {
      setHasBusiness(true);
    } else {
      setHasBusiness(false);
    }
  }, [vendor_business]);

  ('got all business from auth ', vendor_business);

  // Hydrate local form state when the store profile loads or when editing an existing business
  useEffect(() => {
    if (isOnboarding) {
      if (draftBusinessProfile) {
        setForm(draftBusinessProfile.form);
        setHours(draftBusinessProfile.hours);
      } else {
        const cleanForm = {
          businessName: '',
          description: '',
          cuisineType: 'Bajan',
          parish: 'st_michael',
          address: '',
          lat: '',
          lng: '',
          phone: '',
          email: profile?.email ?? user?.email ?? '',
          website: '',
        };
        setForm(cleanForm);
        setHours(defaultHours);
        setDraftBusinessProfile({ form: cleanForm, hours: defaultHours });
      }
      setDataLoading(false);
      return;
    }

    if (isEditingBusiness && Array.isArray(vendor_business)) {
      const selectedBiz = vendor_business.find((b) => b.id === selectedBusinessId);
      if (selectedBiz) {
        setForm({
          businessName: selectedBiz.name ?? '',
          description: selectedBiz.description ?? '',
          cuisineType: selectedBiz.category ?? 'Bajan',
          parish: selectedBiz.parish ?? 'st_michael',
          address: selectedBiz.address ?? '',
          lat: selectedBiz.latitude != null ? String(selectedBiz.latitude) : '',
          lng: selectedBiz.longitude != null ? String(selectedBiz.longitude) : '',
          phone: selectedBiz.phone ?? '',
          email: selectedBiz.email ?? '',
          website: selectedBiz.website ?? '',
        });
        setHours(savedHours || defaultHours);
        setDataLoading(false);
        return;
      }
    }

    if (!profile) return;
    setForm({
      businessName: profile?.business_name ?? '',
      description: profile?.description ?? '',
      cuisineType: profile?.cuisine_type ?? 'Bajan',
      parish: profile?.parish ?? 'st_michael',
      address: profile?.address ?? '',
      lat: profile?.latitude != null ? String(profile?.latitude) : '',
      lng: profile?.longitude != null ? String(profile?.longitude) : '',
      phone: profile?.phone ?? '',
      email: profile?.email ?? user?.email ?? '',
      website: '',
    });
    setHours(savedHours);
    setDataLoading(false);
  }, [profile?.vendor_id, draftBusinessProfile, isOnboarding, isEditingBusiness, selectedBusinessId, vendor_business, savedHours]);

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (leafletLoadedRef?.current) return;

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head?.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      leafletLoadedRef.current = true;

    };
    document.head?.appendChild(script);

    return () => { };
  }, []);

  useEffect(() => {
    if (!leafletLoadedRef.current) return;
    if (!mapRef.current) return;
    if (leafletMapRef.current) return;

    initMap();
  }, [mapRef.current, isCreatingBusiness, isEditingBusiness]);

  useEffect(() => {
    if (!isCreatingBusiness && !isEditingBusiness && leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    }
  }, [isCreatingBusiness, isEditingBusiness]);

  const initMap = useCallback(() => {
    if (!mapRef?.current || leafletMapRef?.current) return;
    const L = window.L;
    if (!L) return;

    const initialLat = parseFloat(form?.lat) || BARBADOS_CENTER?.lat;
    const initialLng = parseFloat(form?.lng) || BARBADOS_CENTER?.lng;
    const hasCoords = form?.lat && form?.lng;

    const map = L?.map(mapRef?.current, {
      center: [initialLat, initialLng],
      zoom: hasCoords ? 15 : BARBADOS_ZOOM,
      zoomControl: true,
    });

    L?.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    })?.addTo(map);

    // Custom gold pin icon
    const pinIcon = L?.divIcon({
      html: `<div style="width:28px;height:36px;position:relative;">
        <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#FBC33B"/>
          <circle cx="14" cy="14" r="6" fill="#061538"/>
        </svg>
      </div>`,
      className: '',
      iconSize: [28, 36],
      iconAnchor: [14, 36],
    });

    if (hasCoords) {
      const marker = L?.marker([initialLat, initialLng], { draggable: true, icon: pinIcon })?.addTo(map);
      markerRef.current = marker;
      marker?.on('dragend', (e) => {
        const pos = e?.target?.getLatLng();
        updateCoords(pos?.lat, pos?.lng);
      });
    }

    map?.on('click', (e) => {
      const { lat, lng } = e?.latlng;
      placeOrMoveMarker(lat, lng, map, pinIcon);
      updateCoords(lat, lng);
    });

    leafletMapRef.current = map;
  }, []);

  // Re-init map after data loads
  useEffect(() => {
    if (!dataLoading && leafletLoadedRef?.current && !leafletMapRef?.current) {
      initMap();
    }
    if (!dataLoading && leafletLoadedRef?.current && leafletMapRef?.current) {
      // Update marker if coords loaded
      const lat = parseFloat(form?.lat);
      const lng = parseFloat(form?.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const L = window.L;
        if (L && leafletMapRef?.current) {
          const pinIcon = L?.divIcon({
            html: `<div style="width:28px;height:36px;position:relative;">
              <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#FBC33B"/>
                <circle cx="14" cy="14" r="6" fill="#061538"/>
              </svg>
            </div>`,
            className: '',
            iconSize: [28, 36],
            iconAnchor: [14, 36],
          });
          placeOrMoveMarker(lat, lng, leafletMapRef?.current, pinIcon);
          leafletMapRef?.current?.setView([lat, lng], 15);
        }
      }
    }
  }, [dataLoading]);

  const placeOrMoveMarker = (lat, lng, map, icon) => {
    const L = window.L;
    if (!L) return;
    if (markerRef?.current) {
      markerRef?.current?.setLatLng([lat, lng]);
    } else {
      const marker = L?.marker([lat, lng], { draggable: true, icon })?.addTo(map);
      markerRef.current = marker;
      marker?.on('dragend', (e) => {
        const pos = e?.target?.getLatLng();
        updateCoords(pos?.lat, pos?.lng);
      });
    }
  };

  const updateCoords = (lat, lng) => {
    const latStr = lat?.toFixed(6);
    const lngStr = lng?.toFixed(6);
    setForm(prev => ({ ...prev, lat: latStr, lng: lngStr }));
    setErrors(prev => ({ ...prev, lat: '', lng: '' }));
  };



  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser. Please place the pin manually.');
      return;
    }
    setGeoLoading(true);
    setGeoMessage('');
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position?.coords;
        setGeoLoading(false);
        updateCoords(latitude, longitude);
        if (leafletMapRef?.current) {
          const L = window.L;
          const pinIcon = L?.divIcon({
            html: `<div style="width:28px;height:36px;position:relative;">
              <svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#C9A84C"/>
                <circle cx="14" cy="14" r="6" fill="#0F1A5C"/>
              </svg>
            </div>`,
            className: '',
            iconSize: [28, 36],
            iconAnchor: [14, 36],
          });
          placeOrMoveMarker(latitude, longitude, leafletMapRef?.current, pinIcon);
          leafletMapRef?.current?.setView([latitude, longitude], 16);
        }
        setGeoMessage('📍 Location found! Drag the pin to fine-tune your exact spot.');
      },
      (error) => {
        setGeoLoading(false);
        if (error?.code === error?.PERMISSION_DENIED) {
          setGeoMessage('Location access was denied. No worries — just tap the map to place your pin manually.');
        } else if (error?.code === error?.POSITION_UNAVAILABLE) {
          setGeoMessage('Your location couldn\'t be determined right now. Please place the pin on the map instead.');
        } else {
          setGeoMessage('Location request timed out. Please place the pin on the map manually.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    if (isOnboarding) {
      setDraftBusinessProfile({ form: updatedForm, hours });
    }
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleHoursChange = (day, field, value) => {
    const updatedHours = { ...hours, [day]: { ...hours?.[day], [field]: value } };
    setHours(updatedHours);
    if (isOnboarding) {
      setDraftBusinessProfile({ form, hours: updatedHours });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form?.businessName?.trim()) errs.businessName = 'Business name is required';
    if (!form?.description?.trim()) errs.description = 'Description is required';
    if (!form?.address?.trim()) errs.address = 'Address is required';
    if (!form?.phone?.trim()) errs.phone = 'Phone number is required';
    if (!form?.lat?.trim()) errs.lat = 'Latitude is required';
    if (!form?.lng?.trim()) errs.lng = 'Longitude is required';
    if (form?.lat && isNaN(parseFloat(form?.lat))) errs.lat = 'Invalid latitude';
    if (form?.lng && isNaN(parseFloat(form?.lng))) errs.lng = 'Invalid longitude';
    return errs;
  };

  const handleNextStep = () => {
    const errs = validate();
    if (Object.keys(errs)?.length > 0) { setErrors(errs); return; }
    setDraftBusinessProfile({ form, hours });
    if (onNext) onNext();
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs)?.length > 0) { setErrors(errs); return; }
    setSaving(true);
    setSaveError('');
    try {
      ('sending the form to save', form, hours);
      await saveBusinessProfile(form, hours);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (isEditingBusiness) {
          setIsEditingBusiness(false);
        }
      }, 1200);
    } catch (err) {
      setSaveError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (dataLoading) return <BusinessProfileSkeleton />;

  return (
    <>
      {!isCreatingBusiness && !isEditingBusiness ? (
        hasBusiness ? (
          <BusinessDropdown />
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl"
            style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
              style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
            >
              <Icon name="Store" size={40} color="#FBC33B" />
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold mb-2 text-white">
              You don't have a business yet
            </h2>
            <p className="text-sm mb-8 max-w-md" style={{ color: '#DCE6FF' }}>
              Create your business profile to get listed on ForkFul and start reaching new customers today.
            </p>
            <button
              onClick={() => startCreateBusiness()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer"
              style={{ background: '#FBC33B', color: '#061538' }}
            >
              <Icon name="Plus" size={18} color="#061538" strokeWidth={2.5} />
              Add New Business
            </button>
          </div>
        )
      ) : (

        <div className="space-y-6 lg:space-y-8">
          {/* Edit Header Banner */}
          {isEditingBusiness && (
            <div
              className="flex items-center justify-between p-4 md:p-5 rounded-2xl"
              style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
                >
                  <Icon name="Edit" size={20} color="#FBC33B" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-white">
                    Edit Business Profile
                  </h2>
                  <p className="text-xs" style={{ color: '#9FB5F5' }}>
                    Updating information for <span className="font-semibold text-white">{form?.businessName || 'Business'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingBusiness(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
                style={{ color: '#9FB5F5', border: '1px solid #254477' }}
              >
                <Icon name="X" size={14} />
                Cancel
              </button>
            </div>
          )}

          {/* Basic Info */}
          <div className="rounded-2xl p-5 md:p-6" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-white">
                  Business Name <span style={{ color: '#FF4D5E' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form?.businessName}
                  onChange={e => handleChange('businessName', e?.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all text-white placeholder:text-[#647DBA]"
                  style={{
                    background: '#081C49',
                    border: errors?.businessName ? '1px solid #FF4D5E' : '1px solid #1D4ED8',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors?.businessName ? '#FF4D5E' : '#1D4ED8'; }}
                />
                {errors?.businessName && <p className="text-xs mt-1 font-medium" style={{ color: '#FF4D5E' }}>{errors?.businessName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-white">
                  Description <span style={{ color: '#FF4D5E' }}>*</span>
                </label>
                <textarea
                  value={form?.description}
                  onChange={e => handleChange('description', e?.target?.value)}
                  placeholder="Describe your business, specialties, and what makes you unique..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none outline-none transition-all text-white placeholder:text-[#647DBA]"
                  style={{
                    background: '#081C49',
                    border: errors?.description ? '1px solid #FF4D5E' : '1px solid #1D4ED8',
                    color: '#FFFFFF',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors?.description ? '#FF4D5E' : '#1D4ED8'; }}
                />
                {errors?.description && <p className="text-xs mt-1 font-medium" style={{ color: '#FF4D5E' }}>{errors?.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Cuisine / Food Type</label>
                <select
                  value={form?.cuisineType}
                  onChange={e => handleChange('cuisineType', e?.target?.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all text-white cursor-pointer"
                  style={{ background: '#081C49', border: '1px solid #1D4ED8', color: '#FFFFFF' }}
                >
                  {CUISINE_TYPES?.map(c => <option key={c} value={c} style={{ background: '#081C49', color: '#FFFFFF' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Parish</label>
                <select
                  value={form?.parish}
                  onChange={e => handleChange('parish', e?.target?.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl outline-none transition-all text-white cursor-pointer"
                  style={{ background: '#081C49', border: '1px solid #1D4ED8', color: '#FFFFFF' }}
                >
                  {PARISHES?.map(p => <option key={p?.value} value={p?.value} style={{ background: '#081C49', color: '#FFFFFF' }}>{p?.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Street Address"
                  type="text"
                  value={form?.address}
                  onChange={e => handleChange('address', e?.target?.value)}
                  placeholder="e.g. Broad Street, Bridgetown"
                  error={errors?.address}
                  required
                />
                <p className="text-xs mt-1.5" style={{ color: '#9FB5F5' }}>
                  Your address will be shown on your listing, but the map pin controls your exact location.
                </p>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="rounded-2xl p-5 md:p-6" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <h3 className="font-heading text-lg font-semibold mb-1 text-white">Map Location</h3>
            <p className="text-xs mb-4" style={{ color: '#9FB5F5' }}>
              Place the pin at your exact business location for the best results.
            </p>

            {/* Use Current Location button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer"
                style={{ background: '#3C351E', border: '1px solid #FBC33B', color: '#FBC33B' }}
              >
                {geoLoading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Locating…
                  </>
                ) : (
                  <>
                    <Icon name="LocateFixed" size={16} color="#FBC33B" />
                    Use Current Location
                  </>
                )}
              </button>
              {geoMessage && (
                <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: '#9FB5F5' }}>
                  <Icon name="Info" size={13} color="#9FB5F5" className="flex-shrink-0 mt-0.5" />
                  {geoMessage}
                </p>
              )}
            </div>

            {/* Interactive Map */}
            <div
              ref={mapRef}
              className="w-full rounded-xl overflow-hidden mb-4"
              style={{ height: '280px', border: '1px solid #1D4ED8', cursor: 'crosshair' }}
            />
            <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
              <Icon name="MousePointerClick" size={13} color="#9FB5F5" />
              Tap or click the map to place your pin. Drag the pin to fine-tune your exact location.
            </p>

            {/* Lat / Lng fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Latitude"
                  type="number"
                  required
                  value={form?.lat}
                  onChange={e => {
                    handleChange('lat', e?.target?.value);
                    const lat = parseFloat(e?.target?.value);
                    const lng = parseFloat(form?.lng);
                    if (!isNaN(lat) && !isNaN(lng) && leafletMapRef?.current) {
                      const L = window.L;
                      const pinIcon = L?.divIcon({
                        html: `<div style="width:28px;height:36px;"><svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#FBC33B"/><circle cx="14" cy="14" r="6" fill="#061538"/></svg></div>`,
                        className: '', iconSize: [28, 36], iconAnchor: [14, 36],
                      });
                      placeOrMoveMarker(lat, lng, leafletMapRef?.current, pinIcon);
                      leafletMapRef?.current?.setView([lat, lng], leafletMapRef?.current?.getZoom());
                    }
                  }}
                  placeholder="Auto-filled from map pin"
                  error={errors?.lat}
                />
              </div>
              <div>
                <Input
                  label="Longitude"
                  type="number"
                  required
                  value={form?.lng}
                  onChange={e => {
                    handleChange('lng', e?.target?.value);
                    const lat = parseFloat(form?.lat);
                    const lng = parseFloat(e?.target?.value);
                    if (!isNaN(lat) && !isNaN(lng) && leafletMapRef?.current) {
                      const L = window.L;
                      const pinIcon = L?.divIcon({
                        html: `<div style="width:28px;height:36px;"><svg viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#FBC33B"/><circle cx="14" cy="14" r="6" fill="#061538"/></svg></div>`,
                        className: '', iconSize: [28, 36], iconAnchor: [14, 36],
                      });
                      placeOrMoveMarker(lat, lng, leafletMapRef?.current, pinIcon);
                      leafletMapRef?.current?.setView([lat, lng], leafletMapRef?.current?.getZoom());
                    }
                  }}
                  placeholder="Auto-filled from map pin"
                  error={errors?.lng}
                />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#9FB5F5' }}>
              Coordinates are set automatically by the map pin. You can also type them directly if needed.
            </p>
          </div>

          {/* Contact */}
          <div className="rounded-2xl p-5 md:p-6" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Phone Number" type="tel" value={form?.phone} onChange={e => handleChange('phone', e?.target?.value)} placeholder="+1 (246) 555-0000" error={errors?.phone} required />
              <Input label="Business Email" type="email" value={form?.email} onChange={e => handleChange('email', e?.target?.value)} placeholder="hello@yourbusiness.com" />
              <Input label="Website" type="url" value={form?.website} onChange={e => handleChange('website', e?.target?.value)} placeholder="https://yourbusiness.com" />
            </div>
          </div>

          {/* Opening Hours */}
          <div className="rounded-2xl p-5 md:p-6" style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}>
            <h3 className="font-heading text-lg font-semibold mb-4 text-white">Opening Hours</h3>
            <div className="space-y-3">
              {DAYS?.map(day => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2" style={{ borderBottom: '1px solid #254477' }}>
                  <div className="w-28 flex-shrink-0">
                    <span className="text-sm font-medium text-white">{day}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours?.[day]?.closed}
                      onChange={e => handleHoursChange(day, 'closed', e?.target?.checked)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#FBC33B' }}
                    />
                    <span className="text-xs" style={{ color: '#9FB5F5' }}>Closed</span>
                  </label>
                  {!hours?.[day]?.closed && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={hours?.[day]?.open}
                        onChange={e => handleHoursChange(day, 'open', e?.target?.value)}
                        className="px-2.5 py-1.5 text-sm rounded-lg outline-none text-white"
                        style={{ background: '#081C49', border: '1px solid #1D4ED8' }}
                      />
                      <span className="text-xs" style={{ color: '#9FB5F5' }}>to</span>
                      <input
                        type="time"
                        value={hours?.[day]?.close}
                        onChange={e => handleHoursChange(day, 'close', e?.target?.value)}
                        className="px-2.5 py-1.5 text-sm rounded-lg outline-none text-white"
                        style={{ background: '#081C49', border: '1px solid #1D4ED8' }}
                      />
                    </div>
                  )}
                  {hours?.[day]?.closed && (
                    <span className="text-xs italic" style={{ color: '#9FB5F5' }}>Closed all day</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-4">
            {isOnboarding ? (
              <>
                {hasBusiness && (
                  <button
                    onClick={() => cancelCreateBusiness()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 cursor-pointer"
                    style={{ border: '1px solid #254477', color: '#9FB5F5' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 shadow-lg cursor-pointer"
                  style={{ background: '#FBC33B', color: '#061538' }}
                >
                  Next: Configure Menu
                  <Icon name="ArrowRight" size={16} color="#061538" />
                </button>
              </>
            ) : (
              <>
                {isEditingBusiness && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBusiness(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 cursor-pointer"
                    style={{ border: '1px solid #254477', color: '#9FB5F5' }}
                  >
                    Cancel
                  </button>
                )}
                {saveError && (
                  <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#FF4D5E' }}>
                    <Icon name="AlertCircle" size={16} color="#FF4D5E" />
                    {saveError}
                  </span>
                )}
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#10D6A0' }}>
                    <Icon name="CheckCircle" size={16} color="#10D6A0" />
                    Changes saved!
                  </span>
                )}
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 disabled:opacity-50 shadow-md cursor-pointer"
                  style={{ background: '#FBC33B', color: '#061538' }}
                >
                  <Icon name="Save" size={16} color="#061538" />
                  {saving ? 'Saving...' : (isEditingBusiness ? 'Save Changes' : 'Save Profile')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessProfileTab;
