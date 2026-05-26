import { useState } from 'react';
import type { SidebarProps } from '../../models/SideMenu/SidebarProps';
import BurgerIcon from '../heroIcons/BurgerIcon';


export function SidebarMenu({ menuItems, activeItem, onItemSelect }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`bg-linear-to-b from-primary to-primary/95 border-r border-secondary/40 flex flex-col py-6 gap-4 transition-all duration-300 ${
      isCollapsed ? 'w-13' : 'w-64'
    }`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-12 h-12 rounded-xl bg-linear-to-br from-[#f7d494] to-[#d2aa60] flex items-center justify-center mb-4 hover:shadow-lg hover:shadow-bgsecondary/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
        title={isCollapsed ? "Expand menu" : "Collapse menu"}>
        <span className={`text-xl font-bold text-secondary transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <BurgerIcon />
        </span>
      </button>

      {/* Menu Items */}
      <div className="flex flex-col gap-3 flex-1 w-full px-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`relative group w-full h-12 rounded-xl flex items-center justify-center transition-all duration-200 text-5xl
              ${activeItem === item.id 
                ? 'bg-linear-to-br  from-[#f7d494] to-[#d2aa60] text-[#41542b] shadow-lg shadow-bgsecondary/30' 
                : 'text-secondary hover:bg-white/10'
              }
            `}
            title={item.tooltip}
          >
            <div className="flex items-center gap-3 w-full px-2">
              <span className="">{item.icon}</span>
              
              <span className={`text-xs font-semibold truncate transition-all duration-300 ${
                isCollapsed ? 'hidden w-0 opacity-0' : 'visible w-auto opacity-100'
              }`}>
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
