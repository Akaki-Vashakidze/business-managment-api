import { Body, Controller, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { MembershipService } from "../services/membership.service";
import { CreateMembershipDto } from "../dtos/membershipCreation.dto";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";

@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService, private jwtTokenService:JwtTokenService) { }
    @Post('check-in')
    async checkIn(@Body() body: {qr: string, business:string, branch:string }, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.membershipService.checkIn(body, userId);
    }

    @Post('create') // მხოლოდ Staff/Admin
    async createMembership(@Body() dto: CreateMembershipDto) {
        return this.membershipService.createMembership(dto);
    }
}