import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';
import Button from 'components/ui/Button';

const initialPhotos = [
{
  id: 1,
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_11405e31c-1772674868329.png",
  alt: 'Colorful Jamaican jerk chicken platter with rice peas and festival on wooden table',
  caption: 'Jerk Chicken Platter'
},
{
  id: 2,
  src: "https://img.rocket.new/generatedImages/rocket_gen_img_173f670a8-1772056396117.png",
  alt: 'Vibrant Caribbean food spread with multiple dishes on bright tablecloth in restaurant setting',
  caption: 'Our Menu Spread'
},
{
  id: 3,
  src: "https://images.unsplash.com/photo-1716539462427-04897bcc64e9",
  alt: 'Warm inviting restaurant interior with wooden tables and warm lighting in evening ambiance',
  caption: 'Restaurant Interior'
},
{
  id: 4,
  src: "https://images.unsplash.com/photo-1677746526098-930de6524b0d",
  alt: 'Fresh tropical fruit salad with mango papaya and pineapple in glass bowl on counter',
  caption: 'Fresh Sides'
}];


const PhotosTab = () => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [dragging, setDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {e?.preventDefault();setDragging(true);};
  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragging(false);
    const files = Array.from(e?.dataTransfer?.files)?.filter((f) => f?.type?.startsWith('image/'));
    if (files?.length > 0) simulateUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files)?.filter((f) => f?.type?.startsWith('image/'));
    if (files?.length > 0) simulateUpload(files);
    e.target.value = '';
  };

  const simulateUpload = async (files) => {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const mockUrls = [
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pixabay.com/photo/2017/01/26/02/06/platter-2009590_640.jpg'];

    const newPhotos = files?.map((file, i) => ({
      id: Date.now() + i,
      src: mockUrls?.[i % mockUrls?.length],
      alt: `Uploaded food photo showing ${file?.name?.replace(/\.[^/.]+$/, '')} dish presentation`,
      caption: file?.name?.replace(/\.[^/.]+$/, '')?.replace(/[-_]/g, ' ')
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const handleDelete = (id) => {
    setPhotos((prev) => prev?.filter((p) => p?.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">Business Photos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{photos?.length} photo{photos?.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <Button variant="outline" size="sm" iconName="Upload" iconPosition="left" onClick={() => fileInputRef?.current?.click()}>
          Upload Photos
        </Button>
      </div>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef?.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`
        }>
        
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        {uploading ?
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading photos...</p>
          </div> :

        <>
            <Icon name="ImagePlus" size={36} color="var(--color-muted-foreground)" />
            <p className="mt-2 text-sm font-medium text-foreground">Drag &amp; drop photos here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse — JPG, PNG, WebP supported</p>
          </>
        }
      </div>
      {/* Photo Grid */}
      {photos?.length > 0 &&
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {photos?.map((photo) =>
        <div key={photo?.id} className="group relative bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <Image
              src={photo?.src}
              alt={photo?.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground font-medium truncate">{photo?.caption}</p>
              </div>
              {/* Delete overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {deleteConfirm === photo?.id ?
            <div className="flex gap-1">
                    <button
                onClick={() => handleDelete(photo?.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-error text-white shadow-md"
                aria-label="Confirm delete photo">
                
                      <Icon name="Check" size={13} color="white" />
                    </button>
                    <button
                onClick={() => setDeleteConfirm(null)}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-card text-foreground shadow-md"
                aria-label="Cancel delete">
                
                      <Icon name="X" size={13} />
                    </button>
                  </div> :

            <button
              onClick={() => setDeleteConfirm(photo?.id)}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-card/90 text-error shadow-md hover:bg-error hover:text-white transition-all"
              aria-label={`Delete photo ${photo?.caption}`}>
              
                    <Icon name="Trash2" size={13} />
                  </button>
            }
              </div>
            </div>
        )}
        </div>
      }
      {photos?.length === 0 && !uploading &&
      <div className="text-center py-8 text-muted-foreground text-sm">No photos yet. Upload some to showcase your business!</div>
      }
    </div>);

};

export default PhotosTab;