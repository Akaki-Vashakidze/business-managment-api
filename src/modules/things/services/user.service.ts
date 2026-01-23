import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model } from "mongoose";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getAllUsersMinusOwnerAndManagers() {
        return this.userModel.find({ isManager: 0, isOwner: 0 }).select('-password');
    }

    async getFilteredUsers(searchQuery: string) {
        return this.userModel.find({ fullName: { $regex: searchQuery, $options: 'i' } }).select('-password');
    }
}