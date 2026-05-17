import type { TournamentRegistrationStatus } from "../../types/tournament_registration/TournamentRegistrationStatus"

export type TournamentRegistrationDto = {
        teamId : number,
        teamName : string,
        teamTag : string,
        teamLogotip : string,
        tournamentId : number,
        tournamentName : string,
        seed : number,
        status : TournamentRegistrationStatus
}