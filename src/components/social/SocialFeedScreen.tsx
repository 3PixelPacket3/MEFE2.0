import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  ShoppingBag,
  Send,
  Plus,
  X,
  Upload,
  CheckCircle,
  Layers
} from 'lucide-react';
import { Post, UserProfile, ClosetItem, Outfit } from '../../types';
import { useTranslation } from '../../i18n';

interface SocialFeedScreenProps {
  posts: Post[];
  user: UserProfile;
  closetItems: ClosetItem[];
  outfits: Outfit[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onAddPost: (post: Omit<Post, 'postId' | 'likeCount' | 'commentCount' | 'createdAt' | 'likes' | 'comments'>) => void;
  onShopThisLook: (query: string) => void;
}

export const SocialFeedScreen: React.FC<SocialFeedScreenProps> = ({
  posts,
  user,
  closetItems,
  outfits,
  onToggleLike,
  onAddComment,
  onAddPost,
  onShopThisLook
}) => {
  const { t } = useTranslation();

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Post Form State
  const [newCaption, setNewCaption] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);

  const samplePostPhotos = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'
  ];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    onAddPost({
      authorId: user.uid,
      authorDisplayName: user.displayName,
      authorPhotoURL: user.photoURL,
      mediaUrl: newMediaUrl || samplePostPhotos[0],
      caption: newCaption.trim(),
      outfitId: selectedOutfitId,
      taggedItemCount: selectedOutfitId ? 3 : 1
    });

    setNewCaption('');
    setNewMediaUrl('');
    setSelectedOutfitId(null);
    setIsCreateModalOpen(false);
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const activePostForComments = posts.find(p => p.postId === activeCommentPostId);

  return (
    <div className="pb-24 pt-2 max-w-xl mx-auto space-y-5">
      {/* Feed Header & Share Look Button */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="font-display font-bold text-2xl text-cocoa-900 tracking-tight">
            {t('socialTitle')}
          </h1>
          <p className="text-xs text-cocoa-400">
            Inspiring mindful style & emotional empowerment
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t('shareLookBtn')}</span>
        </button>
      </div>

      {/* Feed List: Instagram-style Single Column */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isLikedByMe = Boolean(post.likes && post.likes[user.uid]);
          const commentsList = post.comments || [];

          return (
            <article
              key={post.postId}
              className="bg-white rounded-3xl overflow-hidden border border-warm-border shadow-warm-sm hover:shadow-warm-md transition-shadow"
            >
              {/* Header: User Avatar, Name, Timestamp */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorPhotoURL}
                    alt={post.authorDisplayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-terracotta-400/40"
                  />
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-cocoa-900">
                      {post.authorDisplayName}
                    </h3>
                    <p className="text-[10px] text-cocoa-400">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {post.outfitId && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-terracotta-50 text-terracotta-700 border border-terracotta-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-terracotta-500" />
                    Outfit Synced
                  </span>
                )}
              </div>

              {/* Body: Full-width Outfit Photo */}
              <div
                className="relative aspect-square sm:aspect-[4/5] bg-warm-100 overflow-hidden cursor-pointer"
                onDoubleClick={() => onToggleLike(post.postId)}
              >
                <img
                  src={post.mediaUrl}
                  alt="Post visual"
                  className="w-full h-full object-cover"
                />

                {/* Floating "Shop This Look" Button overlay */}
                <button
                  onClick={() => onShopThisLook(post.caption)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-cocoa-900 font-bold text-xs shadow-md backdrop-blur-sm transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>{t('shopThisLook')}</span>
                </button>
              </div>

              {/* Footer: Terracotta Red Like Heart, Comment, and Caption */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Terracotta Red Like Button */}
                    <button
                      onClick={() => onToggleLike(post.postId)}
                      className="flex items-center gap-1.5 text-xs font-bold transition-all group"
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform group-active:scale-125 ${
                          isLikedByMe
                            ? 'text-terracotta-500 fill-terracotta-500'
                            : 'text-cocoa-500 hover:text-terracotta-500'
                        }`}
                      />
                      <span className={isLikedByMe ? 'text-terracotta-600' : 'text-cocoa-600'}>
                        {post.likeCount}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => setActiveCommentPostId(post.postId)}
                      className="flex items-center gap-1.5 text-xs font-bold text-cocoa-500 hover:text-cocoa-700 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentCount}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onShopThisLook(post.caption)}
                    className="text-xs text-terracotta-600 font-bold hover:underline"
                  >
                    Find similar items
                  </button>
                </div>

                {/* Caption */}
                <div className="text-xs sm:text-sm text-cocoa-800 leading-relaxed">
                  <span className="font-bold text-cocoa-900 mr-1.5">
                    {post.authorDisplayName}
                  </span>
                  <span>{post.caption}</span>
                </div>

                {/* Inline recent comment snippet */}
                {commentsList.length > 0 && (
                  <div className="pt-2 border-t border-warm-100 text-xs text-cocoa-600">
                    <p className="line-clamp-1">
                      <span className="font-bold text-cocoa-800 mr-1">
                        {commentsList[commentsList.length - 1].authorDisplayName}:
                      </span>
                      {commentsList[commentsList.length - 1].text}
                    </p>
                    {commentsList.length > 1 && (
                      <button
                        onClick={() => setActiveCommentPostId(post.postId)}
                        className="text-[11px] text-cocoa-400 hover:text-terracotta-600 mt-1 font-medium"
                      >
                        View all {commentsList.length} comments
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Comment Drawer Modal */}
      {activeCommentPostId && activePostForComments && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-cocoa-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-warm-border max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <h3 className="font-bold text-base text-cocoa-900">
                {t('comments')} ({activePostForComments.comments?.length || 0})
              </h3>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="p-1 rounded-full hover:bg-warm-100 text-cocoa-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments scroll area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[160px]">
              {(activePostForComments.comments || []).length > 0 ? (
                activePostForComments.comments?.map((comment) => (
                  <div key={comment.commentId} className="flex gap-2.5 items-start">
                    <img
                      src={comment.authorPhotoURL}
                      alt={comment.authorDisplayName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="flex-1 bg-warm-50 p-2.5 rounded-2xl border border-warm-border">
                      <p className="text-xs font-bold text-cocoa-900">
                        {comment.authorDisplayName}
                      </p>
                      <p className="text-xs text-cocoa-700 mt-0.5">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-cocoa-400 text-center py-6">
                  No comments yet. Start the conversation!
                </p>
              )}
            </div>

            {/* Input row */}
            <div className="pt-3 border-t border-warm-border flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendComment(activeCommentPostId);
                  }
                }}
                placeholder={t('addCommentPlaceholder')}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-warm-50 border border-warm-border focus:bg-white text-cocoa-900 focus:outline-none"
              />
              <button
                onClick={() => handleSendComment(activeCommentPostId)}
                className="p-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <h3 className="font-bold text-base text-cocoa-900">Share Your Mindful Look</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-warm-100 text-cocoa-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Caption
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Share the story behind this ensemble and how it empowered your day..."
                  className="w-full p-3 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 resize-none focus:bg-white"
                />
              </div>

              {/* Photo picker */}
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Photo
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {samplePostPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Choice"
                      onClick={() => setNewMediaUrl(url)}
                      className={`w-full aspect-square object-cover rounded-xl border-2 cursor-pointer transition-all ${
                        newMediaUrl === url ? 'border-terracotta-500 scale-95' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tag Outfit */}
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Tag Wardrobe Outfit
                </label>
                <select
                  value={selectedOutfitId || ''}
                  onChange={(e) => setSelectedOutfitId(e.target.value || null)}
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
                >
                  <option value="">None (Stand-alone look)</option>
                  {outfits.map(o => (
                    <option key={o.outfitId} value={o.outfitId}>
                      {o.name} ({o.moodTarget})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-warm-100 font-bold text-xs text-cocoa-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
                >
                  Publish Look
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
