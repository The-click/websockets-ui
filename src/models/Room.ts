import { Game } from "./Game";
import { User } from "./User";

export interface IRoom {
    id: string;
    user: User;
    enemy?: User;
    isOpen: boolean;
    game?: Game;
}

export class Room implements IRoom {
    id: string;
    user: User;
    enemy?: User;
    isOpen: boolean;
    game?: Game;

    constructor(user: User, id: string) {
        this.id = id;
        this.user = user;
        this.isOpen = true;
    }

    addEnemy(enemy: User) {
        this.enemy = enemy;
        this.close();
    }

    createGame() {
        if (!this.enemy) {
            return false;
        }

        this.game = new Game({
            id: this.id,
            user: this.user,
            enemy: this.enemy,
            room: this,
        });

        return this.game;
    }

    close() {
        this.isOpen = false;
    }

    getParticipants() {
        if (this.enemy) {
            return [this.user, this.enemy];
        }

        return [this.user];
    }
}
