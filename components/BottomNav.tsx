import React from 'react';
import { Tab } from '../types';
import { Flame, Tv, Bookmark } from 'lucide-react';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  watchlistCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, watchlistCount }) => {
  const navItems = [
    { id: 'hits' as Tab, label: 'Hits', icon: <Flame className="w-6 h-6" /> },
    { id: 'ott' as Tab, label: 'Fresh OTT', icon: <Tv className="w-6 h-6" /> },
    { id: 'watchlist' as Tab, label: 'Watchlist', icon: <Bookmark className="w-6 h-6" />, badge: watchlistCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              currentTab === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-2 right-8 sm:right-12 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};