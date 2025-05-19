import { Room } from "../models/Room";
import { User } from "../models/User";

export class RoomRepository {
    rooms: Room[];

    constructor() {
        this.rooms = [];
    }

    saveRoom(room: Room) {
        this.rooms.push(room);
    }

    getById(id: Room["id"]): Room | undefined {
        return this.rooms.find((room) => room.id === id);
    }

    getByUser(userId: User["id"]): Room | undefined {
        return this.rooms.find((room) => room.user.id === userId);
    }

    removeRoomByUser(userId: User["id"]) {
        this.rooms = this.rooms.filter((room) => room.user.id !== userId);
    }
}
