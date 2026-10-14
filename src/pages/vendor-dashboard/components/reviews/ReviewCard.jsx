import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import Icon from 'components/AppIcon';
import StarRating from '../common/StarRating';

// Initials avatar fallback
const InitialsAvatar = ({ name }) => {
  const initials = (name ?? 'Customer')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CU';

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md"
      style={{
        background: 'linear-gradient(135deg, #0D2F83 0%, #081C49 100%)',
        color: '#FBC33B',
        border: '1px solid #1D4ED8',
      }}
    >
      {initials}
    </div>
  );
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

const ReviewCard = ({
  review,
  onReply,
  onDeleteReply,
  onSelectPhoto,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.owner_reply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const reviewerName = review.profiles?.full_name || review.username || 'Valued Customer';
  const reviewerAvatar = review.profiles?.avatar_url;
  const timeAgo = formatTimeAgo(review.created_at);
  const replyTimeAgo = formatTimeAgo(review.owner_reply_at);

  const images = Array.isArray(review.images_paths) ? review.images_paths.filter(Boolean) : [];

  const handleSaveReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(review.id, replyText.trim());
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteReply(review.id);
      setReplyText('');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl space-y-4"
      style={{
        background: '#0D2F83', // Royal Blue
        border: '1px solid #1D4ED8', // Blue Border
      }}
    >
      {/* Top Header: Reviewer Info + Rating & Date (NO verified customer badge per instructions) */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {reviewerAvatar ? (
            <img
              src={reviewerAvatar}
              alt={reviewerName}
              className="w-10 h-10 rounded-xl object-cover border border-[#1D4ED8] flex-shrink-0"
            />
          ) : (
            <InitialsAvatar name={reviewerName} />
          )}

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{reviewerName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size={13} />
              <span className="text-xs font-bold text-[#FBC33B]">
                {parseFloat(review.rating || 0).toFixed(1)}
              </span>
              <span className="text-[11px]" style={{ color: '#9FB5F5' }}>
                • {timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Reply Action Trigger (if not already replying or replied) */}
        {!review.owner_reply && !isReplying && (
          <button
            onClick={() => {
              setReplyText('');
              setIsReplying(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-[#17439B] cursor-pointer"
            style={{
              background: '#081C49',
              border: '1px solid #1D4ED8',
              color: '#FBC33B',
            }}
          >
            <Icon name="Reply" size={13} color="#FBC33B" />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Review Comment Text */}
      <p className="text-sm leading-relaxed" style={{ color: '#DCE6FF' }}>
        {review.review_text || review.comment || 'No comment provided.'}
      </p>

      {/* Attached Photos (if any) */}
      {images.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPhoto && onSelectPhoto(imgUrl, images, idx)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#1D4ED8] group cursor-pointer hover:scale-105 transition-all shadow-md"
              style={{ background: '#081C49' }}
            >
              <img
                src={imgUrl}
                alt={`Review photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* Helpful Counter Row */}
      <div className="flex items-center gap-4 text-xs pt-1" style={{ color: '#9FB5F5' }}>
        {review.helpful_count > 0 && (
          <div className="flex items-center gap-1.5">
            <Icon name="ThumbsUp" size={13} color="#FBC33B" />
            <span>Helpful ({review.helpful_count})</span>
          </div>
        )}
      </div>

      {/* Inline Reply Editor (when writing or editing a reply) */}
      {isReplying && (
        <div
          className="rounded-2xl p-4 space-y-3 animate-in fade-in duration-200 border"
          style={{ background: '#081C49', borderColor: '#1D4ED8' }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#FBC33B]">
            <Icon name="MessageSquare" size={14} color="#FBC33B" />
            <span>{review.owner_reply ? 'Edit Restaurant Response' : 'Reply as Restaurant Owner'}</span>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful, professional response to this customer..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-xs text-white placeholder:text-[#647DBA] rounded-xl outline-none resize-none transition-all"
            style={{ background: '#061538', border: '1px solid #1D4ED8' }}
            onFocus={(e) => { e.target.style.borderColor = '#FBC33B'; }}
            onBlur={(e) => { e.target.style.borderColor = '#1D4ED8'; }}
          />

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsReplying(false);
                setReplyText(review.owner_reply || '');
              }}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#9FB5F5] hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveReply}
              disabled={isSubmitting || !replyText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: '#FBC33B', color: '#061538' }}
            >
              {isSubmitting ? (
                <span>Posting...</span>
              ) : (
                <>
                  <Icon name="Send" size={12} color="#061538" />
                  <span>{review.owner_reply ? 'Update Response' : 'Post Response'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Owner's Existing Response Box */}
      {review.owner_reply && !isReplying && (
        <div
          className="rounded-2xl p-4 space-y-2 border relative group"
          style={{ background: '#081C49', borderColor: '#254477' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: '#3C351E', border: '1px solid #FBC33B' }}
              >
                <Icon name="Store" size={12} color="#FBC33B" />
              </div>
              <span className="text-xs font-bold text-white">Restaurant Response</span>
              {replyTimeAgo && (
                <span className="text-[11px]" style={{ color: '#9FB5F5' }}>
                  • {replyTimeAgo}
                </span>
              )}
            </div>

            {/* Edit / Delete Reply Actions */}
            <div className="flex items-center gap-1.5">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1 animate-in fade-in">
                  <span className="text-[10px] text-white">Delete reply?</span>
                  <button
                    onClick={handleDeleteReply}
                    disabled={isSubmitting}
                    className="px-2 py-0.5 rounded-md bg-[#FF4D5E] text-white text-[10px] font-bold hover:brightness-110"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-0.5 rounded-md text-[#9FB5F5] hover:text-white text-[10px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setReplyText(review.owner_reply);
                      setIsReplying(true);
                    }}
                    className="p-1 rounded-lg text-[#9FB5F5] hover:text-[#FBC33B] hover:bg-white/10 transition-colors"
                    title="Edit Reply"
                  >
                    <Icon name="Pencil" size={12} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1 rounded-lg text-[#9FB5F5] hover:text-[#FF4D5E] hover:bg-red-500/10 transition-colors"
                    title="Delete Reply"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: '#DCE6FF' }}>
            {review.owner_reply}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
