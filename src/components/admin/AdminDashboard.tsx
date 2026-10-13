import React, { useState } from 'react';
import {
  Shield,
  Users,
  ShoppingBag,
  Code,
  FileText,
  Check,
  Copy,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { UserProfile, Retailer, AdminAuditLog, UserStatusState } from '../../types';
import { dbService } from '../../services/storage';
import { useTranslation } from '../../i18n';

interface AdminDashboardProps {
  currentUser: UserProfile;
  retailers: Retailer[];
  auditLogs: AdminAuditLog[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  retailers,
  auditLogs,
  onRefreshData
}) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'users' | 'retailers' | 'embed' | 'logs'>('users');

  // User moderation state
  const [targetUser, setTargetUser] = useState<UserProfile>(currentUser);
  const [userSearch, setUserSearch] = useState('');
  const [moderationReason, setModerationReason] = useState('Terms of service compliance review');
  const [muteDuration, setMuteDuration] = useState<number>(7);

  // Retailer state
  const [isRetailerModalOpen, setIsRetailerModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null);
  const [retailerName, setRetailerName] = useState('');
  const [retailerLogo, setRetailerLogo] = useState('');
  const [retailerTemplate, setRetailerTemplate] = useState('https://store.com/search?q={query}&aff={affiliateId}');
  const [retailerAffiliateId, setRetailerAffiliateId] = useState('mefe_partner');
  const [retailerPriority, setRetailerPriority] = useState(1);

  // Embed Generator State
  const [embedTitle, setEmbedTitle] = useState('Exclusive Autumn Capsule Collection');
  const [embedStoreUrl, setEmbedStoreUrl] = useState('https://www.nordstrom.com');
  const [embedButtonText, setEmbedButtonText] = useState('Shop with 15% VIP Access');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // User Moderation handlers
  const handleTogglePremium = (isPremium: boolean) => {
    dbService.toggleUserPremium(targetUser.uid, isPremium, currentUser.uid);
    setTargetUser({ ...targetUser, isPremium });
    onRefreshData();
  };

  const handleSetStatus = (statusState: UserStatusState) => {
    dbService.setUserStatus(
      targetUser.uid,
      statusState,
      moderationReason,
      currentUser.uid,
      statusState === 'muted' ? muteDuration : undefined
    );
    setTargetUser({
      ...targetUser,
      status: {
        state: statusState,
        until: statusState === 'muted' ? new Date(Date.now() + muteDuration * 86400000).toISOString() : null,
        reason: moderationReason
      }
    });
    onRefreshData();
  };

  // Retailer Save Handler
  const handleSaveRetailer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailerName.trim()) return;

    if (editingRetailer) {
      dbService.updateRetailer(editingRetailer.retailerId, {
        name: retailerName.trim(),
        logoUrl: retailerLogo.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
        searchUrlTemplate: retailerTemplate.trim(),
        affiliateId: retailerAffiliateId.trim(),
        priorityOrder: retailerPriority
      });
      dbService.addAuditLog({
        adminId: currentUser.uid,
        targetUserId: editingRetailer.retailerId,
        actionType: 'RETAILER_UPDATE',
        details: { reason: `Updated retailer ${retailerName}` }
      });
    } else {
      const created = dbService.addRetailer({
        name: retailerName.trim(),
        logoUrl: retailerLogo.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
        searchUrlTemplate: retailerTemplate.trim(),
        affiliateId: retailerAffiliateId.trim(),
        isActive: true,
        priorityOrder: retailerPriority
      });
      dbService.addAuditLog({
        adminId: currentUser.uid,
        targetUserId: created.retailerId,
        actionType: 'RETAILER_UPDATE',
        details: { reason: `Added new retailer ${retailerName}` }
      });
    }

    setIsRetailerModalOpen(false);
    setEditingRetailer(null);
    setRetailerName('');
    setRetailerLogo('');
    onRefreshData();
  };

  const handleDeleteRetailer = (id: string) => {
    if (confirm('Delete this partner retailer?')) {
      dbService.deleteRetailer(id);
      dbService.addAuditLog({
        adminId: currentUser.uid,
        targetUserId: id,
        actionType: 'RETAILER_UPDATE',
        details: { reason: `Deleted retailer ${id}` }
      });
      onRefreshData();
    }
  };

  // Generate self-contained HTML/CSS in a single continuous line (no line breaks) with target='_blank' for all CTAs
  const generateSingleLineSnippet = () => {
    const rawSnippet = `<div id="mefe-embed-promo" style="box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#FAF6F0 0%,#F3E9DF 100%);border:1px solid #E2725B;border-radius:18px;padding:20px;max-width:440px;box-shadow:0 8px 24px rgba(60,47,47,0.12);text-align:left;color:#3C2F2F;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="width:28px;height:28px;border-radius:8px;background:#E2725B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">M</div><span style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#C75842;">MEFE Verified Partner</span></div><h4 style="margin:0 0 8px 0;font-size:18px;font-weight:bold;color:#3C2F2F;">${embedTitle}</h4><p style="margin:0 0 16px 0;font-size:13px;line-height:1.5;color:#544242;">Elevate your intentional wardrobe with verified affiliate items synchronized directly with MEFE Mood Studio.</p><a href="${embedStoreUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#E2725B;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:12px 22px;border-radius:12px;box-shadow:0 4px 14px rgba(226,114,91,0.35);">${embedButtonText}</a></div>`;
    // Guarantee completely flat single continuous line without ANY line breaks
    return rawSnippet.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  };

  const handleCopySnippet = () => {
    const snippet = generateSingleLineSnippet();
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="pb-24 pt-2 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-100 text-terracotta-800 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Firebase Custom Claims
            </span>
            <span className="text-xs text-cocoa-400">admin: true verified</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-cocoa-900 tracking-tight mt-1">
            {t('adminTitle')}
          </h1>
        </div>
      </div>

      {/* Admin Tab Ribbon */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-warm-border shadow-warm-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: t('tabUsers'), icon: Users },
          { id: 'retailers', label: t('tabRetailers'), icon: ShoppingBag },
          { id: 'embed', label: t('tabEmbed'), icon: Code },
          { id: 'logs', label: t('tabLogs'), icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cocoa-600 text-white shadow-sm'
                  : 'text-cocoa-600 hover:text-cocoa-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Moderation */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-5">
          <div>
            <h3 className="font-bold text-base text-cocoa-900">User Account & Subscription Control</h3>
            <p className="text-xs text-cocoa-400">
              Manage Pro subscriptions and enforce community moderation policies
            </p>
          </div>

          {/* User Profile Card */}
          <div className="p-4 bg-warm-50 rounded-2xl border border-warm-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={targetUser.photoURL}
                alt={targetUser.displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-terracotta-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-cocoa-900">{targetUser.displayName}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      targetUser.status.state === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : targetUser.status.state === 'muted'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {targetUser.status.state}
                  </span>
                </div>
                <p className="text-xs text-cocoa-400">{targetUser.email} • UID: {targetUser.uid}</p>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTogglePremium(!targetUser.isPremium)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  targetUser.isPremium
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-warm-200 text-cocoa-700 hover:bg-warm-300'
                }`}
              >
                {targetUser.isPremium ? '★ Pro Tier Granted' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold uppercase text-cocoa-600">
              Moderation Reason & Enforcement
            </label>
            <input
              type="text"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900 focus:bg-white"
              placeholder="Reason for moderation action..."
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => handleSetStatus('active')}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
              >
                {t('unbanUser')}
              </button>
              <button
                onClick={() => handleSetStatus('muted')}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors"
              >
                {t('muteUser')} (7 Days)
              </button>
              <button
                onClick={() => handleSetStatus('banned')}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors"
              >
                {t('banUser')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Retailer Catalogs */}
      {activeTab === 'retailers' && (
        <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-warm-100">
            <div>
              <h3 className="font-bold text-base text-cocoa-900">Partner Retailer Catalog</h3>
              <p className="text-xs text-cocoa-400">
                Powers the dynamic "Shop the Look" search drawer without requiring app rebuilds
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRetailer(null);
                setRetailerName('');
                setRetailerLogo('');
                setRetailerTemplate('https://store.com/search?q={query}&aff={affiliateId}');
                setRetailerAffiliateId('mefe_partner');
                setRetailerPriority(retailers.length + 1);
                setIsRetailerModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-terracotta transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addRetailerBtn')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {retailers.map((r) => (
              <div
                key={r.retailerId}
                className="p-3.5 rounded-2xl border border-warm-border bg-warm-50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.logoUrl}
                    alt={r.name}
                    className="w-10 h-10 rounded-xl object-cover border border-warm-border"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-cocoa-900">{r.name}</h4>
                    <p className="text-[11px] text-cocoa-400 truncate max-w-xs">
                      {r.searchUrlTemplate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingRetailer(r);
                      setRetailerName(r.name);
                      setRetailerLogo(r.logoUrl);
                      setRetailerTemplate(r.searchUrlTemplate);
                      setRetailerAffiliateId(r.affiliateId);
                      setRetailerPriority(r.priorityOrder);
                      setIsRetailerModalOpen(true);
                    }}
                    className="p-2 hover:bg-warm-200 text-cocoa-600 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRetailer(r.retailerId)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Continuous Single-Line HTML/CSS Embed Generator */}
      {activeTab === 'embed' && (
        <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-cocoa-900">
              {t('embedGeneratorTitle')}
            </h3>
            <p className="text-xs text-cocoa-400 mt-1">
              {t('embedGeneratorNotice')}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Campaign / Headline Title
              </label>
              <input
                type="text"
                value={embedTitle}
                onChange={(e) => setEmbedTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Destination Store URL (CTA target='_blank')
              </label>
              <input
                type="text"
                value={embedStoreUrl}
                onChange={(e) => setEmbedStoreUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={embedButtonText}
                onChange={(e) => setEmbedButtonText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
              />
            </div>
          </div>

          {/* Generated Snippet Display */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase text-cocoa-600">
                Continuous String (Zero Line Breaks)
              </span>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1 text-xs font-bold text-terracotta-600 hover:text-terracotta-700"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? t('copied') : t('copySnippet')}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={3}
              value={generateSingleLineSnippet()}
              className="w-full p-3 font-mono text-[11px] bg-cocoa-900 text-warm-100 rounded-2xl border border-cocoa-700 select-all resize-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-warm-border shadow-warm-sm space-y-4">
          <h3 className="font-bold text-base text-cocoa-900">Immutable Administrative Audit Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.logId}
                className="p-3 rounded-2xl bg-warm-50 border border-warm-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cocoa-900 uppercase tracking-wide">
                      {log.actionType}
                    </span>
                    <span className="text-cocoa-400">Target: {log.targetUserId}</span>
                  </div>
                  <p className="text-cocoa-600 mt-0.5">{log.details.reason}</p>
                </div>
                <span className="text-[10px] text-cocoa-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Retailer Modal */}
      {isRetailerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border">
            <h3 className="font-bold text-base text-cocoa-900 mb-4">
              {editingRetailer ? 'Edit Partner Retailer' : 'Add Partner Retailer'}
            </h3>

            <form onSubmit={handleSaveRetailer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={retailerName}
                  onChange={(e) => setRetailerName(e.target.value)}
                  placeholder="e.g. Reformation"
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  value={retailerLogo}
                  onChange={(e) => setRetailerLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Search URL Template ({'{query}'} & {'{affiliateId}'})
                </label>
                <input
                  type="text"
                  required
                  value={retailerTemplate}
                  onChange={(e) => setRetailerTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Affiliate ID
                </label>
                <input
                  type="text"
                  required
                  value={retailerAffiliateId}
                  onChange={(e) => setRetailerAffiliateId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs text-cocoa-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRetailerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 font-bold text-xs text-cocoa-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
