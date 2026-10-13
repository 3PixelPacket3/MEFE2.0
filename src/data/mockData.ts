import {
  UserProfile,
  ClosetItem,
  Outfit,
  JournalEntry,
  Insight,
  Post,
  Retailer,
  AdminAuditLog
} from '../types';

export const initialUser: UserProfile = {
  uid: 'usr_me_001',
  email: 'fashionista@mefe.app',
  displayName: 'Camille Lauren',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Mindful style curator | Finding emotional freedom through conscious fashion 🌿',
  role: 'admin', // defaulted to admin so all capabilities and dashboard can be experienced immediately
  isPremium: true,
  preferredLanguage: 'en',
  status: {
    state: 'active',
    until: null,
    reason: ''
  },
  avatarConfig: {
    baseModelId: 'cher_classic',
    skinTone: '#E4B698', // Warm Ivory / Terracotta Glow
    hairStyle: 'sleek_bob',
    hairColor: '#3C2F2F', // Cocoa Espresso
    canvasScale: 1
  },
  followersCount: 1240,
  followingCount: 382,
  createdAt: '2026-01-15T09:00:00Z',
  updatedAt: '2026-10-13T12:00:00Z'
};

export const initialClosetItems: ClosetItem[] = [
  {
    itemId: 'item_001',
    userId: 'usr_me_001',
    name: 'Vintage Terracotta Blazer',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'outerwear',
    colors: ['terracotta', 'rust', 'warm orange'],
    useCases: ['work', 'presentation', 'dinner'],
    emotionalTags: ['confident', 'powerful', 'grounded'],
    wearCount: 14,
    lastWornAt: '2026-10-10T14:00:00Z',
    searchKeywords: ['blazer', 'terracotta', 'vintage', 'suit', 'workwear'],
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    itemId: 'item_002',
    userId: 'usr_me_001',
    name: 'Cocoa Ribbed Turtleneck',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'tops',
    colors: ['cocoa', 'brown', 'chocolate'],
    useCases: ['casual', 'work', 'coffee'],
    emotionalTags: ['cozy', 'calm', 'protected'],
    wearCount: 22,
    lastWornAt: '2026-10-11T09:30:00Z',
    searchKeywords: ['turtleneck', 'cocoa', 'knit', 'sweater', 'ribbed'],
    createdAt: '2026-02-05T11:00:00Z'
  },
  {
    itemId: 'item_003',
    userId: 'usr_me_001',
    name: 'Cream Wide-Leg Trousers',
    imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'bottoms',
    colors: ['cream', 'beige', 'off-white'],
    useCases: ['work', 'lunch', 'gallery'],
    emotionalTags: ['elegant', 'serene', 'empowered'],
    wearCount: 18,
    lastWornAt: '2026-10-10T14:00:00Z',
    searchKeywords: ['trousers', 'pants', 'cream', 'wide-leg', 'pleated'],
    createdAt: '2026-02-10T14:00:00Z'
  },
  {
    itemId: 'item_004',
    userId: 'usr_me_001',
    name: 'Sunset Amber Silk Slip Dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'dresses',
    colors: ['amber', 'gold', 'terracotta'],
    useCases: ['date', 'dinner', 'celebration'],
    emotionalTags: ['radiant', 'alluring', 'joyful'],
    wearCount: 8,
    lastWornAt: '2026-10-04T20:00:00Z',
    searchKeywords: ['slip dress', 'silk', 'amber', 'midi dress', 'evening'],
    createdAt: '2026-03-01T15:30:00Z'
  },
  {
    itemId: 'item_005',
    userId: 'usr_me_001',
    name: 'Rich Espresso Leather Loafers',
    imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'shoes',
    colors: ['espresso', 'cocoa', 'dark brown'],
    useCases: ['work', 'walking', 'daily'],
    emotionalTags: ['grounded', 'focused', 'sharp'],
    wearCount: 29,
    lastWornAt: '2026-10-12T08:15:00Z',
    searchKeywords: ['loafers', 'shoes', 'leather', 'brown', 'espresso'],
    createdAt: '2026-01-20T11:00:00Z'
  },
  {
    itemId: 'item_006',
    userId: 'usr_me_001',
    name: 'Gold Hammered Crescent Hoops',
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'accessories',
    colors: ['gold', 'warm metallic'],
    useCases: ['daily', 'work', 'party'],
    emotionalTags: ['expressive', 'creative', 'bright'],
    wearCount: 35,
    lastWornAt: '2026-10-12T08:15:00Z',
    searchKeywords: ['earrings', 'hoops', 'gold', 'jewelry', 'crescent'],
    createdAt: '2026-01-25T16:00:00Z'
  },
  {
    itemId: 'item_007',
    userId: 'usr_me_001',
    name: 'Rustic Terracotta Cashmere Wrap',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'outerwear',
    colors: ['terracotta', 'burnt orange'],
    useCases: ['travel', 'cozy night', 'casual'],
    emotionalTags: ['nurturing', 'calm', 'protected'],
    wearCount: 11,
    lastWornAt: '2026-10-08T18:00:00Z',
    searchKeywords: ['cashmere', 'wrap', 'shawl', 'terracotta', 'cardigan'],
    createdAt: '2026-03-12T10:00:00Z'
  },
  {
    itemId: 'item_008',
    userId: 'usr_me_001',
    name: 'High-Rise Raw Indigo Denim',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    transparentPngUrl: null,
    category: 'bottoms',
    colors: ['indigo', 'blue'],
    useCases: ['weekend', 'casual', 'travel'],
    emotionalTags: ['authentic', 'relaxed', 'approachable'],
    wearCount: 20,
    lastWornAt: '2026-10-07T12:00:00Z',
    searchKeywords: ['jeans', 'denim', 'indigo', 'high-rise', 'pants'],
    createdAt: '2026-02-18T14:00:00Z'
  }
];

