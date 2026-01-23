import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ItemManagement } from "../models/itemManagement.schema";
import { ReserveItemDto } from "../dtos/reserveItem.dto";

@Injectable()
export class ItemManagementService {
 constructor(@InjectModel(ItemManagement.name) private ItemManagementModel: Model<ItemManagement>) { }

async reserveItemByAdmin(ItemManagementData: ReserveItemDto, adminId: string) {
    const { date, startHour, startMinute, endHour, endMinute, item } = ItemManagementData;

    // Convert start/end to minutes for easier comparison
    const newStart = startHour * 60 + startMinute;
    const newEnd = endHour * 60 + endMinute;

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

}