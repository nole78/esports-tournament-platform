import { AddPlayerErrorDto } from './AddPlayerErrorDto';
import { MatchPlayerDto } from './MatchPlayerDto';

export class AddPlayersResponseDto{
    constructor(
        public addedPlayers : MatchPlayerDto[] = [],
        public failedPlayers : AddPlayerErrorDto[] = []
    ) {}
}