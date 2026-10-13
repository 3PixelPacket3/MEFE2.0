import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Check, X, Sparkles } from 'lucide-react';
import { Outfit } from '../../types';
import { useTranslation } from '../../i18n';

interface OutfitCalendarProps {
  outfits: Outfit[];
  onScheduleOutfit: (outfitId: string, date: string) => void;
}

export const OutfitCalendar: React.FC<OutfitCalendarProps> = ({
  outfits,
  onScheduleOutfit,
}) => {
  const { t } = useTranslation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const scheduledOutfits = outfits.filter(o => o.scheduledDates.includes(formattedDate));
    return {
      dayNum,
      dateStr: formattedDate,
      isToday: formattedDate === todayStr,
      scheduledOutfits
    };
  });

  const handleDayClick = (dateStr: string) => {
    setSelectedDayString(dateStr);
    setIsDayDrawerOpen(true);
  };

  const activeDayScheduled = selectedDayString
    ? outfits.filter(o => o.scheduledDates.includes(selectedDayString))
    : [];

  return (
    <div className="bg-white rounded-3xl p-5 border border-warm-border shadow-warm-sm space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-warm-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-terracotta-500" />
          <h2 className="font-display font-bold text-lg text-cocoa-900 capitalize">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl hover:bg-warm-100 text-cocoa-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-2.5 py-1 rounded-xl bg-warm-100 hover:bg-warm-200 text-cocoa-700 font-bold"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl hover:bg-warm-100 text-cocoa-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-cocoa-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Empty padding days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[84px] bg-warm-50/40 rounded-2xl" />
        ))}

        {/* Month days */}
        {daysArray.map((day) => (
          <div
            key={day.dateStr}
            onClick={() => handleDayClick(day.dateStr)}
            className={`min-h-[64px] sm:min-h-[84px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              day.isToday
                ? 'bg-terracotta-50/60 border-terracotta-400 ring-2 ring-terracotta-400/30'
                : day.scheduledOutfits.length > 0
                ? 'bg-warm-50 border-warm-border hover:border-terracotta-300'
                : 'bg-white border-warm-100 hover:bg-warm-50/50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-xs font-bold ${
                  day.isToday
                    ? 'w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center'
                    : 'text-cocoa-800'
                }`}
              >
                {day.dayNum}
              </span>
              {day.scheduledOutfits.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-terracotta-500" />
              )}
            </div>

            {/* Scheduled Outfit Mini-pill */}
            {day.scheduledOutfits.length > 0 ? (
              <div className="mt-1">
                <div className="bg-cocoa-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-lg truncate leading-tight shadow-sm">
                  {day.scheduledOutfits[0].name}
                </div>
              </div>
            ) : (
              <div className="h-3" />
            )}
          </div>
        ))}
      </div>

      {/* Day Drawer to Assign / View Outfits */}
      {isDayDrawerOpen && selectedDayString && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-cocoa-900/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-warm-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <div>
                <h3 className="font-bold text-base text-cocoa-900">
                  Wardrobe Calendar: {selectedDayString}
                </h3>
                <p className="text-xs text-cocoa-400">
                  {activeDayScheduled.length} outfits planned for this day
                </p>
              </div>
              <button
                onClick={() => setIsDayDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-warm-100 text-cocoa-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Scheduled Outfits */}
            <div className="py-4 space-y-2">
              <p className="text-xs font-bold uppercase text-cocoa-500">Planned for Today</p>
              {activeDayScheduled.length > 0 ? (
                activeDayScheduled.map(outfit => (
                  <div
                    key={outfit.outfitId}
                    className="p-3 bg-terracotta-50 rounded-2xl border border-terracotta-200 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-cocoa-900">{outfit.name}</h4>
                      <p className="text-[11px] text-terracotta-700">Vibe: {outfit.moodTarget}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-terracotta-500 text-white rounded-full">
                      Scheduled
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-cocoa-400 italic">No outfit assigned to this date yet.</p>
              )}
            </div>

            {/* Assign another saved outfit */}
            <div className="pt-2 border-t border-warm-border">
              <p className="text-xs font-bold uppercase text-cocoa-500 mb-2">
                Assign Saved Outfit to {selectedDayString}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {outfits.map(outfit => {
                  const isAssigned = outfit.scheduledDates.includes(selectedDayString);
                  return (
                    <button
                      key={outfit.outfitId}
                      onClick={() => {
                        onScheduleOutfit(outfit.outfitId, selectedDayString);
                        setIsDayDrawerOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                        isAssigned
                          ? 'bg-warm-100 border-warm-border text-cocoa-400'
                          : 'bg-warm-50 hover:bg-warm-100 border-warm-border text-cocoa-800'
                      }`}
                    >
                      <span>{outfit.name} ({outfit.moodTarget})</span>
                      {isAssigned ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Plus className="w-4 h-4 text-terracotta-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
