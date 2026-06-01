import React, { useReducer, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Input from 'components/ui/Input';
import useAuthStore from '../../../store/authStore';
import useVendorProfileStore from '../../../store/vendorProfileStore';
import { MenuSkeleton } from 'components/ui/Shimmer';

const emptyForm = { name: '', description: '', price: '' };

const init = {
  tabLoading:    true,
  showForm:      false,
  editingId:     null,
  formValues:    emptyForm,
  formErrors:    {},
  saving:        false,
  deleteConfirm: null,
};

const reducer = (s, a) => {
  switch (a.type) {
    case 'LOADED':
      return { ...s, tabLoading: false };
    case 'FORM_ADD':
      return { ...s, showForm: true, editingId: null, formValues: emptyForm, formErrors: {} };
    case 'FORM_EDIT':
      return { ...s, showForm: true, editingId: a.item.id, formErrors: {},
        formValues: { name: a.item.name, description: a.item.description ?? '', price: String(a.item.price ?? '') } };
    case 'FORM_CLOSE':
      return { ...s, showForm: false, editingId: null, formValues: emptyForm, formErrors: {}, saving: false };
    case 'FORM_FIELD':
      return { ...s,
        formValues: { ...s.formValues, [a.field]: a.value },
        formErrors: { ...s.formErrors, [a.field]: '' },
      };
    case 'FORM_ERRORS':
      return { ...s, formErrors: a.errors };
    case 'SAVE_START':
      return { ...s, saving: true };
    case 'SAVE_DONE':
      return { ...s, showForm: false, editingId: null, formValues: emptyForm, formErrors: {}, saving: false };
    case 'SAVE_FAIL':
      return { ...s, saving: false };
    case 'DELETE_ASK':
      return { ...s, deleteConfirm: a.id };
    case 'DELETE_CANCEL':
      return { ...s, deleteConfirm: null };
    default:
      return s;
  }
};

const MenuTab = () => {
  const { user } = useAuthStore();
  const {
    profile,
    menuItems: items,
    fetchProfile,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  } = useVendorProfileStore();

  const [state, dispatch] = useReducer(reducer, init);
  const { tabLoading, showForm, editingId, formValues, formErrors, saving, deleteConfirm } = state;

  useEffect(() => {
    if (!user?.id) return;
    if (!profile) { fetchProfile(user.id); return; }
    fetchMenuItems().finally(() => dispatch({ type: 'LOADED' }));
  }, [user?.id, profile?.vendor_id]);

  const validate = () => {
    const errors = {};
    if (!formValues.name?.trim()) errors.name = 'Item name is required';
    if (!formValues.price?.trim()) errors.price = 'Price is required';
    else if (isNaN(parseFloat(formValues.price)) || parseFloat(formValues.price) < 0) errors.price = 'Enter a valid price';
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { dispatch({ type: 'FORM_ERRORS', errors }); return; }
    dispatch({ type: 'SAVE_START' });
    try {
      if (editingId) {
        await updateMenuItem(editingId, {
          name:        formValues.name,
          description: formValues.description,
          price:       parseFloat(formValues.price),
        });
      } else {
        await addMenuItem({
          name:        formValues.name,
          description: formValues.description,
          price:       parseFloat(formValues.price),
        });
      }
      dispatch({ type: 'SAVE_DONE' });
    } catch {
      dispatch({ type: 'SAVE_FAIL' });
    }
  };

  const handleDelete = async (id) => {
    await deleteMenuItem(id);
    dispatch({ type: 'DELETE_CANCEL' });
  };

  if (tabLoading) return <MenuSkeleton />;

  return (
    <div className="w-full space-y-4 lg:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold" style={{ color: '#FFFFFF' }}>Menu Items</h3>
          <p className="text-xs mt-0.5" style={{ color: '#9BA4E8' }}>
            {items?.length} item{items?.length !== 1 ? 's' : ''} on your menu
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => dispatch({ type: 'FORM_ADD' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Plus" size={16} color="#0F1A5C" />
            Add Item
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
          <h4 className="font-heading text-base font-semibold mb-4" style={{ color: '#FFFFFF' }}>
            {editingId ? 'Edit Menu Item' : 'New Menu Item'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Item Name"
                type="text"
                value={formValues.name}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'name', value: e.target.value })}
                placeholder="e.g. Jerk Chicken Platter"
                error={formErrors.name}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>Description</label>
              <textarea
                value={formValues.description}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'description', value: e.target.value })}
                placeholder="Describe the dish, ingredients, serving size..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg resize-none outline-none transition-all duration-250"
                style={{ background: '#0F1A5C', border: '1px solid rgba(201,168,76,0.3)', color: '#FFFFFF' }}
              />
            </div>
            <div>
              <Input
                label="Price (BDS$)"
                type="number"
                value={formValues.price}
                onChange={e => dispatch({ type: 'FORM_FIELD', field: 'price', value: e.target.value })}
                placeholder="0.00"
                error={formErrors.price}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: '#C9A84C', color: '#0F1A5C' }}
            >
              <Icon name={saving ? 'Loader2' : 'Check'} size={16} color="#0F1A5C" className={saving ? 'animate-spin' : ''} />
              {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            <button
              onClick={() => dispatch({ type: 'FORM_CLOSE' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#9BA4E8' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items?.length === 0 && !showForm && (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-16 px-6"
          style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)', minHeight: '320px' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <Icon name="UtensilsCrossed" size={28} color="#C9A84C" />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: '#FFFFFF' }}>No menu items yet</p>
          <p className="text-sm mb-6 text-center" style={{ color: '#9BA4E8' }}>
            Add your first dish to start building your menu
          </p>
          <button
            onClick={() => dispatch({ type: 'FORM_ADD' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#C9A84C', color: '#0F1A5C' }}
          >
            <Icon name="Plus" size={16} color="#0F1A5C" />
            Add First Item
          </button>
        </div>
      )}

      {/* Items List */}
      {items?.length > 0 && (
        <div className="w-full space-y-3">
          {items?.map(item => (
            <div
              key={item?.id}
              className="w-full rounded-xl p-4 flex items-start gap-4 transition-all duration-200"
              style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                <Icon name="UtensilsCrossed" size={18} color="#C9A84C" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{item?.name}</p>
                {item?.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#9BA4E8' }}>{item?.description}</p>
                )}
              </div>

              <span className="text-sm font-bold whitespace-nowrap flex-shrink-0" style={{ color: '#C9A84C' }}>
                BDS$ {parseFloat(item?.price ?? 0)?.toFixed(2)}
              </span>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => dispatch({ type: 'FORM_EDIT', item })}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                  style={{ color: '#9BA4E8' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  aria-label={`Edit ${item?.name}`}
                >
                  <Icon name="Pencil" size={15} />
                </button>

                {deleteConfirm === item?.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(item?.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                      style={{ background: '#F87171', color: '#FFFFFF' }}
                      aria-label="Confirm delete"
                    >
                      <Icon name="Check" size={14} color="#FFFFFF" />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_CANCEL' })}
                      className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                      style={{ color: '#9BA4E8' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      aria-label="Cancel delete"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => dispatch({ type: 'DELETE_ASK', id: item?.id })}
                    className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                    style={{ color: '#9BA4E8' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#F87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9BA4E8'; }}
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
