import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model, ObjectId } from "mongoose";
import { Business } from "../models/business.schema";
import { BusinessDto } from "../dtos/business.dto";

@Injectable()
export class BusinessService {
 constructor(@InjectModel(Business.name) private businessModel: Model<Business>) { }

    async createBusiness(businessData: BusinessDto, ownerId: string) { 
        const { name } = businessData;
        const business = await this.businessModel.create({
            name,
            owner: ownerId
        });
        return business;
    }

    async getBusinessById(businessId: string) {
        return this.businessModel.findById(businessId);
    }   

    async getBusinessesByOwner(ownerId: string) {
        return this.businessModel.find({ owner: ownerId });
    }

    async deleteBusiness(businessId: string) {
        return this.businessModel.findByIdAndDelete(businessId);
    }   

    async updateBusiness(businessId: string, businessData: BusinessDto) {
        return this.businessModel.findByIdAndUpdate(businessId, businessData, { new: true });
    }

}