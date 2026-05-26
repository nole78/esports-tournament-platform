import { useState } from "react";
import UserGroupIcon from "../../components/heroIcons/UserGroupIcon";
import { SidebarMenu } from "../../components/SideBar/SidebarMenu";
import type { SideMenuItem } from "../../models/SideMenu/SideMenuItem";
import AuditLogPage from "./AuditLog";
import HealthPage from "./HealthPage";
import UsersPage from "./UsersPage";
import BulletListIcon from "../../components/heroIcons/BulletListIcon";
import ShieldCheckIcon from "../../components/heroIcons/ShieldCheckIcon";

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState<string>('users');
  
      const menuItemsAdmin: SideMenuItem[] =[
        { id: 'users', icon: <UserGroupIcon />, label: 'Users', tooltip: 'Users Dashboard' },
        { id: 'auditLog', icon: <BulletListIcon />, label: 'Audit Logs', tooltip: 'See audit logs' },
        { id: 'health', icon: <ShieldCheckIcon />, label: 'Health', tooltip: 'Check database and server health' },
      ] ;
      const renderContent = () => {
          switch (activeItem) {
          case 'users':
              return <UsersPage />;
          case 'auditLog':
              return <AuditLogPage />;
          case 'health':
              return <HealthPage />;
          default:
              return <UsersPage />;
          }
      };
  
    return (
      <div className="flex gap-0 bg-primary min-h-screen">
        {/* Sidebar */}
        <SidebarMenu menuItems={menuItemsAdmin} activeItem={activeItem} onItemSelect={setActiveItem}/>
  
        {/* Content Area */}
        <div className="flex-1">
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    );
}
