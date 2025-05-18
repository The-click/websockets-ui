import { Room } from "../models/Room";
import { User } from "../models/User";
import { RoomRepository } from "../repository/RoomRepository";

export enum roomServiceError {
    ROOM_NOT_FOUND = "The room was not found",
}

export class RoomService {
    static instance: RoomService;
    roomRepository!: RoomRepository;

    constructor() {
        if (RoomService.instance) {
            return RoomService.instance;
        }

        this.roomRepository = new RoomRepository();
        RoomService.instance = this;
    }

    getAllRooms(): Room[] {
        return this.roomRepository.rooms;
    }

    getById(id: Room["id"]): Room {
        const room = this.roomRepository.getById(id);

        if (!room) {
            throw new Error(roomServiceError.ROOM_NOT_FOUND);
        }

        return room;
    }

    addEnemy(user: User, id: Room["id"]) {
        const room = this.getById(id);
        room.addEnemy(user);

        return room;
    }

    creatRoom(creator: Room["user"]): Room {
        const id = (+new Date()).toString();
        const room = new Room(creator, id);
        this.roomRepository.saveRoom(room);

        return room;
    }
}

export const roomService = new RoomService();
