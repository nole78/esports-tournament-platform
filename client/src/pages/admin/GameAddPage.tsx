import { PageHeader } from "../../components/ui/UI";
import GameAddForm from "../../components/admin/GameAddForm";
import { gameApi } from '../../api_services/game_catalog/GameAPIService';
import { useNavigate } from "react-router-dom";


export default function GameAddPage(){
    const navigate = useNavigate();
    return (
        <div>
            <PageHeader eyebrow="ADMIN" title="Game adder"/>
            <button onClick={() => navigate("/admin/game_catalog")}
                    className="mb-2 bg-bgsecondary/40 border-2 border-bgsecondary hover:bg-bgsecondary/30 text-bgsecondary font-semibold rounded-xl p-3 text-sm transition-colors">
            Back</button>
            <GameAddForm gameApi={gameApi}/>
        </div>
    );
}