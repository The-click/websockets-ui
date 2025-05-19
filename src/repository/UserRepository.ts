import { User } from "../models/User";

export class UsersRepository {
    users: User[];

    constructor() {
        this.users = [];
    }

    getAllUsers(): User[] {
        return this.users;
    }

    findById(id: User["id"]): User | undefined {
        return this.users.find((user) => user.id === id);
    }

    findByName(name: User["name"]): User | undefined {
        return this.users.find((user) => user.name === name);
    }

    save(user: User): User {
        this.users.push(user);

        return user;
    }
}
