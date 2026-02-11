import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ItemManagementService } from "../services/itemManagement.service";
import { ReserveItemDto } from "../dtos/reserveItem.dto";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { MailService } from "../services/mail.service";
import { ReserveItemUserDto } from "../dtos/reserveItemUser.dto";
import { SmsService } from "../services/sms.service";
import { AdminGuard } from "../guards/admin.guard";
import { AuthGuard } from "../guards/auth.guard";

@Controller('item/management')
export class ItemManagementController {
    constructor(private smsService:SmsService,private readonly itemManagementService: ItemManagementService, private jwtTokenService: JwtTokenService, private mailService:MailService) { }

    @UseGuards(AdminGuard)
    @Post('reserve-item-by-admin')
    async reserveItemByAdmin(@Body() reserveItemData: ReserveItemDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.itemManagementService.reserveItemByAdmin(reserveItemData, userId);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteReservation(@Param('id') reservationId: string, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.itemManagementService.deleteReservation(reservationId, userId);
    }

    @UseGuards(AuthGuard)
    @Post('reserve-item-by-user')
    async reserveItemByUser(@Body() reserveItemUserData: ReserveItemUserDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.itemManagementService.reserveItemByUser(reserveItemUserData, userId);
    }

    @UseGuards(AuthGuard)
    @Get('get-reservations-by-item/:itemId')
    async getReservationsByItem(@Param('itemId') itemId: string) {
        return this.itemManagementService.getReservationsByItem(itemId);
    }

    @UseGuards(AuthGuard)
    @Put('update-reservation/:reservationId')
    async updateReservation(@Param('reservationId') reservationId: string, @Body() reservationData: ReserveItemDto) {
        return this.itemManagementService.updateReservation(reservationId, reservationData);
    }

    @UseGuards(AuthGuard)
    @Post('get-all-item-reservations')
    async getAllItemReservations(@Body() itemIds: {itemIds:string[]}) {
        return this.itemManagementService.getAllItemReservations(itemIds.itemIds);
    }

    @UseGuards(AuthGuard)
    @Post('get-all-item-future-reservations')
    async getAllItemFutureReservations(@Body() itemIds: {itemIds:string[]}) {
        return this.itemManagementService.getAllItemFutureReservations(itemIds.itemIds);
    }

    @UseGuards(AuthGuard)
    @Post('get-all-item-reservations-for-today')
    async getAllItemReservationsForTodayDate(@Body() itemIds: {itemIds:string[]}) {
        return this.itemManagementService.getAllItemReservationsForTodayDate(itemIds.itemIds);
    }
    
    @UseGuards(AdminGuard)
    @Post('mark-item-as-paid/:itemManagingId')
    async markItemAsPaid(@Param('itemManagingId') itemManagingId: string){
        return this.itemManagementService.markItemAsPaid(itemManagingId)
    }

}