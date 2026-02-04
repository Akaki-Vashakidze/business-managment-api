import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { ItemDto } from "../dtos/item.dto";
import { ItemsService } from "../services/items.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { ItemManagementService } from "../services/itemManagement.service";
import { SiteService } from "../services/site.service";

@Controller('site')
export class SiteController {
    constructor(private readonly siteService: SiteService, private jwtTokenService:JwtTokenService) { }

    // @Post('get-all-item-reservations')
    // async getAllItemReservations(@Body() itemIds: {itemIds:string[]}) {
    //     return this.itemManagementService.getAllItemReservations(itemIds.itemIds);
    // }

    @Get('get-business-branches/:business')
    async getReservationsByItem(@Param('business') businessId: string) {
        return this.siteService.getBranchesByBusiness(businessId);
    }

    @Post('get-branch-items-reservations')
    async getBranchItemsReservations(@Body() body:{ branchId:string, date: Date}) {
        return this.siteService.getBranchItemsReservations(body);
    }

    @Get('get-my-reservations')
    async getMyReservations(@Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.siteService.getMyReservations(userId);
    }

    @Delete('delete-my-reservation/:reservationId')
    async deleteMyReservation(@Param('reservationId') reservationId: string,@Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.siteService.deleteMyReservation(reservationId,userId);
    }
}
