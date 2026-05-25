import type { SideMenuItem } from "./SideMenuItem";

export interface SidebarProps {
  menuItems: SideMenuItem[];
  activeItem: string;
  onItemSelect: (item: string) => void;
}