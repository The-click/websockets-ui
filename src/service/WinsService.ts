import { userService } from "./UserService";
import { WinsRepository } from "../repository/WinsRepository";
import { IWins } from "../models/Wins";

export class WinsService {
    static instance: WinsService;
    winsRepository!: WinsRepository;

    constructor() {
        if (WinsService.instance) {
            return WinsService.instance;
        }

        this.winsRepository = new WinsRepository(userService.userRepository);
        WinsService.instance = this;
    }

    getAllWins(): IWins[] {
        this.updateRepository();
        return this.winsRepository.wins;
    }

    updateRepository() {
        this.winsRepository.updateWins();
    }
}

export const winService = new WinsService();
