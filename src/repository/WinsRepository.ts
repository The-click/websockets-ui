import { IWins } from "../models/Wins";
import { UsersRepository } from "./UserRepository";

export class WinsRepository {
    wins: IWins[];
    usersRepository: UsersRepository;

    constructor(usersRepository: UsersRepository) {
        this.wins = [];
        this.usersRepository = usersRepository;
    }

    updateWins() {
        this.wins = this.usersRepository.users
            .filter((user) => user.wins)
            .map((user) => ({ name: user.name, wins: user.wins }));
        this.wins.sort((winA, winB) => winA.wins - winB.wins);
    }
}
