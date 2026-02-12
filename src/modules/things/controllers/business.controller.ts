import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { BusinessDto } from "../dtos/business.dto";
import { BusinessService } from "../services/business.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { AdminGuard } from "../guards/admin.guard";
import { AuthGuard } from "../guards/auth.guard";

@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService, private jwtTokenService: JwtTokenService) { }

    @UseGuards(AdminGuard)
    @Post('create-business')
    async createBusiness(@Body() businessData: BusinessDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.businessService.createBusiness(businessData, userId);
    }

    @UseGuards(AdminGuard)
    @Get('get-all-my-businesses')
    async getBusinessesByOwner(@Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.businessService.getBusinessesByOwner(userId);
    }

    @Get('get-all-businesses')
    async getAllBusinesses() {
        return this.businessService.getAllActiveBusinesses();
    }

    @UseGuards(AdminGuard)
    @Delete('delete-business/:businessId')
    async deleteBusiness(@Param('businessId') businessId: string) {
    return this.businessService.deleteBusiness(businessId);
    }

    @UseGuards(AdminGuard)
    @Put('update-business/:businessId')
    async updateBusiness(@Param('businessId') businessId: string, @Body() businessData: BusinessDto) {
        return this.businessService.updateBusiness(businessId, businessData);
    }   
}
