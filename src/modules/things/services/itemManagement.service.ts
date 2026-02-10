import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ItemManagement } from "../models/itemManagement.schema";
import { ReserveItemDto } from "../dtos/reserveItem.dto";
import { User } from "../models/user.schema";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";
import { ItemsService } from "./items.service";
import { ReserveItemUserDto } from "../dtos/reserveItemUser.dto";

@Injectable()
export class ItemManagementService {
    constructor(private itemsService:ItemsService,@InjectModel(ItemManagement.name) private itemManagementModel: Model<ItemManagement>, @InjectModel(User.name) private user: Model<User>) { }

async reserveItemByAdmin(ItemManagementData: ReserveItemDto, adminId: string) {
    const { date, startHour, startMinute, endHour, endMinute, branchId } = ItemManagementData;

    // 1. Handle "Midnight Crossover" for math
    const newStart = startHour * 60 + startMinute;
    let newEnd = endHour * 60 + endMinute;
    if (newEnd <= newStart) newEnd += 1440; // Add 24 hours in minutes

    // 2. User Validation
    if (ItemManagementData.user) {
        const userFound = await this.user.findById(ItemManagementData.user); // Fixed 'user' to 'userModel'
        if (!userFound) return { success: false, message: 'User does not exist' };
    }

    // 3. Get all items in this branch (e.g., all PlayStations)
    const allBranchItems = await this.itemsService.getItemsByBranch(branchId);
    if (!allBranchItems || allBranchItems.length === 0) {
        return { success: false, message: 'No items found in this branch' };
    }

    // 4. Find the first item that is actually FREE
    let freeItemId:any = null;

    for (const itemEntity of allBranchItems) {
        const existingReservations = await this.itemManagementModel.find({
            item: itemEntity._id,
            date: new Date(date),
            'record.isDeleted': 0
        });

        const isOverlapping = existingReservations.some(res => {
            const existingStart = res.startHour * 60 + res.startMinute;
            let existingEnd = res.endHour * 60 + res.endMinute;
            if (existingEnd <= existingStart) existingEnd += 1440;

            return newStart < existingEnd && newEnd > existingStart;
        });

        if (!isOverlapping) {
            freeItemId = itemEntity._id;
            break; // Found one! Stop looking.
        }
    }

    // 5. If no items were free, throw error
    if (!freeItemId) {
        return { success: false, message: 'All stations are currently busy for this time slot' };
    }

    // 6. Create reservation on the item we found
    const created = await this.itemManagementModel.create({
        ...ItemManagementData,
        item: freeItemId, // Assign the free item found
        acceptedBy: adminId,
        record: { state: 1, isDeleted: 0 }
    });

    await created.populate('item');
    return { success: true, reservation: created };
}

async deleteReservation(_id: string, adminId: string) {
    // 1. Find the reservation and update it to a deleted state
    const deleted = await this.itemManagementModel.findByIdAndUpdate(
        _id,
        { 
            $set: { 
                'record.isDeleted': 1,
                'record.state': 0, 
            } 
        },
        { new: true }
    );

    // 2. Check if the reservation existed
    if (!deleted) {
        return { 
            success: false, 
            message: 'Reservation not found or already deleted' 
        };
    }

    // 3. Return a consistent response format
    return ApiResponse.success(deleted);
}

async reserveItemByUser(ItemManagementData: ReserveItemUserDto, userId: string) {
    const { date, startHour, startMinute, endHour, endMinute, item } = ItemManagementData;

    // 1. Midnight Math: Convert to absolute minutes
    const newStart = startHour * 60 + startMinute;
    let newEnd = endHour * 60 + endMinute;
    if (newEnd <= newStart) newEnd += 1440; // Handle midnight crossover

    // 2. User Validation
    const userFound = await this.user.findById(userId);
    if (!userFound) {
        return { success: false, message: 'This user does not exist' };
    }

    // 3. Find the "Sibling" items
    // First, find the branch/category of the item the user clicked
    const requestedItem = await this.itemsService.getItemById(item);
    if (!requestedItem) {
        return { success: false, message: 'Station category not found' };
    }

    // Get all items in the same branch
    const allBranchItems = await this.itemsService.getItemsByBranch(requestedItem.branch);

    // 4. Search for any available station in this branch
    let assignedItemId:any = null;

    for (const station of allBranchItems) {
        const existingReservations = await this.itemManagementModel.find({
            item: station._id,
            date: new Date(date),
            'record.isDeleted': 0
        });

        // Check if THIS station has an overlap
        const isBusy = existingReservations.some(res => {
            const exStart = res.startHour * 60 + res.startMinute;
            let exEnd = res.endHour * 60 + res.endMinute;
            if (exEnd <= exStart) exEnd += 1440;

            return newStart < exEnd && newEnd > exStart;
        });

        if (!isBusy) {
            assignedItemId = station._id;
            break; // Found a free station!
        }
    }

    // 5. Final check
    if (!assignedItemId) {
        return { success: false, message: 'No stations are available for this time slot.' };
    }

    // 6. Create the reservation with the ID we actually found
    const created = await this.itemManagementModel.create({
        ...ItemManagementData,
        item: assignedItemId,
        user: userId,
        record: { state: 1, isDeleted: 0 }
    });

    await created.populate('item');
    return { success: true, reservation: created };
}

