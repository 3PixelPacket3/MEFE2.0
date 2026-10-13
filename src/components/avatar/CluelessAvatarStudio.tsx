import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Save,
  ArrowLeft,
  RotateCcw,
  Sliders,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { ClosetItem, ClothingCategory, Outfit, UserProfile } from '../../types';
import { useTranslation } from '../../i18n';
import { generateAvatarDialogue } from '../../services/gemini';
import { speechService } from '../../services/speech';

interface CluelessAvatarStudioProps {
  closetItems: ClosetItem[];
  user: UserProfile;
  onSaveOutfit: (outfit: Omit<Outfit, 'outfitId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

interface LayeredItem {
  item: ClosetItem;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export const CluelessAvatarStudio: React.FC<CluelessAvatarStudioProps> = ({
  closetItems,
  user,
  onSaveOutfit,
  onClose
}) => {
  const { t, language } = useTranslation();

  // Avatar customization
  const [skinTone, setSkinTone] = useState(user.avatarConfig.skinTone || '#E4B698');
  const [hairColor, setHairColor] = useState(user.avatarConfig.hairColor || '#3C2F2F');
  const [hairStyle, setHairStyle] = useState(user.avatarConfig.hairStyle || 'sleek_bob');

  // Active layers on avatar
  const [layeredItems, setLayeredItems] = useState<LayeredItem[]>([]);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(null);

  // Active wardrobe category tab
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('tops');

  // AI Dialogue & Audio
  const [dialogue, setDialogue] = useState<string>(
    "Welcome to the 90s Clueless Fitting Room! Tap any wardrobe item below to layer it onto your avatar. Let's create something totally iconic!"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Save outfit modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [moodTarget, setMoodTarget] = useState('High Confidence & Pure Radiance');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Avatar onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const width = 360;
    const height = 480;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#FAF6F0');
    bgGrad.addColorStop(1, '#F3E9DF');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Soft stage spotlight
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(width / 2, 450, 110, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(60, 47, 47, 0.08)';
    ctx.fill();
    ctx.restore();

    // 1. Draw Base Mannequin Body
    const centerX = width / 2;

    // Legs
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    // Left leg
    ctx.roundRect(centerX - 35, 270, 28, 175, [10, 10, 14, 14]);
    // Right leg
    ctx.roundRect(centerX + 7, 270, 28, 175, [10, 10, 14, 14]);
    ctx.fill();

    // Torso / Neck
    ctx.beginPath();
    // Neck
    ctx.roundRect(centerX - 12, 110, 24, 30, [4, 4, 0, 0]);
    // Torso hourglass
    ctx.moveTo(centerX - 42, 138);
    ctx.quadraticCurveTo(centerX - 30, 190, centerX - 36, 280);
    ctx.lineTo(centerX + 36, 280);
    ctx.quadraticCurveTo(centerX + 30, 190, centerX + 42, 138);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(centerX, 92, 30, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle face features (chic minimalist 90s aesthetic)
    ctx.fillStyle = '#3C2F2F';
    // Eyes
    ctx.beginPath();
    ctx.arc(centerX - 11, 90, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX + 11, 90, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hairColor;
    ctx.beginPath();
    ctx.moveTo(centerX - 16, 84);
    ctx.lineTo(centerX - 6, 83);
    ctx.moveTo(centerX + 6, 83);
    ctx.lineTo(centerX + 16, 84);
    ctx.stroke();

    // Lips (Terracotta kiss)
    ctx.fillStyle = '#E2725B';
    ctx.beginPath();
    ctx.ellipse(centerX, 107, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair Style
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    if (hairStyle === 'sleek_bob') {
      ctx.arc(centerX, 85, 34, Math.PI, Math.PI * 2);
      ctx.lineTo(centerX + 36, 128);
      ctx.quadraticCurveTo(centerX + 28, 132, centerX + 24, 115);
      ctx.lineTo(centerX + 20, 88);
      ctx.lineTo(centerX - 20, 88);
      ctx.lineTo(centerX - 24, 115);
      ctx.quadraticCurveTo(centerX - 28, 132, centerX - 36, 128);
      ctx.closePath();
    } else if (hairStyle === 'curly_afro') {
      ctx.arc(centerX, 82, 44, 0, Math.PI * 2);
    } else {
      // Long glamour waves
      ctx.arc(centerX, 85, 34, Math.PI, Math.PI * 2);
      ctx.lineTo(centerX + 38, 180);
      ctx.quadraticCurveTo(centerX + 26, 190, centerX + 22, 120);
      ctx.lineTo(centerX - 22, 120);
      ctx.quadraticCurveTo(centerX - 26, 190, centerX - 38, 180);
      ctx.closePath();
    }
    ctx.fill();

    // 2. Draw Layered Clothing onto Avatar
    const sortedLayers = [...layeredItems].sort((a, b) => a.zIndex - b.zIndex);
    sortedLayers.forEach((layer) => {
      ctx.save();
      ctx.translate(layer.x, layer.y);
      ctx.scale(layer.scale, layer.scale);

      // Render representative stylized fashion silhouettes on canvas
      const cat = layer.item.category;
      const isRed = layer.item.colors.some(c => c.includes('terracotta') || c.includes('red') || c.includes('rust'));
      const isBrown = layer.item.colors.some(c => c.includes('cocoa') || c.includes('brown'));
      const fillColor = isRed ? '#E2725B' : isBrown ? '#3C2F2F' : '#EAE2D8';

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = '#261D1D';
      ctx.lineWidth = 2;

      if (cat === 'tops') {
        ctx.beginPath();
        ctx.moveTo(-38, 0);
        ctx.lineTo(-24, -20);
        ctx.lineTo(24, -20);
        ctx.lineTo(38, 0);
        ctx.lineTo(34, 75);
        ctx.lineTo(-34, 75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cat === 'bottoms') {
        ctx.beginPath();
        ctx.moveTo(-36, 0);
        ctx.lineTo(36, 0);
        ctx.lineTo(44, 150);
        ctx.lineTo(6, 150);
        ctx.lineTo(0, 40);
        ctx.lineTo(-6, 150);
        ctx.lineTo(-44, 150);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cat === 'dresses') {
        ctx.beginPath();
        ctx.moveTo(-28, -25);
        ctx.lineTo(28, -25);
        ctx.lineTo(36, 40);
        ctx.lineTo(52, 180);
        ctx.lineTo(-52, 180);
        ctx.lineTo(-36, 40);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cat === 'outerwear') {
        ctx.beginPath();
        ctx.moveTo(-46, -10);
        ctx.lineTo(46, -10);
        ctx.lineTo(50, 110);
        ctx.lineTo(15, 110);
        ctx.lineTo(0, 20);
        ctx.lineTo(-15, 110);
        ctx.lineTo(-50, 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (cat === 'shoes') {
        ctx.beginPath();
        ctx.roundRect(-35, 0, 28, 16, 6);
        ctx.roundRect(7, 0, 28, 16, 6);
        ctx.fill();
        ctx.stroke();
      } else if (cat === 'accessories') {
        ctx.strokeStyle = '#D4AF37'; // Gold hoop/chain
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });

  }, [skinTone, hairColor, hairStyle, layeredItems]);

  // Handle adding an item to the avatar
  const handleToggleItem = async (item: ClosetItem) => {
    const existingIndex = layeredItems.findIndex(l => l.item.itemId === item.itemId);

    let nextLayers: LayeredItem[];
    if (existingIndex !== -1) {
      // Remove layer
      nextLayers = layeredItems.filter((_, idx) => idx !== existingIndex);
    } else {
      // Calculate sensible anchor points on the mannequin body
      let anchorY = 160;
      let zIndex = 2;
      let scale = 1;

      if (item.category === 'tops') {
        anchorY = 160;
        zIndex = 3;
      } else if (item.category === 'bottoms') {
        anchorY = 270;
        zIndex = 2;
      } else if (item.category === 'dresses') {
        anchorY = 180;
        zIndex = 4;
      } else if (item.category === 'outerwear') {
        anchorY = 165;
        zIndex = 5;
        scale = 1.05;
      } else if (item.category === 'shoes') {
        anchorY = 435;
        zIndex = 1;
      } else if (item.category === 'accessories') {
        anchorY = 115;
        zIndex = 6;
        scale = 0.8;
      }

      nextLayers = [
        ...layeredItems,
        {
          item,
          x: 180,
          y: anchorY,
          scale,
          zIndex
        }
      ];
    }

    setLayeredItems(nextLayers);

    // Trigger AI Stylist speech when clothes are combined!
    if (nextLayers.length > 0) {
      setIsAiLoading(true);
      const names = nextLayers.map(l => l.item.name);
      try {
        const aiText = await generateAvatarDialogue(names, moodTarget, user.displayName);
        setDialogue(aiText);
        // Automatically speak using Web Speech API
        handleSpeak(aiText);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleSpeak = (textToSpeak: string = dialogue) => {
    setIsSpeaking(true);
    speechService.speak(
      textToSpeak,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeech = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  const handleSaveLook = () => {
    if (layeredItems.length === 0) return;
    const canvasState: Record<string, any> = {};
    layeredItems.forEach(l => {
      canvasState[l.item.itemId] = {
        x: l.x,
        y: l.y,
        scale: l.scale,
        zIndex: l.zIndex
      };
    });

    onSaveOutfit({
      userId: user.uid,
      name: outfitName.trim() || 'Clueless 90s Ensemble #' + Math.floor(Math.random() * 100),
      itemIds: layeredItems.map(l => l.item.itemId),
      moodTarget: moodTarget.trim() || 'Empowered & Iconic',
      scheduledDates: [new Date().toISOString().split('T')[0]],
      avatarCanvasState: canvasState,
      previewImageUrl: layeredItems[0]?.item.imageUrl || null
    });

    setIsSaveModalOpen(false);
    onClose();
  };

  const categoryOptions: ClothingCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
  const rackItems = closetItems.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-warm-bg flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Studio Header Bar */}
      <header className="p-3 sm:p-4 bg-white/95 border-b border-warm-border flex items-center justify-between shadow-warm-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-warm-100 text-cocoa-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-cocoa-900 leading-tight">
              {t('avatarTitle')}
            </h2>
            <p className="text-[11px] text-terracotta-600 font-semibold">
              Cher Horowitz 90s Fitting Room • Powered by Gemini AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayeredItems([])}
            className="p-2 rounded-xl text-cocoa-400 hover:text-cocoa-700 hover:bg-warm-100 text-xs font-semibold flex items-center gap-1"
            title="Reset Outfit"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (layeredItems.length === 0) {
                alert("Layer at least one wardrobe item onto the mannequin first!");
                return;
              }
              setIsSaveModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs sm:text-sm shadow-terracotta active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t('saveAvatarLook')}</span>
          </button>
        </div>
      </header>

      {/* Main Studio Work Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Top 60% (Mobile) / Left Side (Desktop): The Stage & Speech Bubble */}
        <div className="flex-[3] relative bg-gradient-to-b from-warm-50 via-warm-100/40 to-warm-200/50 flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Mannequin Canvas Container */}
          <div className="relative shadow-warm-lg rounded-3xl overflow-hidden border-2 border-white bg-white/40 backdrop-blur-sm">
            <canvas
              ref={canvasRef}
              style={{ width: 340, height: 460 }}
              className="block cursor-grab active:cursor-grabbing"
            />

            {/* Mannequin Customization Controls Floating Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-warm-border text-[11px] font-semibold text-cocoa-700 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span>Tone:</span>
                {[
                  { name: 'Porcelain', color: '#F8E4D9' },
                  { name: 'Warm Ivory', color: '#E4B698' },
                  { name: 'Terracotta', color: '#C98565' },
                  { name: 'Rich Espresso', color: '#68402D' },
                ].map(tone => (
                  <button
                    key={tone.color}
                    onClick={() => setSkinTone(tone.color)}
                    style={{ backgroundColor: tone.color }}
                    className={`w-5 h-5 rounded-full border ${
                      skinTone === tone.color ? 'ring-2 ring-terracotta-500 scale-110' : 'border-black/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span>Hair:</span>
                {[
                  { name: 'Cocoa', color: '#3C2F2F' },
                  { name: 'Auburn', color: '#883A2D' },
                  { name: 'Honey', color: '#C68B45' },
                ].map(hair => (
                  <button
                    key={hair.color}
                    onClick={() => setHairColor(hair.color)}
                    style={{ backgroundColor: hair.color }}
                    className={`w-5 h-5 rounded-full border ${
                      hairColor === hair.color ? 'ring-2 ring-terracotta-500 scale-110' : 'border-black/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* AI Speech Bubble & Web Speech Audio Trigger */}
          <div className="w-full max-w-md mt-3 bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-warm-border shadow-warm-md flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta-100 flex items-center justify-center text-terracotta-600 flex-shrink-0">
              <Sparkles className={`w-5 h-5 ${isAiLoading ? 'animate-spin' : ''}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-terracotta-700 tracking-wide uppercase">
                  Cher AI Stylist
                </span>
                <span className="text-[10px] text-cocoa-400 font-medium">
                  Web Speech Voice
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-cocoa-800 leading-relaxed italic">
                "{dialogue}"
              </p>
            </div>

            {/* Play / Stop Speech Button */}
            <button
              onClick={() => (isSpeaking ? handleStopSpeech() : handleSpeak())}
              className={`p-2.5 rounded-2xl transition-all flex-shrink-0 ${
                isSpeaking
                  ? 'bg-cocoa-600 text-white animate-pulse'
                  : 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-terracotta'
              }`}
              title={isSpeaking ? t('stopVoice') : t('playVoice')}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bottom 40% (Mobile) / Right Side (Desktop): The Wardrobe Rack */}
        <div className="flex-[2] bg-white border-t md:border-t-0 md:border-l border-warm-border flex flex-col overflow-hidden max-h-[45vh] md:max-h-none">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-2.5 border-b border-warm-border overflow-x-auto no-scrollbar bg-warm-50/60">
            {categoryOptions.map((cat) => {
              const count = closetItems.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-cocoa-600 text-white shadow-sm'
                      : 'bg-white hover:bg-warm-100 text-cocoa-600 border border-warm-border'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {rackItems.map((item) => {
              const isLayered = layeredItems.some(l => l.item.itemId === item.itemId);
              return (
                <div
                  key={item.itemId}
                  onClick={() => handleToggleItem(item)}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-square bg-warm-50 ${
                    isLayered
                      ? 'border-terracotta-500 ring-2 ring-terracotta-500/50 shadow-terracotta'
                      : 'border-warm-border hover:border-terracotta-300'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/60 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                    <p className="text-[10px] font-bold truncate leading-tight">{item.name}</p>
                    <span className="text-[9px] text-terracotta-200 capitalize">
                      {item.emotionalTags[0]}
                    </span>
                  </div>

                  {/* Layer check indicator */}
                  {isLayered && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Look Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-warm-border">
            <h3 className="font-bold text-lg text-cocoa-900 mb-1">Name Your Clueless Outfit</h3>
            <p className="text-xs text-cocoa-400 mb-4">
              Saving {layeredItems.length} layered wardrobe pieces
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Outfit Title
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g. 90s Sunset Cher Chic"
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-sm focus:bg-white text-cocoa-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
                  Target Emotional Vibe
                </label>
                <input
                  type="text"
                  value={moodTarget}
                  onChange={(e) => setMoodTarget(e.target.value)}
                  placeholder="e.g. Major Executive Radiance"
                  className="w-full px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-sm focus:bg-white text-cocoa-900"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 font-bold text-xs text-cocoa-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLook}
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-terracotta"
                >
                  Save to Outfits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
