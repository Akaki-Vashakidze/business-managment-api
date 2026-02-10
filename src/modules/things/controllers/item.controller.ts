import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ItemDto } from "../dtos/item.dto";
import { ItemsService } from "../services/items.service";
import { Helper } from "../utils/helper";
import { JwtTokenService } from "../services/jwt-token.service";
import { ObjectId } from "mongodb";
import { AdminGuard } from "../guards/admin.guard";
import { AuthGuard } from "../guards/auth.guard";

@Controller('item')
export class ItemController {
    constructor(private readonly itemsService: ItemsService, private jwtTokenService: JwtTokenService) { }

    @UseGuards(AdminGuard)
    @Post('create-item')
    async createitem(@Body() itemData: ItemDto, @Req() req: Request) {
        const userId = Helper.getUserIdFromHeaderToken(req, this.jwtTokenService);
        return this.itemsService.createItem(itemData, userId);
    }

    @UseGuards(AuthGuard)
    @Get('get-items-by-branch/:branchId')
    async getItemsByBranch(@Param('branchId') branchId: ObjectId) {
        return this.itemsService.getItemsByBranch(branchId);
    }

    @UseGuards(AdminGuard)
    @Delete('delete-item/:itemId')
    async deleteitem(@Param('itemId') itemId: string) {
    return this.itemsService.deleteItem(itemId);
    }

    @UseGuards(AdminGuard)
    @Put('update-item/:itemId')
    async updateitem(@Param('itemId') itemId: string, @Body() itemData: {name:string}) {
        return this.itemsService.updateItem(itemId, itemData);
    }   
    
}
