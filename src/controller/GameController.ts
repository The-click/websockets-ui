import { Cell } from "./../models/Game";
import {
    ConnectionService,
    connectionService,
} from "./../service/ConnectionSerivce";
import { RoomService, roomService } from "../service/RoomService";
import { BaseController } from "./BaseController";
import { Room } from "../models/Room";
import { WebSocket } from "ws";
import { gameService, GameService } from "../service/GameService";
import { attackStatus, Game } from "../models/Game";

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

        console.log(error.message);
    }

    create(room: Room, ws: WebSocket) {
        try {
            const game = this.gameService.createGame(room.id);

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

            connection.send(
                this.getResponse("turn", {
                    currentPlayer: game.turn.id,
                })
            );
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

                if (currUser.id === game.turn.id) {
                    currUser.increaseWins();
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

    randomAttack(data: any, ws: WebSocket) {
        return this.attack(
            {
                ...data,
                x: Math.round(Math.random() * 9),
                y: Math.round(Math.random() * 9),
            },
            ws
        );
    }

    attack(data: any, ws: WebSocket): Game | undefined {
        try {
            const game = this.gameService.getById(data.gameId);
            const user = this.connectionService.findUserByConnection(ws);

            if (!game) {
                throw new Error(gameControllerError.GAME_NOT_FOUND);
            }

            if (!user) {
                throw new Error(gameControllerError.USER_NOT_FOUND);
            }

            const statusObj = game.attack({ x: data.x, y: data.y }, user);

            if (!statusObj) {
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
                        currentPlayer: user.id,
                        status: statusObj.status,
                    })
                );

                if (statusObj.status === attackStatus.KILLED) {
                    statusObj.cellAround.forEach((cell: Cell) => {
                        connection.send(
                            this.getResponse("attack", {
                                position: { x: cell.x, y: cell.y },
                                currentPlayer: user.id,
                                status: attackStatus.MISS,
                            })
                        );
                    });
                }

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
