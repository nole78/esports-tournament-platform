import { PageHeader } from "../../components/ui/UI";
import TournamentAddForm from "../../components/admin/TournamentAddForm";
import { tournamentApi } from '../../api_services/tournament_list/TournamentAPIService';
import { gameApi } from '../../api_services/game_catalog/GameAPIService';
import { useNavigate } from "react-router-dom";

export default function TournamentAddPage(){
    const navigate = useNavigate();
    return (
        <div>
            <PageHeader eyebrow="ADMIN" title="Tournament adder"/>
            <button onClick={() => navigate("/admin/tournament_list")}
                    className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
            Back</button>
            <TournamentAddForm tournamentApi={tournamentApi} gameApi={gameApi}/>
        </div>
    );
}