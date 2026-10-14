import React from 'react';
import TabHeroHeader from '../common/TabHeroHeader';
import Icon from 'components/AppIcon';

const MenuHeroHeader = ({
  business,
  totalItems = 0,
  availableItems = 0,
  outOfStockItems = 0,
  reviews = [],
  onBackToBusinesses,
  onAddItem,
  onEditMenu,
}) => {
  const hasReviews = Array.isArray(reviews) && reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <TabHeroHeader
      business={business}
      onBackToBusinesses={onBackToBusinesses}
      metaRow={
        <>
          {hasReviews && (
            <div className="flex items-center gap-1.5">
              <Icon name="Star" size={14} color="#FBC33B" className="fill-[#FBC33B]" />
              <span className="text-white font-bold">{avgRating}</span>
              <span style={{ color: '#9FB5F5' }}>
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5" style={{ color: '#9FB5F5' }}>
            <Icon name="Utensils" size={13} color="#9FB5F5" />
            <span className="text-white font-semibold">{totalItems}</span>
            <span>{totalItems === 1 ? 'Menu Item' : 'Menu Items'}</span>
          </div>
        </>
      }
      actions={[
        {
          label: 'Add Item',
          icon: 'Plus',
          variant: 'gold',
          onClick: onAddItem,
        },
        {
          label: 'Edit Menu',
          icon: 'Edit3',
          variant: 'navy',
          onClick: onEditMenu,
        },
      ]}
      statsBox={
        <div
          className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl w-full"
          style={{ background: '#081C49', border: '1px solid #254477' }}
        >
          {/* Total Items */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl" style={{ background: '#0D2F83' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: '#FBC33B' }}>
              <Icon name="Utensils" size={12} color="#FBC33B" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
            </div>
            <span className="text-lg font-extrabold text-white">{totalItems}</span>
          </div>

          {/* Available */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl" style={{ background: '#0D2F83' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: '#10D6A0' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10D6A0' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Available</span>
            </div>
            <span className="text-lg font-extrabold text-white">{availableItems}</span>
          </div>

          {/* Out of Stock */}
          <div className="flex flex-col items-center text-center p-2 rounded-xl" style={{ background: '#0D2F83' }}>
            <div className="flex items-center gap-1 mb-1" style={{ color: '#FF4D5E' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF4D5E' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
            </div>
            <span className="text-lg font-extrabold text-white">{outOfStockItems}</span>
          </div>
        </div>
      }
    />
  );
};

export default MenuHeroHeader;
