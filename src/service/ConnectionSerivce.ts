import { User } from "../models/User";
import { WebSocket } from "ws";

interface Connection {
    user: User;
    socket: WebSocket;
}

export class ConnectionService {
    static instance: ConnectionService;
    connectionRepository!: Connection[];

    constructor() {
        if (ConnectionService.instance) {
            return ConnectionService.instance;
        }

        this.connectionRepository = [];
        ConnectionService.instance = this;
    }

    getAllConnection() {
        return this.connectionRepository;
    }

    addConnection(user: Connection["user"], socket: WebSocket) {
        this.connectionRepository.push({ user, socket });
        return { user, socket };
    }

    findConnectionByUserId(userId: User["id"]) {
        return this.connectionRepository.find(
            (connection) => connection.user.id === userId
        )?.socket;
    }

    findUserByConnection(socket: Connection["socket"]) {
        return this.connectionRepository.find(
            (connection) => connection.socket === socket
        )?.user;
    }
}

export const connectionService = new ConnectionService();
