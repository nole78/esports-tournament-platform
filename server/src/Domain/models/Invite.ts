export class Invite{
    constructor(
        public user_id : number = 0,
        public team_id : number = 0,
        public inivted_at : Date = new Date()
    ){}
};