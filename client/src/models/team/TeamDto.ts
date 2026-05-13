import { TeamRole } from '../../../../server/src/Domain/enums/TeamRole';

export type TeamDto = {
         teamId : number,
         teamName : string,
         teamTag : string,
         teamLogotip : string,
         teamDescription : string,
         userRole : TeamRole
    }
