import { User } from "./../models/User";
import { UsersRepository } from "../repository/UserRepository";
import crypto from "crypto";

export enum userServiceError {
    ID_INVALID = "Invalid id is specified",
    USER_NOT_FOUND = "The user was not found",
    PASS_INCORRECT = "The password was entered incorrectly",
    REQUIRED_FIELD_NOT_FILL = "Required fields are not filled in",
    FIELDS_NOT_FILLED_CORRECTLY = "Fields are not filled in correctly",
}

export class UserService {
    static instance: UserService;
    userRepository!: UsersRepository;

    constructor() {
        if (UserService.instance) {
            return UserService.instance;
        }

        this.userRepository = new UsersRepository();
        UserService.instance = this;
    }

    getAllUser(): User[] {
        return this.userRepository.getAllUsers();
    }

    getUser(data: Pick<User, "name" | "password">): User {
        const user = this.userRepository.findByName(data.name);

        if (!user) {
            return this.creatUser(data);
        }

        if (user.password !== data.password) {
            throw new Error(userServiceError.PASS_INCORRECT);
        }

        return user;
    }

    private creatUser(data: Pick<User, "name" | "password">): User {
        const newUser: User = new User({
            ...data,
            id: crypto.randomUUID(),
            wins: 0,
        });

        return this.userRepository.save(newUser);
    }

    increaseWinsUser(name: User["name"]) {
        const user = this.userRepository.findByName(name);

        if (!user) {
            throw new Error(userServiceError.USER_NOT_FOUND);
        }

        user.increaseWins();
    }
}

export const userService = new UserService();
