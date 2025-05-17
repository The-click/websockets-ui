import { Room } from "../models/Room";

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
}
