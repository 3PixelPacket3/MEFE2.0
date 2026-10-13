import React, { useState, useEffect } from 'react';
import { I18nProvider } from './i18n';
import {
  UserProfile,
  ClosetItem,
  Outfit,
  JournalEntry,
  Post,
  Retailer,
  AdminAuditLog,
  ActiveTab,
  MenuSubView
} from './types';
import { dbService } from './services/storage';
import { authService } from './services/auth';

// Layout Components
import { TopNav } from './components/layout/TopNav';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { RetailerDrawer } from './components/layout/RetailerDrawer';

// Screens
import { ClosetScreen } from './components/closet/ClosetScreen';
import { OutfitsScreen } from './components/outfits/OutfitsScreen';
import { ThreeAvatarStudio } from './components/avatar/ThreeAvatarStudio';
import { JournalScreen } from './components/journal/JournalScreen';
import { InsightsScreen } from './components/insights/InsightsScreen';
import { SocialFeedScreen } from './components/social/SocialFeedScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MenuScreen } from './components/menu/MenuScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User-Isolated Database States
  const [closetItems, setClosetItems] = useState<ClosetItem[]>(() => dbService.getClosetItems(currentUser?.uid));
  const [outfits, setOutfits] = useState<Outfit[]>(() => dbService.getOutfits(currentUser?.uid));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => dbService.getJournalEntries(currentUser?.uid));
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

  // Reload data for current user
  const reloadUserData = (uid?: string) => {
    const targetUid = uid || currentUser?.uid;
    setClosetItems(dbService.getClosetItems(targetUid));
    setOutfits(dbService.getOutfits(targetUid));
    setJournalEntries(dbService.getJournalEntries(targetUid));
    setPosts(dbService.getPosts());
    setRetailers(dbService.getRetailers());
    setAuditLogs(dbService.getAuditLogs());
  };

  useEffect(() => {
    reloadUserData(currentUser?.uid);
  }, [currentUser?.uid]);

  // Auth Handlers
  const handleUserChange = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    reloadUserData(newUser.uid);
  };

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Closet Actions
  const handleAddClosetItem = (itemData: Omit<ClosetItem, 'itemId' | 'createdAt' | 'wearCount' | 'lastWornAt'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.addClosetItem({ ...itemData, userId: currentUser.uid });
    reloadUserData();
  };

  const handleDeleteClosetItem = (itemId: string) => {
    dbService.deleteClosetItem(itemId);
    reloadUserData();
  };

  // Outfit Actions
  const handleSaveOutfit = (outfitData: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.addOutfit({ ...outfitData, userId: currentUser.uid });
    reloadUserData();
  };

  const handleScheduleOutfit = (outfitId: string, date: string) => {
    dbService.scheduleOutfitDate(outfitId, date);
    reloadUserData();
  };

  // Journal Actions
  const handleAddJournalEntry = (entryData: Omit<JournalEntry, 'journalId' | 'createdAt'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.addJournalEntry({ ...entryData, userId: currentUser.uid });
    reloadUserData();
  };

  // Social Feed Actions
  const handleToggleLike = (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.toggleLikePost(postId, currentUser.uid);
    setPosts(dbService.getPosts());
  };

  const handleAddComment = (postId: string, text: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.addCommentToPost(postId, {
      authorId: currentUser.uid,
      authorDisplayName: currentUser.displayName,
      authorPhotoURL: currentUser.photoURL,
      text
    });
    setPosts(dbService.getPosts());
  };

  const handleAddPost = (postData: Omit<Post, 'postId' | 'likeCount' | 'commentCount' | 'createdAt' | 'likes' | 'comments'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    dbService.addPost(postData);
    setPosts(dbService.getPosts());
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
            journals={journalEntries}
            closetItems={closetItems}
            outfits={outfits}
            onOpenOutfits={() => handleTabChange('outfits', null)}
          />
        );
      }
      if (menuSubView === 'avatar') {
        return (
          <ThreeAvatarStudio
            closetItems={closetItems}
            user={currentUser || authService.getAllUsers()[0]}
            onSaveOutfit={handleSaveOutfit}
            onClose={() => setMenuSubView(null)}
          />
        );
      }
      if (menuSubView === 'admin' && currentUser?.role === 'admin') {
        return (
          <AdminDashboard
            currentUser={currentUser}
            retailers={retailers}
            auditLogs={auditLogs}
            onRefreshData={() => reloadUserData()}
          />
        );
      }
    }

    switch (activeTab) {
      case 'social':
        return (
          <SocialFeedScreen
            posts={posts}
            user={currentUser || authService.getAllUsers()[0]}
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
            user={currentUser || authService.getAllUsers()[0]}
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
            user={currentUser}
            onSelectSubView={(sub) => setMenuSubView(sub)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRetailers={() => handleOpenRetailerDrawer('terracotta blazer')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSignOut={handleSignOut}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg text-cocoa-900 flex flex-col md:flex-row antialiased">
      {/* Desktop Left-sided Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        menuSubView={menuSubView}
        user={currentUser}
        onTabChange={handleTabChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Central Application Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Shell: Top Bar with Sign In / Switch User */}
        <TopNav
          user={currentUser}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
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
        user={currentUser}
        onUpdateUser={(updates) => {
          const updated = authService.updateProfile(updates);
          if (updated) setCurrentUser(updated);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Auth & Switch User Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={handleUserChange}
        currentUser={currentUser}
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
