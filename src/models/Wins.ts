import { IUser } from "./User";

export interface IWins {
    name: string;
    wins: number;
}

export class Wins implements IWins {
    name: string;
    wins: number;

    constructor(user: IUser) {
        this.name = user.name;
        this.wins = user.wins;
    }

    udateWins(newValue: IWins["wins"]) {
        this.wins = newValue;
    }
}
