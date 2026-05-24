import { TournamentRegistrationStatus } from "../../../Domain/enums/TournamentRegistrationStatus";

export const validateTournamentRegistration = (teamId:number, tournamentId:number) => {
    if(teamId == 0)
        return {valid:false, message:"Invalid team ID"};
    if(tournamentId == 0)
        return {valid:false, message:"Invalid tournament ID"};
    return {valid:true};
}