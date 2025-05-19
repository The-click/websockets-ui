import { GameController } from "./src/controller/GameController";
import { RoomController } from "./src/controller/RoomController";
import { UserController } from "./src/controller/UserController";
import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from "ws";

const HTTP_PORT = 8181;

const userController = new UserController();
const roomController = new RoomController();
const gameController = new GameController();

const wss = new WebSocketServer({ port: 3000 });
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", function message(data) {
        const body: { type: string; data: string; id: number } = JSON.parse(
            data.toString()
        );
        const bodyData = JSON.parse(body.data || "{}");

        console.log(body);

        switch (body.type) {
            case "reg": {
                if (userController.registration(bodyData, ws)) {
                    roomController.updateRooms(ws);
                }

                break;
            }
            case "create_room": {
                const isCreate = roomController.create(bodyData, ws);

                if (isCreate) {
                    wss.clients.forEach((currWs) =>
                        roomController.updateRooms(currWs)
                    );
                }

                break;
            }
            case "add_user_to_room": {
                const room = roomController.addUserInRoom(bodyData, ws);

                if (room) {
                    gameController.create(room, ws);
                    wss.clients.forEach((currWs) =>
                        roomController.updateRooms(currWs)
                    );
                }
                break;
            }
            case "add_ships": {
                const game = gameController.addShips(bodyData, ws);

                if (game && game.isReadyForStart()) {
                    gameController.startGame(game);
                }

                break;
            }
            case "attack":
                const game = gameController.attack(bodyData, ws);

                if (game && game.checkShipsIsLive(game.turn) === false) {
                    gameController.endGame(game, ws);
                }

                break;
            default:
                break;
        }

        if (bodyData.ships) {
            bodyData.ships.map((ship: any) =>
                console.log(ship.position, ship.direction, ship.length)
            );
        }
    });
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
