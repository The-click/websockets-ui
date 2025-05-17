import { User } from "./User";

export interface IRoom {
    id: string;
    user: User;
    enemy?: User;
}

export class Room implements IRoom {
    id: string;
    user: User;
    enemy?: User;

    constructor(user: User, id: string) {
        this.id = id;
        this.user = user;
    }

    addEnemy(enemy: User) {
        this.enemy = enemy;
    }
}
