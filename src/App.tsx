import React, { useState, useEffect } from 'react';
import { I18nProvider, useTranslation } from './i18n';
import {
  UserProfile,
  ClosetItem,
  Outfit,
  JournalEntry,
  Insight,
  Post,
  Retailer,
  AdminAuditLog,
  ActiveTab,
  MenuSubView
} from './types';
import { dbService } from './services/storage';

// Layout Components
import { TopNav } from './components/layout/TopNav';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { RetailerDrawer } from './components/layout/RetailerDrawer';

// Screens
import { ClosetScreen } from './components/closet/ClosetScreen';
import { OutfitsScreen } from './components/outfits/OutfitsScreen';
import { CluelessAvatarStudio } from './components/avatar/CluelessAvatarStudio';
import { JournalScreen } from './components/journal/JournalScreen';
import { InsightsScreen } from './components/insights/InsightsScreen';
import { SocialFeedScreen } from './components/social/SocialFeedScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuScreen } from './components/menu/MenuScreen';
import { SettingsModal } from './components/settings/SettingsModal';

const AppContent: React.FC = () => {
  // Database States
  const [user, setUser] = useState<UserProfile>(() => dbService.getUser());
  const [closetItems, setClosetItems] = useState<ClosetItem[]>(() => dbService.getClosetItems());
  const [outfits, setOutfits] = useState<Outfit[]>(() => dbService.getOutfits());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => dbService.getJournalEntries());
  const [insights, setInsights] = useState<Insight>(() => dbService.getInsights());
  const [posts, setPosts] = useState<Post[]>(() => dbService.getPosts());
  const [retailers, setRetailers] = useState<Retailer[]>(() => dbService.getRetailers());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => dbService.getAuditLogs());

  // Navigation States
  const [activeTab, setActiveTab] = useState<ActiveTab>('social');
  const [menuSubView, setMenuSubView] = useState<MenuSubView>(null);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRetailerDrawerOpen, setIsRetailerDrawerOpen] = useState(false);
  const [retailerDrawerQuery, setRetailerDrawerQuery] = useState('terracotta blazer');
  const [selectedItemForView, setSelectedItemForView] = useState<ClosetItem | null>(null);

  const refreshAllData = () => {
    setUser(dbService.getUser());
    setClosetItems(dbService.getClosetItems());
    setOutfits(dbService.getOutfits());
    setJournalEntries(dbService.getJournalEntries());
    setInsights(dbService.getInsights());
    setPosts(dbService.getPosts());
    setRetailers(dbService.getRetailers());
    setAuditLogs(dbService.getAuditLogs());
  };

  // Closet Actions
  const handleAddClosetItem = (itemData: Omit<ClosetItem, 'itemId' | 'createdAt' | 'wearCount' | 'lastWornAt'>) => {
    dbService.addClosetItem(itemData);
    refreshAllData();
  };

  const handleDeleteClosetItem = (itemId: string) => {
    dbService.deleteClosetItem(itemId);
    refreshAllData();
  };

  // Outfit Actions
  const handleSaveOutfit = (outfitData: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => {
    dbService.addOutfit(outfitData);
    refreshAllData();
  };

  const handleScheduleOutfit = (outfitId: string, date: string) => {
    dbService.scheduleOutfitDate(outfitId, date);
    refreshAllData();
  };

  // Journal Actions
  const handleAddJournalEntry = (entryData: Omit<JournalEntry, 'journalId' | 'createdAt'>) => {
    dbService.addJournalEntry(entryData);
    refreshAllData();
  };

  // Social Feed Actions
  const handleToggleLike = (postId: string) => {
    dbService.toggleLikePost(postId, user.uid);
    refreshAllData();
  };

  const handleAddComment = (postId: string, text: string) => {
    dbService.addCommentToPost(postId, {
      authorId: user.uid,
      authorDisplayName: user.displayName,
      authorPhotoURL: user.photoURL,
      text
    });
    refreshAllData();
  };

  const handleAddPost = (postData: Omit<Post, 'postId' | 'likeCount' | 'commentCount' | 'createdAt' | 'likes' | 'comments'>) => {
    dbService.addPost(postData);
    refreshAllData();
  };

  // Retailer Drawer Trigger
  const handleOpenRetailerDrawer = (query?: string) => {
    if (query) setRetailerDrawerQuery(query);
    setIsRetailerDrawerOpen(true);
  };

  // Navigation change handler
  const handleTabChange = (tab: ActiveTab, subView: MenuSubView = null) => {
    setActiveTab(tab);
    setMenuSubView(subView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current screen content
  const renderCurrentView = () => {
    // If a menu subview is active (either from desktop sidebar or mobile menu)
    if (activeTab === 'menu' && menuSubView) {
      if (menuSubView === 'insights') {
        return (
          <InsightsScreen
            insight={insights}
            journals={journalEntries}
            closetItems={closetItems}
            outfits={outfits}
            onSaveInsight={(fresh) => {
              dbService.saveInsights(fresh);
              refreshAllData();
            }}
            onOpenOutfits={() => handleTabChange('outfits', null)}
          />
        );
      }
      if (menuSubView === 'avatar') {
        return (
          <CluelessAvatarStudio
            closetItems={closetItems}
            user={user}
            onSaveOutfit={handleSaveOutfit}
            onClose={() => setMenuSubView(null)}
          />
        );
      }
      if (menuSubView === 'admin' && user.role === 'admin') {
        return (
          <AdminDashboard
            currentUser={user}
            retailers={retailers}
            auditLogs={auditLogs}
            onRefreshData={refreshAllData}
          />
        );
      }
    }

    switch (activeTab) {
      case 'social':
        return (
          <SocialFeedScreen
            posts={posts}
            user={user}
            closetItems={closetItems}
            outfits={outfits}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onAddPost={handleAddPost}
            onShopThisLook={handleOpenRetailerDrawer}
          />
        );
      case 'closet':
        return (
          <ClosetScreen
            items={closetItems}
            onAddItem={handleAddClosetItem}
            onDeleteItem={handleDeleteClosetItem}
            onShopSimilar={handleOpenRetailerDrawer}
            selectedItemForView={selectedItemForView}
            onClearSelectedItem={() => setSelectedItemForView(null)}
          />
        );
      case 'outfits':
        return (
          <OutfitsScreen
            closetItems={closetItems}
            outfits={outfits}
            user={user}
            onSaveOutfit={handleSaveOutfit}
            onScheduleOutfit={handleScheduleOutfit}
          />
        );
      case 'journal':
        return (
          <JournalScreen
            journalEntries={journalEntries}
            closetItems={closetItems}
            outfits={outfits}
            onAddJournalEntry={handleAddJournalEntry}
          />
        );
      case 'menu':
        return (
          <MenuScreen
            user={user}
            onSelectSubView={(sub) => setMenuSubView(sub)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRetailers={() => handleOpenRetailerDrawer('terracotta blazer')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg text-cocoa-900 flex flex-col md:flex-row antialiased">
      {/* Desktop Left-sided Sidebar (Facebook/Twitter architecture) */}
      <DesktopSidebar
        activeTab={activeTab}
        menuSubView={menuSubView}
        user={user}
        onTabChange={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Central Application Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Shell: Top Bar */}
        <TopNav
          user={user}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectItem={(item) => {
            setSelectedItemForView(item);
            handleTabChange('closet', null);
          }}
          onOpenRetailers={handleOpenRetailerDrawer}
        />

        {/* Constrained Single-Column Feed Layout */}
        <main className="flex-1 w-full max-w-2xl lg:max-w-3xl mx-auto px-3 sm:px-6 pt-4">
          {renderCurrentView()}
        </main>

        {/* Mobile Bottom Navigation Bar (5 Sticky Icons) */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => handleTabChange(tab, null)}
        />
      </div>

      {/* Slide-out Retailer Drawer */}
      <RetailerDrawer
        isOpen={isRetailerDrawerOpen}
        onClose={() => setIsRetailerDrawerOpen(false)}
        initialQuery={retailerDrawerQuery}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onUpdateUser={(updates) => {
          const updated = dbService.updateUserProfile(updates);
          setUser(updated);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
