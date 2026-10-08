import React from 'react';
import { Home, Map, Compass, Bot } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', icon: Home },
  { id: 'map', label: 'MAP', icon: Map },
  { id: 'places', label: 'PLACES', icon: Compass },
  { id: 'guide', label: 'GUIDE', icon: Bot },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 bg-[#FFFDF8]/95 backdrop-blur-xl border-t border-[#E8DFD3]/90 pb-safe shadow-lg select-none overflow-hidden box-border"
      aria-label="Bottom primary navigation"
    >
      <div className="w-full max-w-md mx-auto grid grid-cols-4 items-center h-14 sm:h-16 px-1 sm:px-2 min-w-0 box-border">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`min-h-[44px] w-full min-w-0 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer px-0.5 box-border ${
                isActive
                  ? 'text-[#651C32] font-bold'
                  : 'text-[#75666A] hover:text-[#241B1E] font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`relative flex items-center justify-center w-8 sm:w-10 h-6 sm:h-7 rounded-xl transition-all ${
                  isActive ? 'bg-[#F7F1E5] text-[#651C32]' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.4] text-[#651C32]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] leading-tight tracking-tight sm:tracking-wider mt-0.5 sm:mt-1 uppercase truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
