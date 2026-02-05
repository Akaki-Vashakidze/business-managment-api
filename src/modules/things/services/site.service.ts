import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ItemManagement } from "../models/itemManagement.schema";
import { ReserveItemDto } from "../dtos/reserveItem.dto";
import { User } from "../models/user.schema";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";
import { BusinessBranch } from "../models/businessBranch";
import { Item } from "../models/item.schema";

@Injectable()
export class SiteService {
    constructor(@InjectModel(BusinessBranch.name) private businessBranch: Model<BusinessBranch>, @InjectModel(ItemManagement.name) private itemManagement: Model<ItemManagement>,@InjectModel(Item.name) private item: Model<Item>) { }

    async getBranchesByBusiness(business: string) {
        const branches = await this.businessBranch.find({
            business
        })
        return ApiResponse.success(branches);
    }

    async getBranchItemsReservations(body:{ branchId:string, date: Date}) {
        const {branchId, date} = body;
        // 1. Find all active items for the branch
        const items = await this.item.find({
            branch: branchId,
            'record.state': 1
        });

        if (!items || items.length === 0) {
            return ApiResponse.error('No items found for this branch', 404);
        }

        const itemIds = items.map(i => i._id);

        const itemReservations = await this.itemManagement.find({
            item: { $in: itemIds },
            date
        }).populate('item'); 

        return ApiResponse.success({
            items,
            reservations: itemReservations
        });
    }

    async getMyReservations(user: string) {
        // Create a date object for the start of "today"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.itemManagement.find({ 
            user,
            date: { $gte: today } 
        }).sort({ date: 1, startHour: 1 });
    }

    async deleteMyReservation(reservationId: string, userId: string) {
    let item = await this.itemManagement.findOneAndDelete({
        _id: reservationId,
        user: userId 
    });
    if(item){
        return ApiResponse.success(item)
    } else {
        return ApiResponse.error('not deleted', 400)
    }
    
    }
}