export const initialOutfits: Outfit[] = [
  {
    outfitId: 'outfit_001',
    userId: 'usr_me_001',
    name: 'Executive Power Thursday',
    itemIds: ['item_001', 'item_002', 'item_003', 'item_005', 'item_006'],
    moodTarget: 'High Confidence & Clarity',
    scheduledDates: ['2026-10-15', '2026-10-22'],
    avatarCanvasState: {
      item_001: { x: 140, y: 130, zIndex: 4, scale: 1 },
      item_002: { x: 150, y: 140, zIndex: 2, scale: 0.95 },
      item_003: { x: 145, y: 270, zIndex: 3, scale: 1 },
      item_005: { x: 155, y: 440, zIndex: 1, scale: 0.8 },
      item_006: { x: 130, y: 90, zIndex: 5, scale: 0.6 }
    },
    previewImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-10T15:00:00Z'
  },
  {
    outfitId: 'outfit_002',
    userId: 'usr_me_001',
    name: 'Sunset Gallery Opening',
    itemIds: ['item_004', 'item_001', 'item_006'],
    moodTarget: 'Radiant Self-Expression',
    scheduledDates: ['2026-10-17'],
    avatarCanvasState: {
      item_004: { x: 145, y: 150, zIndex: 2, scale: 1 },
      item_001: { x: 140, y: 130, zIndex: 3, scale: 1.05 },
      item_006: { x: 130, y: 90, zIndex: 4, scale: 0.6 }
    },
    previewImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-04T12:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    outfitId: 'outfit_003',
    userId: 'usr_me_001',
    name: 'Mindful Cocoa Cozy Saturday',
    itemIds: ['item_002', 'item_008', 'item_007', 'item_005'],
    moodTarget: 'Grounded Peace & Recovery',
    scheduledDates: ['2026-10-18'],
    avatarCanvasState: {
      item_002: { x: 150, y: 140, zIndex: 2, scale: 0.95 },
      item_008: { x: 145, y: 270, zIndex: 3, scale: 1 },
      item_007: { x: 140, y: 130, zIndex: 4, scale: 1 },
      item_005: { x: 155, y: 440, zIndex: 1, scale: 0.8 }
    },
    previewImageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-07T14:30:00Z',
    updatedAt: '2026-10-07T14:30:00Z'
  }
];

