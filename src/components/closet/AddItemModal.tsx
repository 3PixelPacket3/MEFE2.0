import React, { useState } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ClothingCategory, ClosetItem } from '../../types';
import { useTranslation } from '../../i18n';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ClosetItem, 'itemId' | 'createdAt' | 'wearCount' | 'lastWornAt'>) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [colors, setColors] = useState<string[]>(['terracotta']);
  const [colorInput, setColorInput] = useState('');
  const [useCases, setUseCases] = useState<string[]>(['work']);
  const [emotionalTags, setEmotionalTags] = useState<string[]>(['confident']);
  const [imageUrl, setImageUrl] = useState('');
  const [transparentPngUrl, setTransparentPngUrl] = useState('');

  // Sample presets for quick demo adds
  const sampleImages = [
    { name: 'Terracotta Blazer', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', cat: 'outerwear' },
    { name: 'Cocoa Sweater', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', cat: 'tops' },
    { name: 'Amber Silk Slip', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', cat: 'dresses' },
    { name: 'Wide-Leg Pants', url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80', cat: 'bottoms' },
  ];

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, isTransparent: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (isTransparent) {
            setTransparentPngUrl(event.target.result as string);
          } else {
            setImageUrl(event.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (list: string[], setList: (val: string[]) => void, tag: string) => {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else {
      setList([...list, tag]);
    }
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim().toLowerCase())) {
      setColors([...colors, colorInput.trim().toLowerCase()]);
      setColorInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      userId: 'usr_me_001',
      name: name.trim(),
      category,
      colors: colors.length > 0 ? colors : ['terracotta'],
      useCases: useCases.length > 0 ? useCases : ['casual'],
      emotionalTags: emotionalTags.length > 0 ? emotionalTags : ['confident'],
      imageUrl: imageUrl || sampleImages[0].url,
      transparentPngUrl: transparentPngUrl || null,
      searchKeywords: [
        name.toLowerCase(),
        category,
        ...colors,
        ...useCases,
        ...emotionalTags
      ]
    });

    onClose();
  };

  const presetUseCases = ['work', 'dinner', 'casual', 'date', 'travel', 'formal'];
  const presetVibes = ['confident', 'powerful', 'grounded', 'cozy', 'radiant', 'calm', 'joyful'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-cocoa-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-warm-border">
          <h2 className="font-bold text-lg text-cocoa-900">{t('addItemTitle')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-warm-100 text-cocoa-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemNameLabel')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Terracotta Blazer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-border bg-warm-50 text-sm focus:outline-none focus:border-terracotta-500 focus:bg-white text-cocoa-900"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemCategoryLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'] as ClothingCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl capitalize transition-all border ${
                    category === cat
                      ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-terracotta'
                      : 'bg-warm-50 text-cocoa-600 border-warm-border hover:bg-warm-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload & Preset Picker */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemImageLabel')}
            </label>
            <div className="flex gap-3 items-center">
              <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-warm-border hover:border-terracotta-400 rounded-2xl cursor-pointer bg-warm-50 hover:bg-warm-100 transition-colors">
                <Upload className="w-5 h-5 text-terracotta-500 mb-1" />
                <span className="text-xs font-medium text-cocoa-600">Select file / photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, false)}
                  className="hidden"
                />
              </label>

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-2xl object-cover border border-warm-border shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-warm-100 border border-warm-border flex items-center justify-center text-cocoa-300">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>

            {/* Quick Demo Photo Presets */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-cocoa-400">Or pick preset:</span>
              <div className="flex gap-1.5 overflow-x-auto">
                {sampleImages.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(s.url);
                      if (!name) setName(s.name);
                    }}
                    className="text-[10px] px-2 py-0.5 bg-warm-100 hover:bg-warm-200 text-cocoa-700 rounded-md"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emotional Vibe Tags */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemEmotionalTagsLabel')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetVibes.map((vibe) => (
                <button
                  type="button"
                  key={vibe}
                  onClick={() => toggleTag(emotionalTags, setEmotionalTags, vibe)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    emotionalTags.includes(vibe)
                      ? 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300 shadow-sm'
                      : 'bg-warm-100 text-cocoa-600 hover:bg-warm-200'
                  }`}
                >
                  #{vibe}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion / Use Cases */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemUseCasesLabel')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetUseCases.map((useCase) => (
                <button
                  type="button"
                  key={useCase}
                  onClick={() => toggleTag(useCases, setUseCases, useCase)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                    useCases.includes(useCase)
                      ? 'bg-cocoa-600 text-white shadow-sm'
                      : 'bg-warm-100 text-cocoa-600 hover:bg-warm-200'
                  }`}
                >
                  {useCase}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-bold text-cocoa-700 uppercase mb-1">
              {t('itemColorsLabel')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
                placeholder="Type color & click add"
                className="flex-1 px-3 py-2 rounded-xl border border-warm-border bg-warm-50 text-xs focus:bg-white text-cocoa-900"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-2 bg-warm-200 hover:bg-warm-300 text-cocoa-800 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {colors.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-warm-100 text-cocoa-700 border border-warm-200"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setColors(colors.filter(col => col !== c))}
                    className="hover:text-terracotta-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-warm-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-warm-100 hover:bg-warm-200 text-cocoa-700 font-bold text-sm transition-colors"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-sm transition-all shadow-terracotta"
            >
              {t('saveItemBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
