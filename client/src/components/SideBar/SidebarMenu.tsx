import type { SideMenuItem } from '../../models/SideMenu/SideMenuItem';
import { useState } from 'react';


interface SidebarProps {
  menuItems: SideMenuItem[];
  activeItem: string;
  onItemSelect: (item: string) => void;
}

export function TournamentSidebar({ menuItems, activeItem, onItemSelect }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="w-20 bg-linear-to-b from-primary to-primary/95 border-r border-secondary/40 flex flex-col items-center py-6 gap-4">
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 hover:shadow-lg hover:shadow-blue-400/20 transition-all cursor-pointer">
        <span className="text-xl font-bold text-white">T</span>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-3 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 text-2xl
              ${activeItem === item.id 
                ? 'bg-linear-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-400/30' 
                : 'text-white/50 hover:text-white hover:bg-white/10'
              }
            `}
            title={item.tooltip}
          >
            {item.icon}
            
            {/* Tooltip */}
            {hoveredItem === item.id && (
              <div className="absolute left-16 bg-secondary/95 text-white/90 text-xs px-3 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
