import React from 'react';
import Icon from 'components/AppIcon';

const AdminEntityTable = ({
  title,
  singularLabel,
  rows = [],
  columns = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onView,
  renderActions,
  getId = (row) => row.id,
  getTitle,
  getSubtitle,
  getImage,
  avatarIcon = 'Store',
  emptyTitle = 'No records found',
  emptyDescription = 'Try changing your search or filters.',
  highlightedId,
}) => {
  const selectable = Boolean(onToggleSelect && onToggleSelectAll);
  const rowIds = rows.map(getId);
  const allSelected = rows.length > 0 && rowIds.every((id) => selectedIds.includes(id));
  const someSelected = rowIds.some((id) => selectedIds.includes(id));

  const entityCell = (row) => {
    const image = getImage?.(row);
    return (
      <div className="flex items-center gap-3 min-w-[210px]">
        <span className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#0D2F83] border border-[#1D4ED8] shadow-sm">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <Icon name={avatarIcon} size={18} color="#FBC33B" />}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-white truncate max-w-[250px]">{getTitle?.(row) || 'Unnamed'}</span>
          {getSubtitle?.(row) && <span className="block text-xs mt-1 text-[#9FB5F5] truncate max-w-[260px]">{getSubtitle(row)}</span>}
        </span>
      </div>
    );
  };

  const actionsFor = (row) => renderActions?.(row) || (
    <button type="button" onClick={() => onView?.(row)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/45 hover:brightness-110 transition-all"><Icon name="Eye" size={14} />View</button>
  );

  if (!rows.length) {
    return (
      <div className="rounded-2xl py-14 px-6 text-center bg-[#0A2463] border border-[#1D4ED8]">
        <span className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-[#081C49] border border-[#254477]"><Icon name="SearchX" size={23} color="#647DBA" /></span>
        <h3 className="mt-4 text-sm font-bold text-white">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-[#9FB5F5]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl overflow-hidden bg-[#081C49] border border-[#1D4ED8] shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[#0A2463] border-b border-[#254477]">
        <div><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-0.5 text-xs text-[#9FB5F5]">Manage and review {singularLabel.toLowerCase()} records.</p></div>
        <span className="px-3 py-1.5 rounded-full text-xs font-bold text-[#FBC33B] bg-[#3C351E] border border-[#FBC33B]/40">{rows.length} total</span>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0D2F83] border-b border-[#254477]">
              {selectable && <th className="w-14 px-5 py-3.5"><input type="checkbox" checked={allSelected} ref={(element) => { if (element) element.indeterminate = someSelected && !allSelected; }} onChange={(event) => onToggleSelectAll(event.target.checked)} className="w-4 h-4 cursor-pointer accent-[#FBC33B]" aria-label={`Select all ${title.toLowerCase()}`} /></th>}
              <th className="px-5 py-3.5 text-[10px] font-black text-[#9FB5F5] uppercase tracking-[0.14em]">{singularLabel}</th>
              {columns.map((column) => <th key={column.key} className={`px-5 py-3.5 text-[10px] font-black text-[#9FB5F5] uppercase tracking-[0.14em] ${column.headerClassName || ''}`}>{column.label}</th>)}
              <th className="px-5 py-3.5 text-[10px] font-black text-[#9FB5F5] uppercase tracking-[0.14em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const id = getId(row);
              const highlighted = highlightedId !== undefined && highlightedId !== null && id === highlightedId;
              return (
                <tr key={id} id={`${singularLabel.toLowerCase()}-row-${id}`} className={`border-b border-[#254477]/70 last:border-b-0 transition-colors ${highlighted ? 'bg-[#FBC33B]/10 shadow-[inset_4px_0_0_#FBC33B]' : index % 2 ? 'bg-[#0A2463]/35 hover:bg-[#17439B]/45' : 'bg-[#081C49] hover:bg-[#17439B]/45'}`}>
                  {selectable && <td className="px-5 py-4"><input type="checkbox" checked={selectedIds.includes(id)} onChange={() => onToggleSelect(id)} className="w-4 h-4 cursor-pointer accent-[#FBC33B]" aria-label={`Select ${getTitle?.(row) || singularLabel}`} /></td>}
                  <td className="px-5 py-4">{entityCell(row)}</td>
                  {columns.map((column) => <td key={column.key} className={`px-5 py-4 text-sm text-[#DCE6FF] ${column.cellClassName || ''}`}>{column.render(row)}</td>)}
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-2">{actionsFor(row)}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-[#254477]">
        {rows.map((row) => {
          const id = getId(row);
          return (
            <article key={id} className={`p-4 ${id === highlightedId ? 'bg-[#FBC33B]/10 shadow-[inset_4px_0_0_#FBC33B]' : 'bg-[#081C49]'}`}>
              <div className="flex items-start gap-3">
                {selectable && <input type="checkbox" checked={selectedIds.includes(id)} onChange={() => onToggleSelect(id)} className="w-4 h-4 mt-3 cursor-pointer accent-[#FBC33B]" aria-label={`Select ${getTitle?.(row) || singularLabel}`} />}
                <div className="flex-1 min-w-0">{entityCell(row)}</div>
              </div>
              <dl className="grid grid-cols-2 gap-2.5 mt-4">
                {columns.map((column) => <div key={column.key} className="rounded-xl p-3 bg-[#0A2463] border border-[#254477]"><dt className="text-[9px] font-black uppercase tracking-wider text-[#647DBA]">{column.label}</dt><dd className="mt-1 text-xs text-[#DCE6FF] min-w-0">{column.render(row)}</dd></div>)}
              </dl>
              <div className="flex justify-end gap-2 mt-4">{actionsFor(row)}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AdminEntityTable;
