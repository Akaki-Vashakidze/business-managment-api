import { Body, Controller, Post, Req } from "@nestjs/common";
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

    async getBusinessById(@Body('businessId') businessId: string) {
        return this.businessService.getBusinessById(businessId);
    }

    async getBusinessesByOwner(@Body('ownerId') ownerId: string) {
        return this.businessService.getBusinessesByOwner(ownerId);
    }

    async deleteBusiness(@Body('businessId') businessId: string) {
        return this.businessService.deleteBusiness(businessId);
    }

    async updateBusiness(@Body('businessId') businessId: string, @Body() businessData: BusinessDto) {
        return this.businessService.updateBusiness(businessId, businessData);
    }   
}
