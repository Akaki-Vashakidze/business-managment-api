import { Body, Controller, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { MembershipService } from "../services/membership.service";
import { CreateMembershipDto } from "../dtos/membershipCreation.dto";

@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) { }
    @Post('check-in')
    async checkIn(@Body('qr') qr: string, @Req() req) {
        return this.membershipService.checkIn(qr, req.user.id);
    }

    @Post('create') // მხოლოდ Staff/Admin
    async createMembership(@Body() dto: CreateMembershipDto) {
        return this.membershipService.createMembership(dto);
    }
}