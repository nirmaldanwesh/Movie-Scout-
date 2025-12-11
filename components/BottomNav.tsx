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
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm pb-safe z-50 border-t border-slate-800">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
              currentTab === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                    {item.badge}
                </span>
                )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};