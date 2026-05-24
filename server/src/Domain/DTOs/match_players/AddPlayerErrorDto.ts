
export class AddPlayerErrorDto {
    constructor(
        public userId: number = 0,
        public reason: string = ""
    ) {}
}