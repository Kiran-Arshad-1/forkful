import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const mockReviews = [
  { id: 1, author: 'Marcus Thompson', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18d854688-1763295573707.png", avatarAlt: 'Professional headshot of Black man with short hair wearing casual blue shirt smiling warmly', rating: 5, date: '03/02/2026', text: 'Absolutely incredible jerk chicken! The flavors are authentic and the portions are generous. Will definitely be coming back every week.', dish: 'Jerk Chicken Platter' },
  { id: 2, author: 'Keisha Williams', avatar: "https://images.unsplash.com/photo-1718609256733-b1c7645735f1", avatarAlt: 'Smiling Black woman with natural hair wearing yellow top in bright outdoor setting', rating: 4, date: '02/28/2026', text: 'The oxtail stew was tender and flavorful. Service was quick and the staff were very friendly. Slightly pricey but worth it.', dish: 'Oxtail Stew' },
  { id: 3, author: 'Devon Clarke', avatar: "https://images.unsplash.com/photo-1715546484806-1b2a151e1f5a", avatarAlt: 'Young man with dreadlocks wearing white polo shirt standing outdoors in sunny weather', rating: 5, date: '02/25/2026', text: 'Best beef patties in Kingston! Crispy pastry, well-seasoned filling. I buy a dozen every Friday for the office.', dish: 'Beef Patty' },
  { id: 4, author: 'Sandra Morrison', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_198de5b68-1763301200145.png", avatarAlt: 'Middle-aged woman with glasses and natural hair wearing professional attire at office desk', rating: 3, date: '02/20/2026', text: 'Food was good but the wait time was longer than expected. The ackee and saltfish was authentic though. Would try again.', dish: 'Ackee & Saltfish' },
  { id: 5, author: 'Andre Campbell', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_19ec31d5e-1772186393985.png", avatarAlt: 'Athletic man with short beard wearing sports jersey smiling confidently in outdoor setting', rating: 5, date: '02/15/2026', text: "Curry goat is phenomenal! Reminds me of my grandmother\'s cooking. The rice was perfectly cooked too. Highly recommend!", dish: 'Curry Goat' },
];

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5]?.map((s) => (
      <Icon key={s} name="Star" size={size} color={s <= rating ? '#C9A84C' : 'rgba(155,164,232,0.3)'} className={s <= rating ? 'fill-current' : ''} />
    ))}
  </div>
);

const ReviewsTab = () => {
  const [filter, setFilter] = useState('all');

  const avgRating = (mockReviews?.reduce((s, r) => s + r?.rating, 0) / mockReviews?.length)?.toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1]?.map((r) => ({
    rating: r,
    count: mockReviews?.filter((rv) => rv?.rating === r)?.length,
    pct: Math.round(mockReviews?.filter((rv) => rv?.rating === r)?.length / mockReviews?.length * 100)
  }));

  const filtered = filter === 'all' ? mockReviews : mockReviews?.filter((r) => r?.rating === parseInt(filter));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary */}
      <div className="rounded-xl p-4 md:p-6" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h3 className="font-heading text-lg font-semibold mb-4" style={{ color: '#FFFFFF' }}>Customer Reviews</h3>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex flex-col items-center justify-center sm:w-32 flex-shrink-0">
            <span className="text-5xl font-bold font-data" style={{ color: '#C9A84C' }}>{avgRating}</span>
            <StarRating rating={Math.round(parseFloat(avgRating))} size={18} />
            <span className="text-xs mt-1" style={{ color: '#9BA4E8' }}>{mockReviews?.length} reviews</span>
          </div>
          <div className="flex-1 space-y-2">
            {ratingCounts?.map(({ rating, count, pct }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs w-4 text-right" style={{ color: '#9BA4E8' }}>{rating}</span>
                <Icon name="Star" size={12} color="#C9A84C" />
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(155,164,232,0.2)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#C9A84C' }} />
                </div>
                <span className="text-xs w-6 text-right" style={{ color: '#9BA4E8' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', '5', '4', '3', '2', '1']?.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
            style={{
              background: filter === f ? '#C9A84C' : 'transparent',
              color: filter === f ? '#0F1A5C' : '#9BA4E8',
              borderColor: filter === f ? '#C9A84C' : 'rgba(201,168,76,0.3)'
            }}
          >
            {f === 'all' ? 'All Reviews' : `${f} ★`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered?.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: '#9BA4E8' }}>No reviews for this rating.</div>
        ) : (
          filtered?.map((review) => (
            <div key={review?.id} className="rounded-xl p-4 md:p-5" style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={review?.avatar} alt={review?.avatarAlt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>{review?.author}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review?.rating} size={13} />
                        <span className="text-xs" style={{ color: '#9BA4E8' }}>{review?.date}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>{review?.dish}</span>
                  </div>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: '#FFFFFF' }}>{review?.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-center pb-2" style={{ color: '#9BA4E8' }}>Reviews are collected from verified customers and cannot be edited.</p>
    </div>
  );
};

export default ReviewsTab;