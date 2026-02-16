import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model } from "mongoose";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getUserById(id: string) {
        const user = await this.userModel.findById(id).select('-password');
        if (user) {
            return ApiResponse.success(user)
        } else {
            ApiResponse.error('users not found', 400)
        }
    }

    async deleteUser(id: string) {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

        if (!deletedUser) {
            return ApiResponse.error('User not found or already deleted', 404);
        }

        return ApiResponse.success({
            message: 'User permanently deleted',
            deletedId: id
        });
    }
}