import { useState } from "react";
import RegisteredTeams from "../../components/tournamentRegistration/RegisteredTeams";
import TournamentOverview from "../../components/tournamentRegistration/TournamentOverview";
import type { SideMenuItem } from "../../models/SideMenu/SideMenuItem";
import RegisterTeam from "../../components/tournamentRegistration/RegisterTeam";
import EyeIcon from "../../components/heroIcons/EyeIcon";
import UserGroupIcon from "../../components/heroIcons/UserGroupIcon";
import UserPlusIcon from "../../components/heroIcons/UserPlusIcon";
import WrenchScrewdriverIcon from "../../components/heroIcons/WrenchScrewdriverIcon";
import { useAuth } from "../../hooks/auth/useAuthHook";
import PendingTeams from "../../components/tournamentRegistration/PendingTeams";
import Settings from '../../components/tournamentRegistration/Settings';
import { SidebarMenu } from "../../components/SideBar/SidebarMenu";
import PencilSquareIcon from "../../components/heroIcons/PencilSquareIcon";

export default function TournamentRegistrationPage() {
    const { user } = useAuth();
    const [activeItem, setActiveItem] = useState<string>('overview');

    const menuItems: SideMenuItem[] = [
      { id: 'overview', icon: <EyeIcon />, label: 'Overview', tooltip: 'Tournament overview' },
      { id: 'myTeams', icon: <UserGroupIcon />, label: 'Teams', tooltip: 'Registered teams' },
      { id: 'register', icon: <PencilSquareIcon />, label: 'Register/Remove team', tooltip: 'Register/Remove your team' },
    ];
    const menuItemsAdmin: SideMenuItem[] =[
      { id: 'overview', icon: <EyeIcon />, label: 'Overview', tooltip: 'Tournament overview' },
      { id: 'myTeams', icon: <UserGroupIcon />, label: 'Teams', tooltip: 'Registered teams' },
      { id: 'register', icon: <PencilSquareIcon />, label: 'Register/Remove team', tooltip: 'Register/Remove your team' },
      { id: 'pendingTeams', icon: <UserPlusIcon />, label: 'Pending teams', tooltip: 'Accept teams into tournament'},
      { id: 'settings', icon: <WrenchScrewdriverIcon />, label: 'Tournament settings', tooltip: 'Setting for your tournament'},
    ] ;
    const renderContent = () => {
        switch (activeItem) {
        case 'overview':
            return <TournamentOverview />;
        case 'myTeams':
            return <RegisteredTeams />;
        case 'register':
            return <RegisterTeam />;
        case 'pendingTeams':
            return <PendingTeams />;
        case 'settings':
            return <Settings />;
        default:
            return <TournamentOverview />;
        }
    };

  return (
    <div className="flex gap-0 bg-primary min-h-screen">
      {/* Sidebar */}
      <SidebarMenu menuItems={user?.role == "admin" ? menuItemsAdmin : menuItems} activeItem={activeItem} onItemSelect={setActiveItem}/>

      {/* Content Area */}
      <div className="flex-1">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}