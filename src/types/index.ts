// Core Data Models matching the Firestore Blueprint Specification

export type UserRole = 'user' | 'admin';
export type UserStatusState = 'active' | 'muted' | 'banned';

export interface UserStatus {
  state: UserStatusState;
  until: string | null;
  reason: string;
}

export interface AvatarConfig {
  baseModelId: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  canvasScale: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  role: UserRole;
  isPremium: boolean;
  preferredLanguage: 'en' | 'fr' | 'es';
  status: UserStatus;
  avatarConfig: AvatarConfig;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ClothingCategory = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';

export interface ClosetItem {
  itemId: string;
  userId: string;
  name: string;
  imageUrl: string;
  transparentPngUrl: string | null;
  category: ClothingCategory;
  colors: string[];
  useCases: string[];
  emotionalTags: string[];
  wearCount: number;
  lastWornAt: string | null;
  searchKeywords: string[];
  createdAt: string;
}

export interface CanvasItemState {
  x: number;
  y: number;
  zIndex: number;
  scale: number;
}

export interface Outfit {
  outfitId: string;
  userId: string;
  name: string;
  itemIds: string[];
  moodTarget: string;
  scheduledDates: string[]; // YYYY-MM-DD
  avatarCanvasState: Record<string, CanvasItemState>;
  previewImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  journalId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  moodScore: number; // 1 - 10
  emotionsLogged: string[];
  outfitId: string | null;
  wornItemIds: string[];
  entryText: string;
  sentimentScore: number | null; // -1.0 to 1.0
  aiProcessed: boolean;
  createdAt: string;
}

export interface CategoryCorrelations {
  [category: string]: Record<string, number>;
}

export interface Insight {
  insightId: string;
  userId: string;
  period: 'weekly' | 'monthly' | 'all_time';
  startDate: string;
  endDate: string;
  powerColor: string;
  topOutfitId: string | null;
  categoryCorrelations: CategoryCorrelations;
  aiNarrativeSummary: string;
  actionableTip: string;
  generatedAt: string;
}

export interface PostComment {
  commentId: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  text: string;
  createdAt: string;
}

export interface Post {
  postId: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string;
  mediaUrl: string;
  caption: string;
  outfitId: string | null;
  taggedItemCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  // Subcollections represented in memory
  likes?: Record<string, { userId: string; createdAt: string }>;
  comments?: PostComment[];
}

export interface Retailer {
  retailerId: string;
  name: string;
  logoUrl: string;
  searchUrlTemplate: string; // contains {query} and {affiliateId}
  affiliateId: string;
  isActive: boolean;
  priorityOrder: number;
  updatedAt: string;
}

export interface AdminAuditLog {
  logId: string;
  adminId: string;
  targetUserId: string;
  actionType: 'SET_PREMIUM' | 'MUTE_USER' | 'BAN_USER' | 'UNBAN_USER' | 'RETAILER_UPDATE';
  details: {
    durationDays?: number;
    reason: string;
    priorStatus?: string;
  };
  timestamp: string;
}

export type ActiveTab = 'social' | 'closet' | 'outfits' | 'journal' | 'menu';
export type MenuSubView = 'insights' | 'avatar' | 'retailers' | 'admin' | 'settings' | null;
