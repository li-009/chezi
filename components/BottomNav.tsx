
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'lobby', label: '大厅', icon: 'dashboard' },
    { id: 'community', label: '社区', icon: 'groups' },
    { id: 'store', label: '商城', icon: 'shopping_bag' },
    { id: 'profile', label: '个人', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-0 flex justify-center pointer-events-none">
      <div className="glass-panel rounded-xl px-6 py-3 flex justify-between items-center w-full max-w-sm pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-xl bg-black/80 ring-1 ring-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-1 transition-all duration-300 group ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            {activeTab === tab.id && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            )}
            <span className={`material-symbols-outlined text-[26px] transition-transform duration-300 ${activeTab === tab.id ? 'fill-icon -translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'group-hover:scale-110'}`}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'opacity-100 text-white' : 'opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
