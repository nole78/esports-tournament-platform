
//import { teamApi } from '../../api_services/teams/TeamAPIService';

import { teamApi } from '../../api_services/teams/TeamAPIService';
import TeamsAddForm from '../user_forms/TeamsAddForm';


export default function TeamsAddPage(){
    return (
        <main className="min-h-screen bg-primary flex items-center justify-center px-4">
                    <TeamsAddForm teamApi={teamApi}/>
        </main>
    );
}