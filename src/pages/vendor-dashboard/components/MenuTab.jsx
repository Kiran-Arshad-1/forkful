import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';

const initialMenuItems = [
  { id: 1, name: 'Jerk Chicken Platter', description: 'Slow-cooked jerk chicken with rice & peas, festival, and coleslaw', price: '14.99' },
  { id: 2, name: 'Oxtail Stew', description: 'Tender oxtail braised in rich brown gravy with butter beans', price: '18.50' },
  { id: 3, name: 'Beef Patty', description: 'Flaky pastry filled with seasoned ground beef, Jamaican style', price: '3.50' },
  { id: 4, name: 'Ackee & Saltfish', description: 'Jamaica\'s national dish served with boiled green bananas and dumplings', price: '12.00' },
  { id: 5, name: 'Curry Goat', description: 'Slow-cooked goat in aromatic curry sauce with white rice', price: '16.75' },
];

const emptyItem = { name: '', description: '', price: '' };

const MenuTab = () => {
  const [items, setItems] = useState(initialMenuItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form?.name?.trim()) errs.name = 'Item name is required';
    if (!form?.price?.trim()) errs.price = 'Price is required';
    else if (isNaN(parseFloat(form?.price)) || parseFloat(form?.price) < 0) errs.price = 'Enter a valid price';
    return errs;
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyItem);
    setErrors({});
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingId(item?.id);
    setForm({ name: item?.name, description: item?.description, price: item?.price });
    setErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs)?.length > 0) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    if (editingId) {
      setItems(prev => prev?.map(i => i?.id === editingId ? { ...i, ...form } : i));
    } else {
      setItems(prev => [...prev, { id: Date.now(), ...form }]);
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyItem);
  };

  const handleDelete = (id) => {
    setItems(prev => prev?.filter(i => i?.id !== id));
    setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyItem);
    setErrors({});
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Menu Items</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{items?.length} item{items?.length !== 1 ? 's' : ''} on your menu</p>
        </div>
        {!showForm && (
          <Button variant="default" size="sm" iconName="Plus" iconPosition="left" onClick={handleAdd}>
            Add Item
          </Button>
        )}
      </div>
      {/* Form */}
      {showForm && (
        <div className="bg-card border border-primary/30 rounded-xl p-4 md:p-6 shadow-sm">
          <h4 className="font-heading text-base font-semibold text-foreground mb-4">
            {editingId ? 'Edit Menu Item' : 'New Menu Item'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Item Name"
                type="text"
                value={form?.name}
                onChange={e => handleChange('name', e?.target?.value)}
                placeholder="e.g. Jerk Chicken Platter"
                error={errors?.name}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={form?.description}
                onChange={e => handleChange('description', e?.target?.value)}
                placeholder="Describe the dish, ingredients, serving size..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <Input
                label="Price (BDS)"
                type="number"
                value={form?.price}
                onChange={e => handleChange('price', e?.target?.value)}
                placeholder="0.00"
                error={errors?.price}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="default" loading={saving} onClick={handleSave} iconName="Check" iconPosition="left">
              {editingId ? 'Update Item' : 'Add Item'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      )}
      {/* Items List */}
      {items?.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Icon name="BookOpen" size={40} color="var(--color-muted-foreground)" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">No menu items yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first menu item to get started</p>
          <Button variant="default" size="sm" className="mt-4" iconName="Plus" iconPosition="left" onClick={handleAdd}>
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items?.map(item => (
            <div key={item?.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="UtensilsCrossed" size={18} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item?.name}</p>
                    {item?.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item?.description}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary whitespace-nowrap font-data">${parseFloat(item?.price)?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                  aria-label={`Edit ${item?.name}`}
                >
                  <Icon name="Pencil" size={15} />
                </button>
                {deleteConfirm === item?.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(item?.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-white bg-error hover:bg-red-600 transition-all"
                      aria-label="Confirm delete"
                    >
                      <Icon name="Check" size={14} color="white" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-all"
                      aria-label="Cancel delete"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item?.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-error hover:bg-red-50 transition-all"
                    aria-label={`Delete ${item?.name}`}
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuTab;