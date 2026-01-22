import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BusinessBranch } from "../models/businessBranch";
import { BranchDto } from "../dtos/branch.dto";

@Injectable()
export class BranchesService {
 constructor(@InjectModel(BusinessBranch.name) private BranchModel: Model<BusinessBranch>) { }

    async createBranch(BranchData: BranchDto, ownerId: string) {
        const { name, business } = BranchData;
        const Branch = await this.BranchModel.create({
            name,
            business,
        });
        return Branch;
    }

    async getBranchesByBusiness(businessId: string) {
        return this.BranchModel.find({ business: businessId });
    }

    async deleteBranch(BranchId: string) {
        return this.BranchModel.findByIdAndDelete(BranchId);
    }   

    async updateBranch(BranchId: string, BranchData: BranchDto) {
        return this.BranchModel.findByIdAndUpdate(BranchId, BranchData, { new: true });
    }

}