    async getReservationsByItem(itemId: string) {
        return this.itemManagementModel.find({ item: itemId });
    }

    async updateReservation(reservationId: string, reservationData: ReserveItemDto) {
        return this.itemManagementModel.findByIdAndUpdate(reservationId, reservationData, { new: true });
    }

    async getAllItemReservations(itemIds: string[]) {
        if (!itemIds || itemIds.length === 0) return [];

        // Find reservations for all items in the array
        const reservations = await this.itemManagementModel.find({
            item: { $in: itemIds },
            'record.isDeleted': 0
        })
            .sort({ date: 1, startHour: 1, startMinute: 1 }) // sort by date and start time
            .populate('user', 'fullName')   // optional: populate user info
            .populate('item', 'name');      // optional: populate item info

        return reservations;
    }

    async getAllItemReservationsForTodayDate(itemIds: string[]) {
        if (!itemIds || itemIds.length === 0) return [];

        // Start of today (00:00)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Start of tomorrow (00:00 next day)
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const reservations = await this.itemManagementModel.find({
            item: { $in: itemIds },
            date: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            },
            'record.isDeleted': 0
        })
            .sort({ startHour: 1, startMinute: 1 })
            .populate('user', 'fullName mobileNumber email')
            .populate('item', 'name');

        return reservations;
    }

    async markItemAsPaid(itemManagingId: string) {
        const updated = await this.itemManagementModel.findOneAndUpdate(
            { _id: itemManagingId }, 
            { isPaid: 1 },       
            { new: true }            
        );

        if (!updated) {
            return ApiResponse.error('Reservation not found', 400);
        }

        return ApiResponse.success(updated);
    }

        async isItemAvailable(
    itemId: string, 
    date: Date, 
    startH: number, 
    startM: number, 
    endH: number, 
    endM: number
): Promise<boolean> {
    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Convert requested times to total minutes for comparison
    const reqStart = startH * 60 + startM;
    let reqEnd = endH * 60 + endM;
    if (reqEnd <= reqStart) reqEnd += 1440; // Midnight handling

    // Find all active reservations for this item on this date
    const existingReservations = await this.itemManagementModel.find({
        item: itemId,
        date: targetDate,
        'record.isDeleted': 0,
        'record.state': 1 // Only check active ones
    });

    for (const res of existingReservations) {
        const resStart = res.startHour * 60 + res.startMinute;
        let resEnd = res.endHour * 60 + res.endMinute;
        if (resEnd <= resStart) resEnd += 1440; // Midnight handling

        // Overlap Check Logic
        if (reqStart < resEnd && reqEnd > resStart) {
            return false; // Found an overlap, item is BUSY
        }
    }

    return true; // No overlaps found, item is FREE
}
}