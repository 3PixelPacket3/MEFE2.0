import {
  UserProfile,
  ClosetItem,
  Outfit,
  JournalEntry,
  Insight,
  Post,
  Retailer,
  AdminAuditLog,
  PostComment,
  UserStatusState
} from '../types';
import {
  initialUser,
  initialClosetItems,
  initialOutfits,
  initialJournalEntries,
  initialInsights,
  initialPosts,
  initialRetailers,
  initialAuditLogs
} from '../data/mockData';

const KEYS = {
  USER: 'mefe_user_profile',
  CLOSET: 'mefe_closet_items',
  OUTFITS: 'mefe_outfits',
  JOURNAL: 'mefe_journal_entries',
  INSIGHTS: 'mefe_insights',
  POSTS: 'mefe_posts',
  RETAILERS: 'mefe_retailers',
  LOGS: 'mefe_audit_logs',
};

class StorageService {
  // User Profile
  getUser(): UserProfile {
    try {
      const raw = localStorage.getItem(KEYS.USER);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveUser(initialUser);
    return initialUser;
  }

  saveUser(user: UserProfile): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUser();
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    this.saveUser(updated);
    return updated;
  }

  // Closet Items
  getClosetItems(): ClosetItem[] {
    try {
      const raw = localStorage.getItem(KEYS.CLOSET);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveClosetItems(initialClosetItems);
    return initialClosetItems;
  }

  saveClosetItems(items: ClosetItem[]): void {
    localStorage.setItem(KEYS.CLOSET, JSON.stringify(items));
  }

  addClosetItem(item: Omit<ClosetItem, 'itemId' | 'createdAt' | 'wearCount' | 'lastWornAt'>): ClosetItem {
    const items = this.getClosetItems();
    const newItem: ClosetItem = {
      ...item,
      itemId: 'item_' + Date.now(),
      wearCount: 0,
      lastWornAt: null,
      createdAt: new Date().toISOString()
    };
    items.unshift(newItem);
    this.saveClosetItems(items);
    return newItem;
  }

  updateClosetItem(itemId: string, updates: Partial<ClosetItem>): ClosetItem | null {
    const items = this.getClosetItems();
    const index = items.findIndex(i => i.itemId === itemId);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    this.saveClosetItems(items);
    return items[index];
  }

  deleteClosetItem(itemId: string): void {
    const items = this.getClosetItems().filter(i => i.itemId !== itemId);
    this.saveClosetItems(items);
  }

  incrementWearCount(itemIds: string[]): void {
    const items = this.getClosetItems();
    const now = new Date().toISOString();
    items.forEach(item => {
      if (itemIds.includes(item.itemId)) {
        item.wearCount = (item.wearCount || 0) + 1;
        item.lastWornAt = now;
      }
    });
    this.saveClosetItems(items);
  }

  // Outfits
  getOutfits(): Outfit[] {
    try {
      const raw = localStorage.getItem(KEYS.OUTFITS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveOutfits(initialOutfits);
    return initialOutfits;
  }

  saveOutfits(outfits: Outfit[]): void {
    localStorage.setItem(KEYS.OUTFITS, JSON.stringify(outfits));
  }

  addOutfit(outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>): Outfit {
    const outfits = this.getOutfits();
    const newOutfit: Outfit = {
      ...outfit,
      outfitId: 'outfit_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    outfits.unshift(newOutfit);
    this.saveOutfits(outfits);

    // If scheduled for today, increment wear
    const today = new Date().toISOString().split('T')[0];
    if (newOutfit.scheduledDates.includes(today)) {
      this.incrementWearCount(newOutfit.itemIds);
    }
    return newOutfit;
  }

  deleteOutfit(outfitId: string): void {
    const outfits = this.getOutfits().filter(o => o.outfitId !== outfitId);
    this.saveOutfits(outfits);
  }

  scheduleOutfitDate(outfitId: string, date: string): Outfit | null {
    const outfits = this.getOutfits();
    const target = outfits.find(o => o.outfitId === outfitId);
    if (!target) return null;
    if (!target.scheduledDates.includes(date)) {
      target.scheduledDates.push(date);
      target.updatedAt = new Date().toISOString();
      this.saveOutfits(outfits);
    }
    return target;
  }

  // Journal Entries
  getJournalEntries(): JournalEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.JOURNAL);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveJournalEntries(initialJournalEntries);
    return initialJournalEntries;
  }

  saveJournalEntries(entries: JournalEntry[]): void {
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
  }

  addJournalEntry(entry: Omit<JournalEntry, 'journalId' | 'createdAt'>): JournalEntry {
    const entries = this.getJournalEntries();
    const newEntry: JournalEntry = {
      ...entry,
      journalId: 'jrn_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    entries.unshift(newEntry);
    this.saveJournalEntries(entries);

    if (newEntry.wornItemIds && newEntry.wornItemIds.length > 0) {
      this.incrementWearCount(newEntry.wornItemIds);
    }
    return newEntry;
  }

  // Insights
  getInsights(): Insight {
    try {
      const raw = localStorage.getItem(KEYS.INSIGHTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveInsights(initialInsights);
    return initialInsights;
  }

  saveInsights(insight: Insight): void {
    localStorage.setItem(KEYS.INSIGHTS, JSON.stringify(insight));
  }

  // Posts (Social Feed)
  getPosts(): Post[] {
    try {
      const raw = localStorage.getItem(KEYS.POSTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.savePosts(initialPosts);
    return initialPosts;
  }

  savePosts(posts: Post[]): void {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  }

  addPost(post: Omit<Post, 'postId' | 'likeCount' | 'commentCount' | 'createdAt' | 'likes' | 'comments'>): Post {
    const posts = this.getPosts();
    const newPost: Post = {
      ...post,
      postId: 'post_' + Date.now(),
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      likes: {},
      comments: []
    };
    posts.unshift(newPost);
    this.savePosts(posts);
    return newPost;
  }

  toggleLikePost(postId: string, userId: string): Post | null {
    const posts = this.getPosts();
    const post = posts.find(p => p.postId === postId);
    if (!post) return null;

    if (!post.likes) post.likes = {};
    if (post.likes[userId]) {
      delete post.likes[userId];
      post.likeCount = Math.max(0, (post.likeCount || 1) - 1);
    } else {
      post.likes[userId] = { userId, createdAt: new Date().toISOString() };
      post.likeCount = (post.likeCount || 0) + 1;
    }
    this.savePosts(posts);
    return post;
  }

  addCommentToPost(postId: string, commentData: Omit<PostComment, 'commentId' | 'createdAt'>): Post | null {
    const posts = this.getPosts();
    const post = posts.find(p => p.postId === postId);
    if (!post) return null;

    if (!post.comments) post.comments = [];
    const newComment: PostComment = {
      ...commentData,
      commentId: 'cmt_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    post.comments.push(newComment);
    post.commentCount = (post.commentCount || 0) + 1;
    this.savePosts(posts);
    return post;
  }

  // Retailers
  getRetailers(): Retailer[] {
    try {
      const raw = localStorage.getItem(KEYS.RETAILERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveRetailers(initialRetailers);
    return initialRetailers;
  }

  saveRetailers(retailers: Retailer[]): void {
    localStorage.setItem(KEYS.RETAILERS, JSON.stringify(retailers));
  }

  addRetailer(retailer: Omit<Retailer, 'retailerId' | 'updatedAt'>): Retailer {
    const list = this.getRetailers();
    const newItem: Retailer = {
      ...retailer,
      retailerId: 'ret_' + Date.now(),
      updatedAt: new Date().toISOString()
    };
    list.push(newItem);
    this.saveRetailers(list);
    return newItem;
  }

  updateRetailer(retailerId: string, updates: Partial<Retailer>): Retailer | null {
    const list = this.getRetailers();
    const index = list.findIndex(r => r.retailerId === retailerId);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveRetailers(list);
    return list[index];
  }

  deleteRetailer(retailerId: string): void {
    const list = this.getRetailers().filter(r => r.retailerId !== retailerId);
    this.saveRetailers(list);
  }

  // Admin Logs
  getAuditLogs(): AdminAuditLog[] {
    try {
      const raw = localStorage.getItem(KEYS.LOGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveAuditLogs(initialAuditLogs);
    return initialAuditLogs;
  }

  saveAuditLogs(logs: AdminAuditLog[]): void {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  }

  addAuditLog(log: Omit<AdminAuditLog, 'logId' | 'timestamp'>): AdminAuditLog {
    const logs = this.getAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      logId: 'log_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.saveAuditLogs(logs);
    return newLog;
  }

  // Admin Actions
  toggleUserPremium(targetUserId: string, isPremium: boolean, adminId: string): void {
    if (targetUserId === this.getUser().uid) {
      this.updateUserProfile({ isPremium });
    }
    this.addAuditLog({
      adminId,
      targetUserId,
      actionType: 'SET_PREMIUM',
      details: {
        reason: `Admin set isPremium to ${isPremium}`
      }
    });
  }

  setUserStatus(targetUserId: string, state: UserStatusState, reason: string, adminId: string, durationDays?: number): void {
    if (targetUserId === this.getUser().uid) {
      this.updateUserProfile({
        status: {
          state,
          until: durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : null,
          reason
        }
      });
    }
    this.addAuditLog({
      adminId,
      targetUserId,
      actionType: state === 'banned' ? 'BAN_USER' : state === 'muted' ? 'MUTE_USER' : 'UNBAN_USER',
      details: {
        reason,
        durationDays
      }
    });
  }

  // Global Search
  searchAll(query: string): { closet: ClosetItem[]; posts: Post[] } {
    const q = query.trim().toLowerCase();
    if (!q) return { closet: [], posts: [] };

    const closet = this.getClosetItems().filter(item => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.colors.some(c => c.toLowerCase().includes(q)) ||
        item.useCases.some(u => u.toLowerCase().includes(q)) ||
        item.emotionalTags.some(e => e.toLowerCase().includes(q)) ||
        (item.searchKeywords && item.searchKeywords.some(k => k.toLowerCase().includes(q)))
      );
    });

    const posts = this.getPosts().filter(p => {
      return (
        p.caption.toLowerCase().includes(q) ||
        p.authorDisplayName.toLowerCase().includes(q)
      );
    });

    return { closet, posts };
  }
}

export const dbService = new StorageService();
