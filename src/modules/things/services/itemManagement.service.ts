import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ItemManagement } from "../models/itemManagement.schema";
import { ReserveItemDto } from "../dtos/reserveItem.dto";
import { User } from "../models/user.schema";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class ItemManagementService {
    constructor(@InjectModel(ItemManagement.name) private ItemManagementModel: Model<ItemManagement>,@InjectModel(User.name) private user: Model<User>) { }

    async reserveItemByAdmin(ItemManagementData: ReserveItemDto, adminId: string) {
        const { date, startHour, startMinute, endHour, endMinute, item } = ItemManagementData;

        // Convert start/end to minutes for easier comparison
        const newStart = startHour * 60 + startMinute;
        const newEnd = endHour * 60 + endMinute;

        const user = await this.user.findById(ItemManagementData.user);
        if (!user) {
        return ApiResponse.error('This user does not exist', 400);
        }

        // Find existing reservations for the same item and date
        const existingReservations = await this.ItemManagementModel.find({
            item,
            date: new Date(date)
        });

        // Check if any existing reservation overlaps
        for (const res of existingReservations) {
            const existingStart = res.startHour * 60 + res.startMinute;
            const existingEnd = res.endHour * 60 + res.endMinute;

            // Check for **at least 1-minute overlap**
            if (newStart < existingEnd && newEnd > existingStart) {
                // Overlap found
                return { success: false, message: 'Time slot is already reserved!' };
            }
        }

        // No overlap, create reservation
        const created = await this.ItemManagementModel.create({
            ...ItemManagementData,
            acceptedBy: adminId
        });

        return { success: true, reservation: created };
    }


    async getReservationsByItem(itemId: string) {
        return this.ItemManagementModel.find({ item: itemId });
    }

    async updateReservation(reservationId: string, reservationData: ReserveItemDto) {
        return this.ItemManagementModel.findByIdAndUpdate(reservationId, reservationData, { new: true });
    }

    async getAllItemReservations(itemIds: string[]) {
        if (!itemIds || itemIds.length === 0) return [];

        // Find reservations for all items in the array
        const reservations = await this.ItemManagementModel.find({
            item: { $in: itemIds }
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

        const reservations = await this.ItemManagementModel.find({
            item: { $in: itemIds },
            date: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            }
        })
        .sort({ startHour: 1, startMinute: 1 })
        .populate('user', 'fullName')
        .populate('item', 'name');

        return reservations;
    }


}