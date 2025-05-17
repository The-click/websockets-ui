export interface IUser {
    id: string;
    name: string;
    password: string;
    wins: number;
}

export class User implements IUser {
    private _id: string;
    name: string;
    password: string;
    wins: number;

    constructor(user: IUser) {
        this._id = user.id;
        this.name = user.name;
        this.password = user.password;
        this.wins = 0;
    }

    get id(): IUser["id"] {
        return this._id;
    }

    set id(id: IUser["id"]) {
        this._id = id;
    }

    udateWins(newValue: IUser["wins"]) {
        this.wins = newValue;
    }
}
