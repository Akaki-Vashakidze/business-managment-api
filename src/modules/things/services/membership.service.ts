import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../models/user.schema";
import { Model } from "mongoose";
import { ApiException } from "../classes/ApiException.class";
import { MailService } from "./mail.service";
import { Visit } from "../models/visit.schema";
import { Membership } from "../models/membership.schema";
import { CreateMembershipDto } from "../dtos/membershipCreation.dto";
import { MembershipType } from "../enums/membership.enum";
import { RecordState } from "src/modules/base/enums/record-state.enum";
import { ApiResponse } from "src/modules/base/classes/ApiResponse.class";

@Injectable()
export class MembershipService {
    constructor(private mailService: MailService, @InjectModel(User.name) private userModel: Model<User>, @InjectModel(Visit.name) private visitModel: Model<Visit>, @InjectModel(Membership.name) private membershipModel: Model<Membership>) { }

async checkIn(
    body: { qr: string; business: string; branch: string },
    staffId: string
) {
    const { qr, business, branch } = body;
    // 1️⃣ Find user by QR code
    const user = await this.userModel.findOne({ qrCode: qr });
    if (!user) return ApiResponse.error('INVALID_QR', 400);

    // 2️⃣ Find membership that belongs to the same business
    const membership = await this.membershipModel.findOne({
        userId: user._id.toString(),
        business: business,
        'record.isDeleted': 0,
        'record.state': RecordState.ACTIVE,
        endDate: { $gte: new Date() }
    });

    if (!membership) {
        return ApiResponse.error('NO_VALID_MEMBERSHIP_FOR_THIS_BUSINESS', 400);
    }

    // 3️⃣ Check branch (if membership has branches defined)
    if (membership.branches && membership.branches.length > 0) {
        // branches array is not empty, make sure branch is included
        if (!membership.branches.some(b => b.toString() === branch)) {
            return ApiResponse.error('NO_VALID_MEMBERSHIP_FOR_THIS_BRANCH', 400);
        }
    }
    // if branches array is empty or undefined, valid for all branches

    // 4️⃣ Check remaining visits
    if (membership.remainingVisits <= 0) {
        return ApiResponse.error('NO_VISITS_LEFT', 400);
    }

    // 5️⃣ Check if user already visited today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyVisited = await this.visitModel.findOne({
        userId: user._id.toString(),
        'record.isDeleted': 0,
        scannedAt: { $gte: today }
    });

    if (alreadyVisited) {
        return ApiResponse.error('ALREADY_VISITED_TODAY', 400);
    }

    // 6️⃣ Log the visit
    await this.visitModel.create({
        userId: user._id.toString(),
        membershipId: membership._id.toString(),
        scannedBy: staffId,
        scannedAt: new Date()
    });

    // 7️⃣ Decrease remaining visits
    membership.remainingVisits -= 1;
    await membership.save();

    // 8️⃣ Return response
    return {
        success: true,
        remainingVisits: membership.remainingVisits
    };
}


    async createMembership(dto: CreateMembershipDto) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // fixed 30-day duration

        // 1️⃣ Soft-delete old memberships for this user
        await this.membershipModel.updateMany(
            { userId: dto.userId, 'record.isDeleted': 0 },
            { 'record.isDeleted': 1, 'record.state': RecordState.INACTIVE }
        );

        // 2️⃣ Create new membership with business + branches
        const membership = await this.membershipModel.create({
            userId: dto.userId,
            type: dto.type,
            remainingVisits: dto.type, // assuming type is numeric (MONTHLY_8 = 8 etc.)
            startDate,
            endDate,
            business: dto.business,
            branches: dto.branches || [], // default to empty array if none
            record: {
                state: RecordState.ACTIVE,
                isDeleted: 0,
                createdAt: new Date(),
            },
        });

        return membership;
    }


}