import React from 'react';
import TabHeroHeader from '../common/TabHeroHeader';
import Icon from 'components/AppIcon';

const PhotoHeroHeader = ({
  business,
  totalPhotos = 0,
  onBackToBusinesses,
  onOpenUploadModal,
}) => {
  return (
    <TabHeroHeader
      business={business}
      onBackToBusinesses={onBackToBusinesses}
      actions={[
        {
          label: 'Upload Photos',
          icon: 'Upload',
          variant: 'gold',
          onClick: onOpenUploadModal,
        },
      ]}
      statsBox={
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl w-full sm:w-auto"
          style={{ background: '#081C49', border: '1px solid #254477' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#0D2F83', border: '1px solid #1D4ED8' }}
          >
            <Icon name="Images" size={18} color="#FBC33B" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9FB5F5' }}>
              Total Photos
            </span>
            <span className="text-lg font-extrabold text-white">
              {totalPhotos} {totalPhotos === 1 ? 'Photo' : 'Photos'}
            </span>
          </div>
        </div>
      }
    />
  );
};

export default PhotoHeroHeader;
