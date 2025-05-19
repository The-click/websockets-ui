import { Game } from "../models/Game";

export class GameRepository {
    games: Game[];

    constructor() {
        this.games = [];
    }

    saveGame(game: Game) {
        this.games.push(game);
    }

    getById(id: Game["id"]): Game | undefined {
        return this.games.find((game) => game.id === id);
    }
}
