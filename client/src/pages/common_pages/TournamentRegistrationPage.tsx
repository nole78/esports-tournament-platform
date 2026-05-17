import { TournamentSidebar } from "../../components/SideBar/SidebarMenu";
import { useState } from "react";
import RegisteredTeams from "../../components/tournamentRegistration/RegisteredTeams";
import TournamentOverview from "../../components/tournamentRegistration/TournamentOverview";
import type { SideMenuItem } from "../../models/SideMenu/SideMenuItem";
import RegisterTeam from "../../components/tournamentRegistration/RegisterTeam";
import EyeIcon from "../../components/HeroIcons/EyeIcon";
import UserGroupIcon from "../../components/HeroIcons/UserGroupIcon";
import PlusCircleIcon from "../../components/HeroIcons/PlusCircleIcon";

export default function TournamentRegistrationPage() {
    const [activeItem, setActiveItem] = useState<string>('overview');

    const menuItems: SideMenuItem[] = [
      { id: 'overview', icon: <EyeIcon />, label: 'Overview', tooltip: 'Tournament overview' },
      { id: 'myTeams', icon: <UserGroupIcon />, label: 'Teams', tooltip: 'Registered teams' },
      { id: 'register', icon: <PlusCircleIcon />, label: 'Register team', tooltip: 'Register your team' },
    ];

    const renderContent = () => {
        switch (activeItem) {
        case 'overview':
            return <TournamentOverview />;
        case 'myTeams':
            return <RegisteredTeams />;
        case 'register':
            return <RegisterTeam />;
        default:
            return <TournamentOverview />;
        }
    };

  return (
    <div className="flex gap-0 bg-primary min-h-screen">
      {/* Sidebar */}
      <TournamentSidebar menuItems={menuItems} activeItem={activeItem} onItemSelect={setActiveItem}/>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}