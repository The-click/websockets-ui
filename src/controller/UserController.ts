import {
    ConnectionService,
    connectionService,
} from "../service/ConnectionSerivce";
import { roomService } from "../service/RoomService";
import {
    UserService,
    userService,
    userServiceError,
} from "../service/UserService";
import { winService } from "../service/WinsService";
import { User } from "./../models/User";
import { BaseController } from "./BaseController";
import { WebSocket } from "ws";

export class UserController extends BaseController {
    userService: UserService;
    connectionService: ConnectionService;

    constructor() {
        super();
        this.connectionService = connectionService;
        this.userService = userService;
    }

    getProcessedRequests() {
        return {
            reg: this.registration,
        };
    }

    registration(data: Pick<User, "name" | "password">, ws: WebSocket) {
        try {
            console.log(this);
            console.log("registartion");
            const user = this.userService.getUser(data);

            ws.send(
                this.getResponse("reg", {
                    name: user.name,
                    index: user.id,
                    error: false,
                    errorText: "",
                })
            );

            ws.send(
                this.getResponse("update_winners", winService.getAllWins())
            );

            this.connectionService.addConnection(user, ws);

            return true;
        } catch (error) {
            if (
                !(error instanceof Error && typeof error.message === "string")
            ) {
                console.log(error);
                return;
            }

            if (error.message === userServiceError.PASS_INCORRECT) {
                ws.send(
                    this.getResponse("reg", {
                        name: data.name,
                        index: "",
                        error: true,
                        errorText: userServiceError.PASS_INCORRECT,
                    })
                );
            }
        }
    }
}
