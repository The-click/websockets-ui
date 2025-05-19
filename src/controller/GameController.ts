import {
    ConnectionService,
    connectionService,
} from "./../service/ConnectionSerivce";
import { RoomService, roomService } from "../service/RoomService";
import { BaseController } from "./BaseController";
import { Room } from "../models/Room";
import { WebSocket } from "ws";
import { gameService, GameService } from "../service/GameService";
import { Game } from "../models/Game";

export enum gameControllerError {
    USER_NOT_FOUND = "User not found",
    GAME_NOT_FOUND = "Game not found",
    ROOM_NOT_FOUND = "Room not found",
    CONNECTION_NOT_FOUND = "Connection not found",
    OTHER_PLAYER_MOVE = "The other player's move",
}

export class GameController extends BaseController {
    gameService: GameService;
    connectionService: ConnectionService;

    constructor() {
        super();
        this.gameService = gameService;
        this.connectionService = connectionService;
    }

    getProcessedRequests() {
        return {};
    }

    errorHadler(error: any, ws: WebSocket) {
        if (!(error instanceof Error && typeof error.message === "string")) {
            console.log(error);
            return;
        }

        if (
            error.message === gameControllerError.USER_NOT_FOUND ||
            error.message === gameControllerError.GAME_NOT_FOUND ||
            error.message === gameControllerError.OTHER_PLAYER_MOVE
        ) {
            ws.send(
                this.getResponse("err", {
                    error: true,
                    errorText: error.message,
                })
            );
        }
    }

    create(room: Room, ws: WebSocket) {
        try {
            const game = room.createGame();

            if (game) {
                game.getParticipants().forEach((user) => {
                    const connection =
                        this.connectionService.findConnectionByUserId(user.id);

                    if (!connection) {
                        throw new Error(
                            gameControllerError.CONNECTION_NOT_FOUND
                        );
                    }

                    connection.send(
                        this.getResponse("create_game", {
                            idGame: room.id,
                            idPlayer: user.id,
                        })
                    );
                });
            }
        } catch (error) {
            this.errorHadler(error, ws);
        }
    }

    startGame(game: Game) {
        game.getParticipants().forEach((user) => {
            const connection = this.connectionService.findConnectionByUserId(
                user.id
            );

            if (!connection) {
                throw new Error(gameControllerError.CONNECTION_NOT_FOUND);
            }

            if (user === game.user) {
                connection.send(
                    this.getResponse("start_game", {
                        ships: game.userShips,
                        currentPlayerIndex: user.id,
                    })
                );
            }

            if (user === game.enemy) {
                connection.send(
                    this.getResponse("start_game", {
                        ships: game.enemyShips,
                        currentPlayerIndex: user.id,
                    })
                );
            }
        });
    }

    addShips(data: any, ws: WebSocket): Game | undefined {
        try {
            const game = this.gameService.getById(data.gameId);
            const user = this.connectionService.findUserByConnection(ws);

            if (!game) {
                throw new Error(gameControllerError.GAME_NOT_FOUND);
            }

            if (!user) {
                throw new Error(gameControllerError.USER_NOT_FOUND);
            }

            game.setShips(user, data.ships);

            return game;
        } catch (error) {
            this.errorHadler(error, ws);
        }
    }

    endGame(game: Game, ws: WebSocket) {
        try {
            game.getParticipants().forEach((currUser) => {
                const connection =
                    this.connectionService.findConnectionByUserId(currUser.id);

                if (!connection) {
                    throw new Error(gameControllerError.CONNECTION_NOT_FOUND);
                }

                connection.send(
                    this.getResponse("finish", {
                        winPlayer: game.turn.id,
                    })
                );
            });

            return game;
        } catch (error) {
            this.errorHadler(error, ws);
        }
    }

    attack(data: any, ws: WebSocket) {
        try {
            const game = this.gameService.getById(data.gameId);
            const user = this.connectionService.findUserByConnection(ws);

            if (!game) {
                throw new Error(gameControllerError.GAME_NOT_FOUND);
            }

            if (!user) {
                throw new Error(gameControllerError.USER_NOT_FOUND);
            }

            const status = game.attack({ x: data.x, y: data.y }, user);

            if (!status) {
                throw new Error(gameControllerError.OTHER_PLAYER_MOVE);
            }

            game.getParticipants().forEach((currUser) => {
                const connection =
                    this.connectionService.findConnectionByUserId(currUser.id);

                if (!connection) {
                    throw new Error(gameControllerError.CONNECTION_NOT_FOUND);
                }

                connection.send(
                    this.getResponse("attack", {
                        position: { x: data.x, y: data.y },
                        currentPlayer: game.turn.id,
                        status,
                    })
                );
                connection.send(
                    this.getResponse("turn", {
                        currentPlayer: game.turn.id,
                    })
                );
            });

            return game;
        } catch (error) {
            this.errorHadler(error, ws);
        }
    }
}
