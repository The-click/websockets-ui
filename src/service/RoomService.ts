import { Room } from "../models/Room";
import { User } from "../models/User";
import { RoomRepository } from "../repository/RoomRepository";
import crypto from "crypto";
import { Game } from "../models/Game";

export enum roomServiceError {
    ROOM_NOT_FOUND = "The room was not found",
    ENEMY_NOT_SET = "The enemy not set",
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

    getAllOpenRooms(): Room[] {
        return this.roomRepository.rooms.filter((room) => room.isOpen);
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

    createRoom(creator: Room["user"]): Room {
        const id = crypto.randomUUID();
        const room = new Room(creator, id);
        this.roomRepository.saveRoom(room);

        return room;
    }

    createGame(roomId: Room["id"]): Game {
        const room = this.getById(roomId);
        const game = room.createGame();

        if (!game) {
            throw new Error(roomServiceError.ENEMY_NOT_SET);
        }

        return game;
    }
}

export const roomService = new RoomService();
