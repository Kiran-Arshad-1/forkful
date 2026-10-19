import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import { formatParish, normalizeDuration } from './trailConfig';

const TrailTable = ({
  trails,
  actionTrailId,
  onView,
  onEdit,
  onDuplicate,
  onChangeStatus,
}) => (
  <div className="overflow-x-auto rounded-2xl bg-[#081C49] border border-[#1D4ED8] shadow-xl shadow-black/10">
    <table className="w-full min-w-[760px] text-left">
      <thead>
        <tr className="bg-[#0D2F83] border-b border-[#254477]">
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5]">Trail</th>
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5]">Parish</th>
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5]">Duration</th>
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5]">Stops</th>
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5]">Status</th>
          <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#9FB5F5] text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {trails.map((trail, index) => (
          <tr key={trail.id} onClick={() => onView(trail)} className={`text-sm text-white cursor-pointer border-b border-[#254477]/70 last:border-b-0 transition-colors hover:bg-[#17439B]/45 ${index % 2 ? 'bg-[#0A2463]/35' : 'bg-[#081C49]'}`} title="View complete trail details">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-11 rounded-xl overflow-hidden bg-[#0D2F83] border border-[#1D4ED8] flex items-center justify-center shadow-sm">
                  {trail.hero_image_url ? <img src={trail.hero_image_url} alt="" className="w-full h-full object-cover" /> : <Icon name="Map" size={18} color="#6F79BC" />}
                </div>
                <div><p className="font-semibold">{trail.name}</p><p className="max-w-xs truncate text-xs text-[#9BA4E8]">{trail.description}</p></div>
              </div>
            </td>
            <td className="px-5 py-4 text-[#DCE6FF]">{formatParish(trail.parish)}</td>
            <td className="px-5 py-4 text-[#DCE6FF]">{normalizeDuration(trail.difficulty)}</td>
            <td className="px-5 py-4 text-[#DCE6FF]">{trail.stops?.length || 0}</td>
            <td className="px-5 py-4">
              <button type="button" disabled={actionTrailId === trail.id} onClick={(event) => { event.stopPropagation(); onChangeStatus(trail, trail.is_active ? 'draft' : 'published'); }} className={`px-2.5 py-1 rounded-full text-xs font-bold border disabled:opacity-50 ${trail.is_active ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`} title="Toggle publish status">
                {trail.is_active ? 'Published' : 'Draft'}
              </button>
            </td>
            <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
              <div className="flex justify-end gap-1">
                <Button size="xs" variant="ghost" onClick={() => onView(trail)}>View</Button>
                <Button size="xs" variant="ghost" onClick={() => onEdit(trail)}>Edit</Button>
                <Button size="xs" variant="ghost" onClick={() => onDuplicate(trail)}>Duplicate</Button>
                <Button size="xs" variant="ghost" disabled={!trail.is_active || actionTrailId === trail.id} onClick={() => onChangeStatus(trail, 'draft')}>Archive</Button>
              </div>
            </td>
          </tr>
        ))}
        {trails.length === 0 && <tr className="bg-[#081C49]"><td colSpan="6" className="px-5 py-14 text-center text-sm text-[#9FB5F5]">No trails match these filters.</td></tr>}
      </tbody>
    </table>
  </div>
);

export default TrailTable;
