import { PageHeader } from "../../components/ui/UI";
import GameAddForm from "../../components/admin/GameAddForm";
import { gameApi } from '../../api_services/game_catalog/GameAPIService';


export default function GameAddPage(){

    return (
        <div>
            <PageHeader eyebrow="ADMIN" title="Game adder"/>
            <GameAddForm gameApi={gameApi}/>
        </div>
    );
}