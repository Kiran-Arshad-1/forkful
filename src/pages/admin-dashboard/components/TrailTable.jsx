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
  <div className="overflow-x-auto rounded-xl bg-card border border-border">
    <table className="w-full min-w-[760px] text-left">
      <thead className="bg-[#111A50]/70 text-xs uppercase tracking-wide text-[#9BA4E8]">
        <tr>
          <th className="px-4 py-3">Trail</th>
          <th className="px-4 py-3">Parish</th>
          <th className="px-4 py-3">Duration</th>
          <th className="px-4 py-3">Stops</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#2A377D]">
        {trails.map((trail) => (
          <tr
            key={trail.id}
            onClick={() => onView(trail)}
            className="text-sm text-white cursor-pointer transition-colors hover:bg-[#24369B]/45"
            title="View complete trail details"
          >
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-md overflow-hidden bg-[#111A50] flex items-center justify-center">
                  {trail.hero_image_url
                    ? <img src={trail.hero_image_url} alt="" className="w-full h-full object-cover" />
                    : <Icon name="Map" size={18} color="#6F79BC" />}
                </div>
                <div>
                  <p className="font-semibold">{trail.name}</p>
                  <p className="max-w-xs truncate text-xs text-[#9BA4E8]">{trail.description}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-[#DDE1FA]">{formatParish(trail.parish)}</td>
            <td className="px-4 py-3 text-[#DDE1FA]">{normalizeDuration(trail.difficulty)}</td>
            <td className="px-4 py-3 text-[#DDE1FA]">{trail.stops?.length || 0}</td>
            <td className="px-4 py-3">
              <button
                type="button"
                disabled={actionTrailId === trail.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onChangeStatus(trail, trail.is_active ? 'draft' : 'published');
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border disabled:opacity-50 ${trail.is_active ? 'bg-green-500/15 text-green-300 border-green-500/30' : 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}
                title="Toggle publish status"
              >
                {trail.is_active ? 'Published' : 'Draft'}
              </button>
            </td>
            <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
              <div className="flex justify-end gap-1">
                <Button size="xs" variant="ghost" onClick={() => onView(trail)}>View</Button>
                <Button size="xs" variant="ghost" onClick={() => onEdit(trail)}>Edit</Button>
                <Button size="xs" variant="ghost" onClick={() => onDuplicate(trail)}>Duplicate</Button>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={!trail.is_active || actionTrailId === trail.id}
                  onClick={() => onChangeStatus(trail, 'draft')}
                >
                  Archive
                </Button>
              </div>
            </td>
          </tr>
        ))}
        {trails.length === 0 && (
          <tr>
            <td colSpan="6" className="px-4 py-14 text-center text-sm text-[#9BA4E8]">
              No trails match these filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TrailTable;
