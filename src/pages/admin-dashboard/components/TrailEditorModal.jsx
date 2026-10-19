import React from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Button from 'components/ui/Button';
import {
  DURATION_OPTIONS,
  PARISH_OPTIONS,
  STATUS_OPTIONS,
  formatParish,
  getBusinessImage,
} from './trailConfig';

const TrailEditorModal = ({
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
  stopOptions,
  nextBusinessId,
  setNextBusinessId,
  onAddStop,
  onMoveStop,
  onRemoveStop,
  businessById,
  showPreview,
  setShowPreview,
  coverPreview,
  formError,
}) => (
  <div
    className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/65"
    onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
  >
    <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#182365] border border-[#FBC33B]/35 shadow-2xl">
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between bg-[#182365] border-b border-[#2A377D]">
        <div>
          <h2 className="text-lg font-bold text-white">{form.id ? 'Edit Food Trail' : 'Create Food Trail'}</h2>
          <p className="text-xs text-[#9BA4E8]">Trail ratings are calculated automatically and are not entered here.</p>
        </div>
        <Button variant="ghost" size="icon" iconName="X" onClick={onClose} disabled={saving} aria-label="Close" />
      </div>

      <form onSubmit={onSubmit} className="p-5 space-y-5">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[#E4CB88]">1. Basic information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Trail name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Bridgetown Bites" />
            <Select label="Parish" required options={PARISH_OPTIONS} value={form.parish} onChange={(value) => setForm({ ...form, parish: value })} placeholder="Choose a parish" />
            <div className="md:col-span-2">
              <label htmlFor="trail-description" className="mb-2 block text-sm font-medium text-white">Description <span className="text-red-400">*</span></label>
              <textarea id="trail-description" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="w-full rounded-md border border-[rgba(251, 195, 59,0.3)] bg-[#1E3A9E] px-3 py-2 text-sm text-white placeholder:text-[#9BA4E8]/60 focus:outline-none focus:ring-2 focus:ring-[#FBC33B]" placeholder="Describe the trail experience..." />
            </div>
            <Select label="Duration category" required options={DURATION_OPTIONS} value={form.durationCategory} onChange={(value) => setForm({ ...form, durationCategory: value })} />
            <Select label="Status" options={STATUS_OPTIONS.slice(1)} value={form.status} onChange={(value) => setForm({ ...form, status: value })} />
            <div className="md:col-span-2">
              <label htmlFor="trail-cover" className="mb-2 block text-sm font-medium text-white">Cover image</label>
              <input id="trail-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, coverFile: event.target.files?.[0] || null })} className="block w-full rounded-md border border-[rgba(251, 195, 59,0.3)] bg-[#1E3A9E] px-3 py-2 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-[#FBC33B] file:px-3 file:py-1 file:font-semibold file:text-[#0F1A5C]" />
              <p className="mt-1 text-xs text-[#9BA4E8]">JPG, PNG, or WebP. Existing image remains unless a new file is selected.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl p-4 bg-[#111A50]/60 border border-[#2A377D]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#E4CB88]">2. Manage stops</h3>
              <p className="mt-1 text-xs text-[#9BA4E8]">Only active businesses are available. Order is saved from 1 to {form.stops.length || 'N'}.</p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-[#FBC33B]/15 px-2.5 py-1 text-xs font-bold text-[#E4CB88]">
              {form.stops.length} stop{form.stops.length === 1 ? '' : 's'} added
            </span>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Select options={stopOptions} value={nextBusinessId} onChange={setNextBusinessId} placeholder="Search active businesses..." searchable />
            </div>
            <Button type="button" variant="outline" iconName="Plus" onClick={onAddStop} disabled={!nextBusinessId}>Add Stop</Button>
          </div>
          <div className="mt-3 space-y-2">
            {form.stops.length === 0 ? (
              <p className="py-5 text-center text-xs text-[#6F79BC]">No business stops added yet.</p>
            ) : form.stops.map((stop, index) => {
              const business = businessById.get(stop.businessId);
              const image = getBusinessImage(business);
              return (
                <div key={stop.businessId} className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 rounded-lg bg-[#1B2A8B] border border-[#2A377D]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#FBC33B] text-[#0F1A5C]">{index + 1}</span>
                    <div className="w-10 h-10 overflow-hidden rounded-md bg-[#111A50] flex items-center justify-center">
                      {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Icon name="Store" size={17} color="#9BA4E8" />}
                    </div>
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="text-sm font-semibold text-white truncate">{business?.name || 'Business'}</p>
                    <p className="text-xs text-[#9BA4E8]">{formatParish(business?.parish)}</p>
                  </div>
                  <div className="flex items-center">
                    <button type="button" aria-label="Move stop up" onClick={() => onMoveStop(index, -1)} disabled={index === 0} className="p-1.5 disabled:opacity-30"><Icon name="ChevronUp" size={16} color="#9BA4E8" /></button>
                    <button type="button" aria-label="Move stop down" onClick={() => onMoveStop(index, 1)} disabled={index === form.stops.length - 1} className="p-1.5 disabled:opacity-30"><Icon name="ChevronDown" size={16} color="#9BA4E8" /></button>
                    <button type="button" aria-label="Remove stop" onClick={() => onRemoveStop(index)} className="p-1.5"><Icon name="Trash2" size={16} color="#F87171" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showPreview && (
          <section className="rounded-xl overflow-hidden border border-[#FBC33B]/30 bg-[#111A50]">
            <div className="h-48 bg-[#0A123F] flex items-center justify-center">
              {coverPreview ? <img src={coverPreview} alt="Trail cover preview" className="w-full h-full object-cover" /> : <Icon name="Image" size={36} color="#6F79BC" />}
            </div>
            <div className="p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{form.name || 'Untitled trail'}</h3>
                  <p className="text-sm text-[#9BA4E8]">{formatParish(form.parish)} · {form.durationCategory} · {form.stops.length} stops</p>
                </div>
                <span className="h-fit rounded-full bg-[#FBC33B]/15 px-2.5 py-1 text-xs font-bold text-[#E4CB88]">Preview</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#DDE1FA]">{form.description || 'Trail description will appear here.'}</p>
              <ol className="mt-4 space-y-1 text-sm text-white">
                {form.stops.map((stop, index) => <li key={stop.businessId}><span className="mr-2 text-[#FBC33B]">{index + 1}.</span>{businessById.get(stop.businessId)?.name}</li>)}
              </ol>
            </div>
          </section>
        )}

        {formError && <div role="alert" className="p-3 rounded-lg text-sm text-red-300 bg-red-500/10 border border-red-500/25">{formError}</div>}
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" iconName="Eye" onClick={() => setShowPreview((visible) => !visible)}>{showPreview ? 'Hide Preview' : 'Preview'}</Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" loading={saving}>{form.id ? 'Save Changes' : form.status === 'published' ? 'Create & Publish' : 'Save Draft'}</Button>
          </div>
        </div>
      </form>
    </div>
  </div>
);

export default TrailEditorModal;
