import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model } from "mongoose";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async getAllUsersMinusOwnerAndManagers(businessId:string) {
        return this.userModel.find({business:businessId, isManager: 0, isOwner: 0 }).select('-password');
    }

    async getFilteredUsers(searchQuery: string, businessId:string) {
        const users = await this.userModel.find({business:businessId, fullName: { $regex: searchQuery, $options: 'i' } }).select('-password');
        if (users) {
            // ApiResponse.success(users)
            return users;
        } else {
            ApiResponse.error('users not found', 400)
        }
    }

    async getUserById(id: string) {
        const user = await this.userModel.findById(id).select('-password');
        if (user) {
            return ApiResponse.success(user)
        } else {
            ApiResponse.error('users not found', 400)
        }
    }

    async makeAdminActive(adminId: string) {
        // 1. Set isActiveAdmin to 0 for all Owners and Managers
        await this.userModel.updateMany(
            { 
                $or: [{ isOwner: 1 }, { isManager: 1 }] 
            },
            { 
                $set: { isActiveAdmin: 0 } 
            }
        );

        // 2. Set the specific admin to active
        const user = await this.userModel.findByIdAndUpdate(
            adminId,
            { $set: { isActiveAdmin: 1 } },
            { new: true }
        );

        if (!user) {
            return ApiResponse.error(`User with ID ${adminId} not found`, 400);
        }

        return user;
    }


async checkIfAdminIsActive(adminId: string): Promise<boolean> {
    const user = await this.userModel.findById(adminId)
        .select('isActiveAdmin') // Only fetch this field for better performance
        .lean(); // Returns a plain JS object instead of a heavy Mongoose document

    if (!user) {
        return false;
    }

    // Returns true if isActiveAdmin is 1, false otherwise
    return user.isActiveAdmin === 1;
}
    
}