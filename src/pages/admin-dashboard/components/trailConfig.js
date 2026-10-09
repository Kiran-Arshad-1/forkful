export const PARISH_OPTIONS = [
  ['christ_church', 'Christ Church'],
  ['st_michael', 'St. Michael'],
  ['st_james', 'St. James'],
  ['st_peter', 'St. Peter'],
  ['st_lucy', 'St. Lucy'],
  ['st_andrew', 'St. Andrew'],
  ['st_joseph', 'St. Joseph'],
  ['st_john', 'St. John'],
  ['st_george', 'St. George'],
  ['st_philip', 'St. Philip'],
  ['st_thomas', 'St. Thomas'],
].map(([value, label]) => ({ value, label }));

export const DURATION_OPTIONS = ['Short', 'Medium', 'Long']
  .map((value) => ({ value, label: value }));

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const FILTER_DURATION_OPTIONS = [
  { value: 'all', label: 'All durations' },
  ...DURATION_OPTIONS,
];

export const emptyTrailForm = () => ({
  id: null,
  name: '',
  description: '',
  parish: '',
  durationCategory: 'Short',
  coverImageUrl: '',
  coverFile: null,
  status: 'draft',
  stops: [],
});

export const formatParish = (value) => PARISH_OPTIONS.find((option) => option.value === value)?.label
  || value?.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  || 'No parish';

export const getBusinessImage = (business) => business?.profile_img_url
  || business?.logo_url
  || business?.image_url
  || business?.business_images_urls?.find((url) => /^https?:\/\//.test(url))
  || '';

export const normalizeStops = (trail) => [...(trail?.stops || [])]
  .sort((a, b) => a.stop_order - b.stop_order)
  .map((stop) => ({ businessId: stop.business_id }));

export const normalizeDuration = (value) => ({
  Easy: 'Short',
  Moderate: 'Medium',
  Hard: 'Long',
  Challenging: 'Long',
}[value] || value || 'Short');
