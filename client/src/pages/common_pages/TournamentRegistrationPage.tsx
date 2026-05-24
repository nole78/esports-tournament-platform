import { TournamentSidebar } from "../../components/SideBar/SidebarMenu";
import { useState } from "react";
import RegisteredTeams from "../../components/tournamentRegistration/RegisteredTeams";
import TournamentOverview from "../../components/tournamentRegistration/TournamentOverview";
import type { SideMenuItem } from "../../models/SideMenu/SideMenuItem";
import RegisterTeam from "../../components/tournamentRegistration/RegisterTeam";
import EyeIcon from "../../components/HeroIcons/EyeIcon";
import UserGroupIcon from "../../components/HeroIcons/UserGroupIcon";
import PlusCircleIcon from "../../components/HeroIcons/PlusCircleIcon";
import UserPlusIcon from "../../components/HeroIcons/UserPlusIcon";
import WrenchScrewdriverIcon from "../../components/HeroIcons/WrenchScrewdriverIcon";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { UserRole } from '../../../../server/src/Domain/enums/UserRole';
import PendingTeams from "../../components/tournamentRegistration/PendingTeams";
import Settings from '../../components/tournamentRegistration/Settings';

export default function TournamentRegistrationPage() {
    const { user } = useAuth();
    const [activeItem, setActiveItem] = useState<string>('overview');

    const menuItems: SideMenuItem[] = [
      { id: 'overview', icon: <EyeIcon />, label: 'Overview', tooltip: 'Tournament overview' },
      { id: 'myTeams', icon: <UserGroupIcon />, label: 'Teams', tooltip: 'Registered teams' },
      { id: 'register', icon: <PlusCircleIcon />, label: 'Register team', tooltip: 'Register your team' },
    ];
    const menuItemsAdmin: SideMenuItem[] =[
      { id: 'overview', icon: <EyeIcon />, label: 'Overview', tooltip: 'Tournament overview' },
      { id: 'myTeams', icon: <UserGroupIcon />, label: 'Teams', tooltip: 'Registered teams' },
      { id: 'register', icon: <PlusCircleIcon />, label: 'Register team', tooltip: 'Register your team' },
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
      <TournamentSidebar menuItems={user?.role == UserRole.ADMIN ? menuItemsAdmin : menuItems} activeItem={activeItem} onItemSelect={setActiveItem}/>

      {/* Content Area */}
      <div className="flex-1">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}