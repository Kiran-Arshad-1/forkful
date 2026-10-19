const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

export const getBusinessStatus = (businessStatus) => {
  const listingStatus = normalizeStatus(businessStatus);

  if (['blocked', 'rejected', 'vendor_rejected'].includes(listingStatus)) {
    return {
      key: 'blocked', label: listingStatus === 'blocked' ? 'Blocked' : 'Rejected',
      color: '#FF6B79', background: 'rgba(64, 22, 39, 0.92)', border: 'rgba(255, 107, 121, 0.7)', icon: 'Ban',
    };
  }

  if (['active', 'approved'].includes(listingStatus)) {
    return {
      key: 'approved', label: 'Approved & Live',
      color: '#10D6A0', background: 'rgba(6, 40, 50, 0.9)', border: 'rgba(16, 214, 160, 0.7)', icon: 'CheckCircle',
    };
  }

  if (listingStatus === 'pending') {
    return {
      key: 'pending', label: 'Pending Review',
      color: '#FBC33B', background: 'rgba(60, 53, 30, 0.92)', border: 'rgba(251, 195, 59, 0.7)', icon: 'Clock',
    };
  }

  return {
    key: 'unknown', label: listingStatus ? `Unknown: ${listingStatus}` : 'Status unavailable',
    color: '#9FB5F5', background: 'rgba(37, 68, 119, 0.7)', border: '#526A9F', icon: 'CircleHelp',
  };
};

export const isBusinessActive = (businessStatus) => getBusinessStatus(businessStatus).key === 'approved';
