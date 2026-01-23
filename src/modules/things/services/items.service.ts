import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Item } from "../models/item.schema";
import { ItemDto } from "../dtos/item.dto";
import { BusinessBranch } from "../models/businessBranch";

@Injectable()
export class ItemsService {
 constructor(@InjectModel(Item.name) private ItemModel: Model<Item>, @InjectModel(BusinessBranch.name) private branchModel: Model<BusinessBranch>) { }
    async createItem(ItemData: ItemDto, ownerId: string) {

        const branch1 = await this.branchModel
        .findById(ItemData.branch)
        .populate('business');

        if (!branch1) {
        throw new Error('Branch not found');
        }

        const business = branch1.business as any;
        if (business.owner.toString() !== ownerId) {
        throw new Error('Unauthorized to add item to this branch');
        }

        const { name, branch } = ItemData;
        const Item = await this.ItemModel.create({
            name,
            branch
        });
        return Item;
    }

    async getItemsByBranch(branch: string) {
        return this.ItemModel.find({ branch });
    }

    async deleteItem(ItemId: string) {
        return this.ItemModel.findByIdAndDelete(ItemId);
    }   

    async updateItem(ItemId: string, ItemData: {name}) {
        return this.ItemModel.findByIdAndUpdate(ItemId, ItemData, { new: true });
    }

}