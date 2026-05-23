import type { ReactNode } from "react";

export interface SideMenuItem {
  id: string;
  icon: ReactNode;
  label: string;
  tooltip: string;
}