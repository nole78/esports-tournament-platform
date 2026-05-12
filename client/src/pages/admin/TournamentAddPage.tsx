import TournamentAddForm from "../../components/admin/TournamentAddForm";
import { tournamentApi } from '../../api_services/tournament_list/TournamentAPIService';
import { gameApi } from '../../api_services/game_catalog/GameAPIService';

export default function TournamentAddPage(){
    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4">
            <TournamentAddForm tournamentApi={tournamentApi} gameApi={gameApi}/>
        </main>
    );
}