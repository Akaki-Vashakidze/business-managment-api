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

@Injectable()
export class MembershipService {
    constructor(private mailService: MailService, @InjectModel(User.name) private userModel: Model<User>, @InjectModel(Visit.name) private visitModel: Model<Visit>, @InjectModel(Membership.name) private membershipModel: Model<Membership>) { }

    async checkIn(qr: string, staffId: string) {
        const user = await this.userModel.findOne({ qrCode: qr });
        if (!user) throw new ApiException('INVALID_QR');

        const membership = await this.membershipModel.findOne({
            userId: user._id,
            active: true,
            endDate: { $gte: new Date() }
        });

        if (!membership || membership.remainingVisits <= 0)
            throw new ApiException('NO_VISITS');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadyVisited = await this.visitModel.findOne({
            userId: user._id,
            scannedAt: { $gte: today }
        });

        if (alreadyVisited)
            throw new ApiException('ALREADY_VISITED_TODAY');

        await this.visitModel.create({
            userId: user._id,
            membershipId: membership._id,
            scannedBy: staffId
        });

        membership.remainingVisits--;
        await membership.save();

        return { success: true };
    }

    async createMembership(dto: CreateMembershipDto) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30); // fixed 30-day duration

        // soft-delete old memberships
        await this.membershipModel.updateMany(
            { userId: dto.userId, 'record.isDeleted': 0 },
            { 'record.isDeleted': 1, 'record.state': RecordState.INACTIVE }
        );

        // create new membership
        const membership = await this.membershipModel.create({
            userId: dto.userId,
            type: dto.type,
            remainingVisits: dto.type,
            startDate,
            endDate,
            record: {
                state: RecordState.ACTIVE,
                isDeleted: 0,
                createdAt: new Date(),
            },
        });

        return membership;
    }

}