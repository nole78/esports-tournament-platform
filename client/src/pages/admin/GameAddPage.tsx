import GameAddForm from "../../components/admin/GameAddForm";
import { gameApi } from '../../api_services/game_catalog/GameAPIService';



export default function GameAddPage(){
    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
            <GameAddForm gameApi={gameApi}/>
        </div>
    );
}