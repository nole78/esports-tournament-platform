
export class AddPlayersDto {
    constructor(
        public teamId : number = 0,
        public userIds : number[] = []
    ) {}
}