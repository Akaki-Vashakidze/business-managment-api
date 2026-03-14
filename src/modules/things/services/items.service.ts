import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Item } from "../models/item.schema";
import { ItemDto } from "../dtos/item.dto";
import { BusinessBranch } from "../models/businessBranch";
import { ItemManagement } from "../models/itemManagement.schema";
import { ObjectId } from "mongodb";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class ItemsService {
 constructor(@InjectModel(Item.name) private ItemModel: Model<Item>, @InjectModel(BusinessBranch.name) private branchModel: Model<BusinessBranch>, @InjectModel(ItemManagement.name) private itemManagement:Model<ItemManagement>) { }
async createItem(ItemData: ItemDto, ownerId: string) {
    // 1. მოძებნა და ბიზნესის მონაცემების წამოღება
    const branch1 = await this.branchModel
        .findById(ItemData.branch)
        .populate('business');

    // 2. ფილიალის არსებობის შემოწმება
    if (!branch1) {
        return ApiResponse.error('Branch not found', 404);
    }

    const business = branch1.business as any;

    // 3. უფლებების შემოწმება (Soft check for ObjectId comparison)
    // ვამოწმებთ, არის თუ არა ownerId ბიზნესის მფლობელების სიაში
    const isOwner = business?.owners?.some(
        (id: any) => id.toString() === ownerId.toString()
    );

    if (!isOwner) {
        // თუ არ არის მფლობელი, ვაბრუნებთ 403 (Forbidden)
        return ApiResponse.error('Unauthorized to add item to this branch', 403);
    }

    // 4. ნივთის შექმნა
    const { name, branch } = ItemData;
    const item = await this.ItemModel.create({
        name,
        branch,
        // თუ შენს სქემაში record ობიექტია, ის ავტომატურად შეიქმნება default მნიშვნელობებით
    });

    return item;
}

    async getItemsByBranch(branch: ObjectId) {
        return this.ItemModel.find({ 
            branch, 
            'record.isDeleted': 0 
        });
    }

    async deleteItem(itemId: string) {
        await this.itemManagement.updateMany(
            { item: itemId }, 
            { $set: { 'record.isDeleted': 1 } } 
        );

        return this.ItemModel.findByIdAndUpdate(
            itemId, 
            { $set: { 'record.isDeleted': 1 } },
            { new: true }
        );
    }

    async getItemById(itemId: string) {
        return this.ItemModel.findById(itemId);
    }

    async updateItem(ItemId: string, ItemData: {name}) {
        return this.ItemModel.findByIdAndUpdate(ItemId, ItemData, { new: true });
    }


}