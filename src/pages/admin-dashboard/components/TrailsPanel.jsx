import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import TrailTable from './TrailTable';
import TrailEditorModal from './TrailEditorModal';
import TrailDetailsModal from './TrailDetailsModal';
import {
  DURATION_OPTIONS,
  FILTER_DURATION_OPTIONS,
  PARISH_OPTIONS,
  STATUS_OPTIONS,
  emptyTrailForm,
  formatParish,
  normalizeDuration,
  normalizeStops,
} from './trailConfig';

const TrailsPanel = ({
  trails = [],
  businesses = [],
  loading = false,
  error = '',
  onRetry,
  onFetchTrailDetails,
  onFetchTrailReviews,
  onSaveTrail,
  onSetTrailStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState(emptyTrailForm);
  const [nextBusinessId, setNextBusinessId] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionTrailId, setActionTrailId] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [detailTrail, setDetailTrail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailInitialTab, setDetailInitialTab] = useState('details');
  const detailRequestRef = useRef(0);

  useEffect(() => {
    if (!form.coverFile) {
      setCoverPreview(form.coverImageUrl || '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(form.coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.coverFile, form.coverImageUrl]);

  const activeBusinesses = useMemo(() => businesses
    .filter((business) => business.status === 'active')
    .sort((a, b) => (a.name || '').localeCompare(b.name || '')), [businesses]);
  const businessById = useMemo(() => new Map(businesses.map((business) => [business.id, business])), [businesses]);
  const selectedBusinessIds = useMemo(() => form.stops.map((stop) => stop.businessId), [form.stops]);
  const stopOptions = useMemo(() => activeBusinesses
    .filter((business) => !selectedBusinessIds.includes(business.id))
    .map((business) => ({
      value: business.id,
      label: `${business.name} — ${business.parish ? formatParish(business.parish) : business.category || 'No location'}`,
    })), [activeBusinesses, selectedBusinessIds]);

  const filteredTrails = useMemo(() => {
    const term = search.trim().toLowerCase();
    return trails.filter((trail) => {
      const searchable = [trail.name, trail.description, trail.parish, formatParish(trail.parish)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (!term || searchable.includes(term))
        && (statusFilter === 'all' || (statusFilter === 'published' ? trail.is_active : !trail.is_active))
        && (durationFilter === 'all' || normalizeDuration(trail.difficulty) === durationFilter);
    });
  }, [trails, search, statusFilter, durationFilter]);

  const stats = useMemo(() => ({
    total: trails.length,
    published: trails.filter((trail) => trail.is_active).length,
    drafts: trails.filter((trail) => !trail.is_active).length,
    stops: trails.reduce((sum, trail) => sum + (trail.stops?.length || 0), 0),
  }), [trails]);

  const resetEditor = () => {
    setShowEditor(false);
    setShowPreview(false);
    setForm(emptyTrailForm());
    setNextBusinessId('');
    setFormError('');
  };

  const openCreate = () => {
    resetEditor();
    setShowEditor(true);
  };

  const openEdit = (trail, duplicate = false) => {
    setForm({
      id: duplicate ? null : trail.id,
      name: duplicate ? `${trail.name} (Copy)` : trail.name || '',
      description: trail.description || '',
      parish: trail.parish || '',
      durationCategory: normalizeDuration(trail.difficulty),
      coverImageUrl: trail.hero_image_url || '',
      coverFile: null,
      status: duplicate ? 'draft' : trail.is_active ? 'published' : 'draft',
      stops: normalizeStops(trail),
    });
    setNextBusinessId('');
    setFormError('');
    setShowPreview(false);
    setShowEditor(true);
  };

  const loadTrailDetails = async (trail, initialTab = 'details') => {
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    setDetailTrail(trail);
    setDetailInitialTab(initialTab);
    setDetailError('');
    setDetailLoading(true);
    try {
      const completeTrail = await onFetchTrailDetails(trail.id);
      if (detailRequestRef.current === requestId) setDetailTrail(completeTrail);
    } catch (loadError) {
      if (detailRequestRef.current === requestId) {
        setDetailError(loadError.message || 'The complete trail details could not be loaded.');
      }
    } finally {
      if (detailRequestRef.current === requestId) setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    detailRequestRef.current += 1;
    setDetailTrail(null);
    setDetailError('');
    setDetailLoading(false);
  };

  const editFromDetails = (trail) => {
    closeDetails();
    openEdit(trail);
  };

  const closeEditor = () => {
    if (!saving) resetEditor();
  };

  const addStop = () => {
    if (!nextBusinessId || selectedBusinessIds.includes(nextBusinessId)) return;
    setForm((current) => ({ ...current, stops: [...current.stops, { businessId: nextBusinessId }] }));
    setNextBusinessId('');
  };

  const removeStop = (index) => setForm((current) => ({
    ...current,
    stops: current.stops.filter((_, stopIndex) => stopIndex !== index),
  }));

  const moveStop = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= form.stops.length) return;
    setForm((current) => {
      const stops = [...current.stops];
      [stops[index], stops[target]] = [stops[target], stops[index]];
      return { ...current, stops };
    });
  };

  const submitTrail = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Trail name is required.');
    if (!form.description.trim()) return setFormError('Description is required.');
    if (!PARISH_OPTIONS.some((option) => option.value === form.parish)) return setFormError('Choose one of the 11 Barbados parishes.');
    if (!DURATION_OPTIONS.some((option) => option.value === form.durationCategory)) return setFormError('Duration must be Short, Medium, or Long.');
    if (form.status === 'published' && form.stops.length === 0) return setFormError('A trail needs at least one stop before it can be published.');
    if (form.stops.some((stop) => businessById.get(stop.businessId)?.status !== 'active')) return setFormError('All trail stops must be active businesses.');

    setSaving(true);
    try {
      await onSaveTrail({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        parish: form.parish,
        difficulty: form.durationCategory,
        hero_image_url: form.coverImageUrl || null,
        coverFile: form.coverFile,
        status: form.status,
        stops: form.stops.map((stop, index) => ({
          business_id: stop.businessId,
          stop_order: index + 1,
        })),
      });
      resetEditor();
    } catch (saveError) {
      setFormError(saveError.message || 'The trail could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (trail, status) => {
    if (status === 'published' && !trail.stops?.length) {
      openEdit(trail);
      setFormError('A trail needs at least one stop before it can be published.');
      return;
    }
    setActionTrailId(trail.id);
    try {
      await onSetTrailStatus(trail, status);
    } catch (statusError) {
      openEdit(trail);
      setFormError(statusError.message || 'The trail status could not be changed.');
    } finally {
      setActionTrailId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-9 h-9 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(251, 195, 59,0.25)', borderTopColor: '#FBC33B' }} /></div>;

  if (error) return (
    <div className="rounded-xl py-14 px-5 text-center bg-card border border-border">
      <Icon name="AlertCircle" size={30} color="#F87171" />
      <p className="mt-3 text-sm font-semibold text-white">Trails could not be loaded</p>
      <p className="mt-1 text-xs text-[#9BA4E8]">{error}</p>
      <Button className="mt-4" onClick={onRetry}>Try Again</Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total trails', value: stats.total, icon: 'Map' },
          { label: 'Published', value: stats.published, icon: 'CircleCheck' },
          { label: 'Drafts', value: stats.drafts, icon: 'FilePenLine' },
          { label: 'Total stops', value: stats.stops, icon: 'MapPin' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-4 bg-card border border-border">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs text-[#9BA4E8]">{item.label}</p><p className="mt-1 text-2xl font-bold text-white font-data">{item.value}</p></div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#FBC33B]/10"><Icon name={item.icon} size={19} color="#FBC33B" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1"><Input type="search" placeholder="Search by trail name or parish..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="flex gap-2 flex-wrap">
          <div className="w-40"><Select options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} /></div>
          <div className="w-40"><Select options={FILTER_DURATION_OPTIONS} value={durationFilter} onChange={setDurationFilter} /></div>
          <Button variant="ghost" size="sm" iconName="X" onClick={() => { setSearch(''); setStatusFilter('all'); setDurationFilter('all'); }}>Clear</Button>
          <Button size="sm" iconName="Plus" onClick={openCreate}>Create New Trail</Button>
        </div>
      </div>

      <TrailTable
        trails={filteredTrails}
        actionTrailId={actionTrailId}
        onView={loadTrailDetails}
        onEdit={openEdit}
        onDuplicate={(trail) => openEdit(trail, true)}
        onChangeStatus={changeStatus}
      />

      {detailTrail && (
        <TrailDetailsModal
          trail={detailTrail}
          loading={detailLoading}
          error={detailError}
          onClose={closeDetails}
          onRetry={() => loadTrailDetails(detailTrail)}
          onEdit={editFromDetails}
          onFetchReviews={onFetchTrailReviews}
          initialTab={detailInitialTab}
        />
      )}

      {showEditor && (
        <TrailEditorModal
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={closeEditor}
          onSubmit={submitTrail}
          stopOptions={stopOptions}
          nextBusinessId={nextBusinessId}
          setNextBusinessId={setNextBusinessId}
          onAddStop={addStop}
          onMoveStop={moveStop}
          onRemoveStop={removeStop}
          businessById={businessById}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          coverPreview={coverPreview}
          formError={formError}
        />
      )}
    </div>
  );
};

export default TrailsPanel;
