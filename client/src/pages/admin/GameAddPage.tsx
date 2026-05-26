import GameAddForm from "../../components/admin/GameAddForm";
import { gameApi } from '../../api_services/game_catalog/GameAPIService';


export default function GameAddPage(){

    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4 relative">
            <GameAddForm gameApi={gameApi}/>
        </main>
    );
}