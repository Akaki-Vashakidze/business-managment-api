import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { BusinessDto } from "../dtos/business.dto";
import { BusinessService } from "../services/business.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";

@Controller('business')
export class BusinessController {
    constructor(private readonly businessService: BusinessService, private jwtTokenService: JwtTokenService) { }

    @Post('create-business')
    async createBusiness(@Body() businessData: BusinessDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.businessService.createBusiness(businessData, userId);
    }

    @Get('get-all-my-businesses')
    async getBusinessesByOwner(@Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.businessService.getBusinessesByOwner(userId);
    }

    @Get('get-all-businesses')
    async getAllBusinesses() {
        return this.businessService.getAllActiveBusinesses();
    }

    @Delete('delete-business/:businessId')
    async deleteBusiness(@Param('businessId') businessId: string) {
    return this.businessService.deleteBusiness(businessId);
    }

    @Put('update-business/:businessId')
    async updateBusiness(@Param('businessId') businessId: string, @Body() businessData: BusinessDto) {
        return this.businessService.updateBusiness(businessId, businessData);
    }   
}
