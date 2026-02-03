import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { ItemDto } from "../dtos/item.dto";
import { ItemsService } from "../services/items.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { ItemManagementService } from "../services/itemManagement.service";
import { SiteService } from "../services/site.service";

@Controller('site')
export class SiteController {
    constructor(private readonly siteService: SiteService) { }

    // @Post('get-all-item-reservations')
    // async getAllItemReservations(@Body() itemIds: {itemIds:string[]}) {
    //     return this.itemManagementService.getAllItemReservations(itemIds.itemIds);
    // }

    @Get('get-business-branches/:business')
    async getReservationsByItem(@Param('business') businessId: string) {
        return this.siteService.getBranchesByBusiness(businessId);
    }

    @Get('get-branch-items-reservations/:branchId')
    async getBranchItemsReservations(@Param('branchId') branchId: string) {
        return this.siteService.getBranchItemsReservations(branchId);
    }

    
}
