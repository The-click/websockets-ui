import {
    ConnectionService,
    connectionService,
} from "./../service/ConnectionSerivce";
import { RoomService, roomService } from "../service/RoomService";
import { BaseController } from "./BaseController";
import { Room } from "../models/Room";
import { WebSocket } from "ws";

export enum roomControllerError {
    USER_NOT_FOUND = "User not found",
    ROOM_NOT_FOUND = "Room not found",
    CONNECTION_NOT_FOUND = "Connection not found",
}

export class RoomController extends BaseController {
    roomService: RoomService;
    connectionService: ConnectionService;

    constructor() {
        super();
        this.roomService = roomService;
        this.connectionService = connectionService;
    }

    getProcessedRequests() {
        return {
            create_room: this.create,
            add_user_to_room: this.addUserInRoom,
        };
    }

    updateRooms(ws: WebSocket) {
        const rooms = this.roomService.getAllOpenRooms().map((room) => ({
            roomId: room.id,
            roomUsers: [{ name: room.user.name, index: room.user.id }],
        }));

        ws.send(this.getResponse("update_room", rooms));
    }

    create(data: string, ws: WebSocket) {
        try {
            const user = this.connectionService.findUserByConnection(ws);

            if (!user) {
                throw new Error(roomControllerError.USER_NOT_FOUND);
            }

            roomService.createRoom(user);

            return true;
        } catch (error) {
            if (
                !(error instanceof Error && typeof error.message === "string")
            ) {
                console.log(error);
                return;
            }

            if (error.message === roomControllerError.USER_NOT_FOUND) {
                ws.send(
                    this.getResponse("err", {
                        error: true,
                        errorText: roomControllerError.USER_NOT_FOUND,
                    })
                );
            }
        }
    }

    addUserInRoom(data: { indexRoom: Room["id"] }, ws: WebSocket) {
        try {
            const room = this.roomService.getById(data.indexRoom);
            const user = this.connectionService.findUserByConnection(ws);

            if (!room) {
                throw new Error(roomControllerError.ROOM_NOT_FOUND);
            }

            if (!user) {
                throw new Error(roomControllerError.USER_NOT_FOUND);
            }

            room.addEnemy(user);

            return room;
        } catch (error) {
            if (
                !(error instanceof Error && typeof error.message === "string")
            ) {
                console.log(error);
                return;
            }

            if (
                error.message === roomControllerError.USER_NOT_FOUND ||
                error.message === roomControllerError.ROOM_NOT_FOUND ||
                error.message === roomControllerError.CONNECTION_NOT_FOUND
            ) {
                ws.send(
                    this.getResponse("err", {
                        error: true,
                        errorText: error.message,
                    })
                );
            }
        }
    }
}
