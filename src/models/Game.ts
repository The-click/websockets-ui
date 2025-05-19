import { Room } from "./Room";
import { User } from "./User";

export enum attackStatus {
    MISS = "miss",
    KILLED = "killed",
    SHOT = "shot",
}

export interface Cell {
    x: number;
    y: number;
}

interface BaseShip {
    position: Cell;
    direction: boolean;
    length: number;
    type: "small" | "medium" | "large" | "huge";
}

interface Ship extends BaseShip {
    isLive: boolean;
    positionCells: Cell[];
    cellAround: Cell[];
}

export interface IGame {
    id: string;
    room: Room;
    user: User;
    userShips: Ship[];
    enemy: User;
    enemyShips: Ship[];
    turn: IGame["user"] | IGame["enemy"];
}

export class Game implements IGame {
    id: string;
    user: User;
    enemy: User;
    room: Room;
    userShips: Ship[];
    enemyShips: Ship[];
    turn: User;

    constructor(game: Pick<IGame, "id" | "user" | "enemy" | "room">) {
        this.id = game.id;
        this.user = game.user;
        this.enemy = game.enemy;
        this.room = game.room;
        this.enemyShips = [];
        this.userShips = [];
        this.turn = Math.random() > 0.5 ? this.enemy : this.user;
    }

    isReadyForStart() {
        return (
            this.user &&
            this.enemy &&
            this.enemyShips.length &&
            this.userShips.length
        );
    }

    setShips(user: User, baseShips: BaseShip[]) {
        const ships: Ship[] = baseShips.map((baseShip) => {
            const { positionCells, cellAround } =
                this.getPositionCells(baseShip);

            return { ...baseShip, positionCells, cellAround, isLive: true };
        });

        if (user === this.user) {
            this.userShips = ships;
        }

        if (user === this.enemy) {
            this.enemyShips = ships;
        }
    }

    checkShipsIsLive(user: User) {
        if (user === this.user) {
            return this.enemyShips.some((ship) => ship.isLive);
        }

        if (user === this.enemy) {
            return this.userShips.some((ship) => ship.isLive);
        }
    }

    private toggleTurn() {
        this.turn = this.turn === this.enemy ? this.user : this.enemy;
    }

    attack(
        attackPosition: Cell,
        user: User
    ): ({ status: attackStatus } & Record<string, any>) | undefined {
        if (this.turn !== user) {
            return;
        }

        let findedShip: Ship | undefined;

        if (this.turn === this.user) {
            findedShip = this.enemyShips.find((ship) =>
                ship.positionCells.find(
                    (position) =>
                        position.x === attackPosition.x &&
                        position.y === attackPosition.y
                )
            );
        }

        if (this.turn === this.enemy) {
            findedShip = this.userShips.find((ship) =>
                ship.positionCells.find(
                    (position) =>
                        position.x === attackPosition.x &&
                        position.y === attackPosition.y
                )
            );
        }

        if (!findedShip) {
            this.toggleTurn();
            return { status: attackStatus.MISS };
        }

        findedShip.positionCells = findedShip.positionCells.filter(
            (position) =>
                !(
                    position.x === attackPosition.x &&
                    position.y === attackPosition.y
                )
        );

        if (findedShip.positionCells.length) {
            return { status: attackStatus.SHOT };
        } else {
            findedShip.isLive = false;
            return {
                status: attackStatus.KILLED,
                cellAround: findedShip.cellAround,
            };
        }
    }

    private getPositionCells(baseShip: BaseShip | Ship): {
        positionCells: Ship["positionCells"];
        cellAround: Ship["cellAround"];
    } {
        const positionCells: Ship["positionCells"] = [];
        const cellAround: Ship["cellAround"] = [];

        for (let i = 0; i < baseShip.length; i++) {
            if (baseShip.direction) {
                positionCells.push({
                    x: baseShip.position.x,
                    y: baseShip.position.y + i,
                });
                cellAround.push({
                    x: baseShip.position.x - 1,
                    y: baseShip.position.y + i,
                });
                cellAround.push({
                    x: baseShip.position.x + 1,
                    y: baseShip.position.y + i,
                });
            } else {
                positionCells.push({
                    x: baseShip.position.x + i,
                    y: baseShip.position.y,
                });
                cellAround.push({
                    x: baseShip.position.x + i,
                    y: baseShip.position.y - 1,
                });
                cellAround.push({
                    x: baseShip.position.x + i,
                    y: baseShip.position.y + 1,
                });
            }
        }

        if (baseShip.direction) {
            cellAround.push({
                x: baseShip.position.x,
                y: baseShip.position.y - 1,
            });
            cellAround.push({
                x: baseShip.position.x - 1,
                y: baseShip.position.y - 1,
            });
            cellAround.push({
                x: baseShip.position.x + 1,
                y: baseShip.position.y - 1,
            });
        } else {
            cellAround.push({
                x: baseShip.position.x - 1,
                y: baseShip.position.y,
            });
            cellAround.push({
                x: baseShip.position.x - 1,
                y: baseShip.position.y - 1,
            });
            cellAround.push({
                x: baseShip.position.x - 1,
                y: baseShip.position.y + 1,
            });
        }

        if (baseShip.direction) {
            cellAround.push({
                x: baseShip.position.x,
                y: baseShip.position.y + baseShip.length,
            });
            cellAround.push({
                x: baseShip.position.x - 1,
                y: baseShip.position.y + baseShip.length,
            });
            cellAround.push({
                x: baseShip.position.x + 1,
                y: baseShip.position.y + baseShip.length,
            });
        } else {
            cellAround.push({
                x: baseShip.position.x + baseShip.length,
                y: baseShip.position.y,
            });
            cellAround.push({
                x: baseShip.position.x + baseShip.length,
                y: baseShip.position.y - 1,
            });
            cellAround.push({
                x: baseShip.position.x + baseShip.length,
                y: baseShip.position.y + 1,
            });
        }

        return { positionCells, cellAround };
    }

    getParticipants() {
        if (this.enemy) {
            return [this.user, this.enemy];
        }

        return [this.user];
    }
}
