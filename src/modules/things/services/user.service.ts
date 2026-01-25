import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model } from "mongoose";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getAllUsersMinusOwnerAndManagers() {
        return this.userModel.find({ isManager: 0, isOwner: 0 }).select('-password');
    }

    async getFilteredUsers(searchQuery: string) {
        const users = await this.userModel.find({ fullName: { $regex: searchQuery, $options: 'i' } }).select('-password');
        if (users) {
            // ApiResponse.success(users)
            return users;
        } else {
            ApiResponse.error('users not found', 400)
        }
    }
}