export const initialJournalEntries: JournalEntry[] = [
  {
    journalId: 'jrn_001',
    userId: 'usr_me_001',
    date: '2026-10-12',
    moodScore: 9,
    emotionsLogged: ['confident', 'energized', 'purposeful'],
    outfitId: 'outfit_001',
    wornItemIds: ['item_001', 'item_002', 'item_003', 'item_005'],
    entryText: 'Keynote presentation went flawlessly! Wearing the Vintage Terracotta Blazer gave me an immediate sense of posture and grounded authority. Several colleagues complimented the warm color balance.',
    sentimentScore: 0.92,
    aiProcessed: true,
    createdAt: '2026-10-12T19:30:00Z'
  },
  {
    journalId: 'jrn_002',
    userId: 'usr_me_001',
    date: '2026-10-10',
    moodScore: 8,
    emotionsLogged: ['creative', 'radiant', 'joyful'],
    outfitId: 'outfit_002',
    wornItemIds: ['item_004', 'item_001', 'item_006'],
    entryText: 'Evening gallery vernissage. The amber silk dress paired with warm gold crescent earrings felt effortless and luminous. Felt completely in my element mingling with curators.',
    sentimentScore: 0.85,
    aiProcessed: true,
    createdAt: '2026-10-10T22:15:00Z'
  },
  {
    journalId: 'jrn_003',
    userId: 'usr_me_001',
    date: '2026-10-08',
    moodScore: 7,
    emotionsLogged: ['grounded', 'calm', 'restored'],
    outfitId: 'outfit_003',
    wornItemIds: ['item_002', 'item_008', 'item_007'],
    entryText: 'Rainy afternoon writing session at the café. The cocoa knit and cashmere wrap felt like an embrace of warmth. Lower sensory overstimulation helped me finish the draft.',
    sentimentScore: 0.74,
    aiProcessed: true,
    createdAt: '2026-10-08T17:40:00Z'
  },
  {
    journalId: 'jrn_004',
    userId: 'usr_me_001',
    date: '2026-10-05',
    moodScore: 9,
    emotionsLogged: ['empowered', 'focused', 'dynamic'],
    outfitId: 'outfit_001',
    wornItemIds: ['item_001', 'item_002', 'item_003'],
    entryText: 'Thursday strategy sprint. Again, the terracotta blazer proved its psychological anchor value. Noticeable surge in clarity whenever I wear sharp tailored blazers in earthy reds.',
    sentimentScore: 0.89,
    aiProcessed: true,
    createdAt: '2026-10-05T20:00:00Z'
  }
];

export const initialInsights: Insight = {
  insightId: 'ins_001',
  userId: 'usr_me_001',
  period: 'all_time',
  startDate: '2026-10-01',
  endDate: '2026-10-13',
  powerColor: 'Terracotta Red (#E2725B)',
  topOutfitId: 'outfit_001',
  categoryCorrelations: {
    outerwear: { 'Blazers': 8.9, 'Coats': 7.6, 'Cardigans': 7.1 },
    tops: { 'Turtlenecks': 8.2, 'Silk Shirts': 7.9, 'Tees': 6.2 },
    bottoms: { 'Wide-Leg Trousers': 8.7, 'Denim': 7.3, 'Skirts': 6.8 },
    dresses: { 'Silk Slips': 8.4, 'Knit Dresses': 7.5 }
  },
  aiNarrativeSummary: 'MEFE noticed your confidence peaks on Thursdays when wearing warm tones like your Vintage Terracotta Blazer and Amber Silks. Across 18 journal check-ins, outfits incorporating terracotta and cocoa tones generated an average mood score of 8.8/10 (compared to 6.4/10 on monochromatic black/grey days). The structural silhouette of tailored outerwear strongly correlates with emotional grounding during negotiations.',
  actionableTip: 'Schedule your Terracotta Blazer or Sunset Amber dress for upcoming high-stakes presentations or Thursday meetings to optimize natural presence and self-assurance.',
  generatedAt: '2026-10-13T10:00:00Z'
};

