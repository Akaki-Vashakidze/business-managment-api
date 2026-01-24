import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ItemManagementService } from "../services/itemManagement.service";
import { ReserveItemDto } from "../dtos/reserveItem.dto";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";

@Controller('item/management')
export class ItemManagementController {
    constructor(private readonly itemManagementService: ItemManagementService, private jwtTokenService: JwtTokenService) { }

    @Post('reserve-item')
    async reserveItemByAdmin(@Body() reserveItemData: ReserveItemDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.itemManagementService.reserveItemByAdmin(reserveItemData, userId);
    }

    @Get('get-reservations-by-item/:itemId')
    async getReservationsByItem(@Param('itemId') itemId: string) {
        return this.itemManagementService.getReservationsByItem(itemId);
    }

    @Put('update-reservation/:reservationId')
    async updateReservation(@Param('reservationId') reservationId: string, @Body() reservationData: ReserveItemDto) {
        return this.itemManagementService.updateReservation(reservationId, reservationData);
    }

    @Post('get-all-item-reservations')
    async getAllItemReservations(@Body() itemIds: {itemIds:string[]}) {
        return this.itemManagementService.getAllItemReservations(itemIds.itemIds);
    }

}