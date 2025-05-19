import { RoomService, roomService } from "./RoomService";

import { GameRepository } from "../repository/GameRepository";
import { Game } from "../models/Game";
import { Room } from "../models/Room";

export enum gameServiceError {
    GAME_NOT_FOUND = "The room was not found",
}

export class GameService {
    static instance: GameService;
    gameRepository!: GameRepository;
    roomService!: RoomService;

    constructor() {
        if (GameService.instance) {
            return GameService.instance;
        }

        this.gameRepository = new GameRepository();
        this.roomService = roomService;
        GameService.instance = this;
    }

    getById(id: Game["id"]): Game {
        const game = this.gameRepository.getById(id);

        if (!game) {
            throw new Error(gameServiceError.GAME_NOT_FOUND);
        }

        return game;
    }

    createGame(roomId: Room["id"]): Game {
        const game = this.roomService.createGame(roomId);
        this.gameRepository.saveGame(game);

        return game;
    }
}

export const gameService = new GameService();