export const initialPosts: Post[] = [
  {
    postId: 'post_001',
    authorId: 'usr_me_001',
    authorDisplayName: 'Camille Lauren',
    authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    caption: 'Channeling pure 90s executive chic today in terracotta & cocoa. When your wardrobe aligns with your internal ambition, confidence is second nature. ✨🍂',
    outfitId: 'outfit_001',
    taggedItemCount: 4,
    likeCount: 142,
    commentCount: 18,
    createdAt: '2026-10-12T16:20:00Z',
    likes: {
      usr_me_001: { userId: 'usr_me_001', createdAt: '2026-10-12T16:21:00Z' }
    },
    comments: [
      {
        commentId: 'cmt_001',
        authorId: 'usr_friend_01',
        authorDisplayName: 'Elena Vance',
        authorPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        text: 'That terracotta tone is unbelievable on you! Total Cher Horowitz boss energy 😍',
        createdAt: '2026-10-12T17:05:00Z'
      },
      {
        commentId: 'cmt_002',
        authorId: 'usr_friend_02',
        authorDisplayName: 'Marcus Sterling',
        authorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        text: 'Impeccable tailoring. Love the combination with the cocoa turtleneck!',
        createdAt: '2026-10-12T18:14:00Z'
      }
    ]
  },
  {
    postId: 'post_002',
    authorId: 'usr_friend_01',
    authorDisplayName: 'Elena Vance',
    authorPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    caption: 'Weekend sunset walk in cozy cocoa layers. Taking a moment to breathe and reset before the work week resumes 🕊️🤎',
    outfitId: null,
    taggedItemCount: 2,
    likeCount: 98,
    commentCount: 9,
    createdAt: '2026-10-11T19:40:00Z',
    likes: {},
    comments: [
      {
        commentId: 'cmt_003',
        authorId: 'usr_me_001',
        authorDisplayName: 'Camille Lauren',
        authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        text: 'Pure peace! Earthy neutrals are the best nervous system balm.',
        createdAt: '2026-10-11T20:10:00Z'
      }
    ]
  },
  {
    postId: 'post_003',
    authorId: 'usr_friend_03',
    authorDisplayName: 'Sophie Dubois',
    authorPhotoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
    caption: 'Silk slip dresses and gold jewelry for crisp autumn evenings. Mood score today was a solid 10/10! 🥂💫',
    outfitId: null,
    taggedItemCount: 3,
    likeCount: 165,
    commentCount: 14,
    createdAt: '2026-10-09T21:10:00Z',
    likes: {},
    comments: []
  }
];

export const initialRetailers: Retailer[] = [
  {
    retailerId: 'ret_001',
    name: 'Nordstrom',
    logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
    searchUrlTemplate: 'https://www.nordstrom.com/sr?origin=keywordsearch&keyword={query}&affid={affiliateId}',
    affiliateId: 'mefe_nordstrom_partner',
    isActive: true,
    priorityOrder: 1,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    retailerId: 'ret_002',
    name: 'ASOS',
    logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=120&q=80',
    searchUrlTemplate: 'https://www.asos.com/search/?q={query}&affid={affiliateId}',
    affiliateId: 'mefe_asos_direct',
    isActive: true,
    priorityOrder: 2,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    retailerId: 'ret_003',
    name: 'Reformation',
    logoUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=120&q=80',
    searchUrlTemplate: 'https://www.thereformation.com/search?q={query}&affid={affiliateId}',
    affiliateId: 'mefe_ref_eco',
    isActive: true,
    priorityOrder: 3,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    retailerId: 'ret_004',
    name: 'Everlane',
    logoUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=120&q=80',
    searchUrlTemplate: 'https://www.everlane.com/search?q={query}&affid={affiliateId}',
    affiliateId: 'mefe_everlane_clean',
    isActive: true,
    priorityOrder: 4,
    updatedAt: '2026-10-01T00:00:00Z'
  },
  {
    retailerId: 'ret_005',
    name: 'Zara',
    logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=120&q=80',
    searchUrlTemplate: 'https://www.zara.com/search?searchTerm={query}&affid={affiliateId}',
    affiliateId: 'mefe_zara_style',
    isActive: true,
    priorityOrder: 5,
    updatedAt: '2026-10-01T00:00:00Z'
  }
];

export const initialAuditLogs: AdminAuditLog[] = [
  {
    logId: 'log_001',
    adminId: 'usr_me_001',
    targetUserId: 'usr_friend_01',
    actionType: 'SET_PREMIUM',
    details: {
      reason: 'Enrolled in Beta Pro cohort for Gemini Studio insights testing',
      priorStatus: 'free_tier'
    },
    timestamp: '2026-10-02T14:15:00Z'
  },
  {
    logId: 'log_002',
    adminId: 'usr_me_001',
    targetUserId: 'ret_001',
    actionType: 'RETAILER_UPDATE',
    details: {
      reason: 'Updated affiliate tracking query format for Nordstrom autumn catalogue'
    },
    timestamp: '2026-10-05T09:30:00Z'
  }
];
